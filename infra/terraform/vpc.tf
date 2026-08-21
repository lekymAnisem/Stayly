resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                         = "${local.name_prefix}-public-${count.index + 1}"
    "kubernetes.io/cluster/${local.name_prefix}" = "shared"
    "kubernetes.io/role/elb"                     = "1"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(var.public_subnet_cidrs)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "monitoring" {
  name        = "${local.name_prefix}-monitoring-sg"
  description = "Security group for the monitoring EC2 instance"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "SSH from admin CIDRs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_allowed_cidr_blocks
  }

  ingress {
    description = "Grafana from monitoring CIDRs"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.monitoring_allowed_cidr_blocks
  }

  ingress {
    description = "Prometheus from monitoring CIDRs"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = var.monitoring_allowed_cidr_blocks
  }

  ingress {
    description = "Alertmanager from monitoring CIDRs"
    from_port   = 9093
    to_port     = 9093
    protocol    = "tcp"
    cidr_blocks = var.monitoring_allowed_cidr_blocks
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-monitoring-sg"
  }
}
