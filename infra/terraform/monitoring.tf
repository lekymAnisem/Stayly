data "aws_iam_policy_document" "monitoring_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "monitoring" {
  name               = "${local.name_prefix}-monitoring-role"
  assume_role_policy = data.aws_iam_policy_document.monitoring_assume_role.json
}

resource "aws_iam_role_policy_attachment" "monitoring_ssm" {
  role       = aws_iam_role.monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "monitoring_eks_describe" {
  statement {
    sid    = "DescribeStaylyEKSCluster"
    effect = "Allow"
    actions = [
      "eks:DescribeCluster"
    ]
    resources = [
      "arn:aws:eks:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/${local.name_prefix}"
    ]
  }
}

resource "aws_iam_policy" "monitoring_eks_describe" {
  name   = "StaylyEKSDescribeCluster"
  policy = data.aws_iam_policy_document.monitoring_eks_describe.json
}

resource "aws_iam_role_policy_attachment" "monitoring_eks_describe" {
  role       = aws_iam_role.monitoring.name
  policy_arn = aws_iam_policy.monitoring_eks_describe.arn
}

resource "aws_iam_instance_profile" "monitoring" {
  name = "${local.name_prefix}-monitoring-profile"
  role = aws_iam_role.monitoring.name
}

resource "aws_instance" "monitoring" {
  ami                    = var.ubuntu_ami_id
  instance_type          = var.monitoring_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.monitoring.id]
  key_name               = aws_key_pair.ssh.key_name
  iam_instance_profile   = aws_iam_instance_profile.monitoring.name

  root_block_device {
    volume_type = "gp3"
    volume_size = var.monitoring_root_volume_size
    encrypted   = true
  }

  user_data = templatefile("${path.module}/userdata-monitoring.sh", {
    prometheus_enabled     = var.prometheus_enabled
    prometheus_version     = var.prometheus_version
    grafana_enabled        = var.grafana_enabled
    grafana_admin_password = var.grafana_admin_password
    alertmanager_enabled   = var.alertmanager_enabled
    alertmanager_version   = var.alertmanager_version
    app_name               = var.app_name
    environment            = var.environment
  })

  tags = {
    Name = "${local.name_prefix}-monitoring"
  }
}

resource "aws_eip" "monitoring" {
  instance = aws_instance.monitoring.id
  domain   = "vpc"

  tags = {
    Name = "${local.name_prefix}-monitoring-eip"
  }
}
