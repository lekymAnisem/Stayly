resource "aws_iam_role" "jenkins" {
  name = "${var.app_name}-${var.environment}-jenkins-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "jenkins_ssm" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "jenkins" {
  name = "${var.app_name}-${var.environment}-jenkins-profile"
  role = aws_iam_role.jenkins.name
}

resource "aws_security_group" "jenkins" {
  name        = "${local.name_prefix}-jenkins-sg"
  description = "Security group for the Jenkins + SonarQube EC2 instance"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "SSH from admin CIDRs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_allowed_cidr_blocks
  }

  ingress {
    description = "Jenkins web UI from admin CIDRs"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.admin_allowed_cidr_blocks
  }

  ingress {
    description = "SonarQube web UI from admin CIDRs"
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = var.admin_allowed_cidr_blocks
  }

  ingress {
    description = "AI agent webhook from admin and monitoring CIDRs"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = distinct(concat(var.admin_allowed_cidr_blocks, var.monitoring_allowed_cidr_blocks))
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-jenkins-sg"
  }
}

resource "aws_instance" "jenkins" {
  ami                    = var.ubuntu_ami_id
  instance_type          = var.jenkins_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.jenkins.id]
  key_name               = aws_key_pair.ssh.key_name
  iam_instance_profile   = aws_iam_instance_profile.jenkins.name

  root_block_device {
    volume_type = "gp3"
    volume_size = var.jenkins_root_volume_size
    encrypted   = true
  }

  user_data = templatefile("${path.module}/userdata-jenkins.sh", {
    sonarqube_version = var.sonarqube_version
  })

  tags = {
    Name = "${local.name_prefix}-jenkins"
  }
}

resource "aws_eip" "jenkins" {
  instance = aws_instance.jenkins.id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-${var.environment}-jenkins-eip"
  }
}

# ── Jenkins IAM policy: EKS describe + ECR push ──────────────────────

data "aws_iam_policy_document" "jenkins_eks_ecr" {
  statement {
    sid    = "DescribeTargetEKSCluster"
    effect = "Allow"
    actions = [
      "eks:DescribeCluster"
    ]
    resources = [
      "arn:aws:eks:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/${local.name_prefix}"
    ]
  }

  statement {
    sid    = "GetECRAuthToken"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ManageProjectECRImages"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = [
      "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${lower(var.app_name)}-*"
    ]
  }
}

resource "aws_iam_policy" "jenkins_eks_ecr" {
  name   = "${local.name_prefix}-jenkins-eks-ecr-policy"
  policy = data.aws_iam_policy_document.jenkins_eks_ecr.json
}

resource "aws_iam_role_policy_attachment" "jenkins_eks_ecr" {
  role       = aws_iam_role.jenkins.name
  policy_arn = aws_iam_policy.jenkins_eks_ecr.arn
}

# ── EKS access entry for Jenkins ─────────────────────────────────────

resource "aws_eks_access_entry" "jenkins" {
  count = var.eks_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  principal_arn = aws_iam_role.jenkins.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "jenkins" {
  count = var.eks_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  principal_arn = aws_iam_role.jenkins.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [
    aws_eks_access_entry.jenkins
  ]
}
