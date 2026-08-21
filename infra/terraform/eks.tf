resource "aws_iam_role" "eks_cluster" {
  name = "${local.name_prefix}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster.name
}

resource "aws_iam_role" "eks_node" {
  name = "${local.name_prefix}-eks-node-role"

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

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_ecr_readonly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node.name
}

resource "aws_security_group" "eks_cluster" {
  name        = "${local.name_prefix}-eks-cluster-sg"
  description = "Security group for the EKS cluster"
  vpc_id      = aws_vpc.this.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-eks-cluster-sg"
  }
}

resource "aws_security_group" "eks_node" {
  name        = "${local.name_prefix}-eks-node-sg"
  description = "Security group for EKS managed worker nodes"
  vpc_id      = aws_vpc.this.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-eks-node-sg"
  }
}

resource "aws_security_group_rule" "eks_cluster_to_node" {
  description              = "Allow cluster to communicate with nodes"
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_cluster.id
  security_group_id        = aws_security_group.eks_node.id
}

resource "aws_security_group_rule" "eks_node_to_cluster" {
  description              = "Allow nodes to communicate with cluster"
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_node.id
  security_group_id        = aws_security_group.eks_cluster.id
}

resource "aws_eks_cluster" "this" {
  count    = var.eks_enabled ? 1 : 0
  name     = local.name_prefix
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.eks_version

  vpc_config {
    subnet_ids              = aws_subnet.public[*].id
    security_group_ids      = [aws_security_group.eks_cluster.id]
    endpoint_private_access = false
    endpoint_public_access  = true
    public_access_cidrs     = var.eks_public_access_cidr_blocks
  }

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]
}

resource "aws_eks_access_entry" "admin_role" {
  count = var.eks_enabled && var.eks_admin_role_arn != "" ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  principal_arn = var.eks_admin_role_arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "admin_role" {
  count = var.eks_enabled && var.eks_admin_role_arn != "" ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = var.eks_admin_role_arn

  access_scope {
    type = "cluster"
  }
}

resource "aws_eks_access_entry" "monitoring_role" {
  count = var.eks_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  principal_arn = aws_iam_role.monitoring.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "monitoring_role" {
  count = var.eks_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.this[0].name
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = aws_iam_role.monitoring.arn

  access_scope {
    type = "cluster"
  }
}

resource "aws_eks_node_group" "this" {
  count           = var.eks_enabled ? 1 : 0
  cluster_name    = aws_eks_cluster.this[0].name
  node_group_name = "${local.name_prefix}-node-group"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.public[*].id
  version         = var.eks_version

  instance_types = var.eks_node_instance_types
  capacity_type  = var.eks_node_capacity_type
  disk_size      = var.eks_node_disk_size

  scaling_config {
    min_size     = var.eks_node_min_size
    desired_size = var.eks_node_desired_size
    max_size     = var.eks_node_max_size
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_ecr_readonly,
  ]
}
