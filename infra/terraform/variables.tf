variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Deployment environment used for resource naming"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "stayly"
}

variable "ubuntu_ami_id" {
  description = "Ubuntu AMI ID for EC2 instances"
  type        = string
  default     = "ami-06259b63260eddc13"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs. EKS needs at least two subnets in different availability zones."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "ssh_key_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
  default     = "grab-key"
}

variable "ssh_public_key" {
  description = "Public key material to create the EC2 key pair used for SSH access (derived from /Users/admin/Downloads/grab-key.pem)"
  type        = string
  default     = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCcxaiY+gypXS9w2rTWCxg4Zo0x4sHQQ6WCynHDCyZbyPh09m16JIZW/DwhQmGZjUGEs/C4ISqt0+7rtJorWM9TDRnObNy1HmbzFrknj7TBkITt78by76mpoNtnhZC5cDJ/fswNRhMsLR7k1ANnloDU88br4Ab1jMtDnfOkAqYMY6VnqZeiYhZYRfaFox+NU4doJ6DU2RK0YMEy7ypeSCsd0d4IUFLJA96JwlQgjRhj5qf2Y3EAfX0Lh5ti80Fr9wrBGeR/by//1KFgIzUPcS9n7NE5IoFDmaaquS1c6H71IhUl+blLXlO5oSDABxLLa2n6z32a2RaJ7VA44VBuF4u/"
}

variable "ssh_private_key_path" {
  description = "Local private key path used in generated SSH helper commands"
  type        = string
  default     = "/Users/admin/Downloads/grab-key.pem"
}

variable "admin_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to SSH into the EC2 servers"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "monitoring_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access Grafana, Prometheus, and optional Alertmanager"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "monitoring_instance_type" {
  description = "EC2 instance type for the monitoring server"
  type        = string
  default     = "c7i-flex.large"
}

variable "monitoring_root_volume_size" {
  description = "Root EBS volume size in GB for the monitoring server"
  type        = number
  default     = 20
}

variable "prometheus_enabled" {
  description = "Whether to install Prometheus on the monitoring server"
  type        = bool
  default     = true
}

variable "prometheus_version" {
  description = "Prometheus version to install"
  type        = string
  default     = "2.51.2"
}

variable "grafana_enabled" {
  description = "Whether to install Grafana on the monitoring server"
  type        = bool
  default     = true
}

variable "grafana_admin_password" {
  description = "Optional Grafana admin password. Leave empty to use Grafana's default first-login flow."
  type        = string
  sensitive   = true
  default     = ""
}

variable "alertmanager_enabled" {
  description = "Whether to install and expose Alertmanager on port 9093"
  type        = bool
  default     = false
}

variable "alertmanager_version" {
  description = "Alertmanager version to install when alertmanager_enabled is true"
  type        = string
  default     = "0.27.0"
}

variable "microservice_names" {
  description = "List of microservice names to create ECR repositories for"
  type        = list(string)
  default     = ["backend", "frontend"]
}

variable "ecr_image_tag_mutability" {
  description = "ECR image tag mutability: MUTABLE or IMMUTABLE"
  type        = string
  default     = "MUTABLE"
}

variable "ecr_scan_on_push" {
  description = "Whether to scan ECR images on push"
  type        = bool
  default     = true
}

variable "ecr_force_delete" {
  description = "Whether Terraform can delete ECR repositories even if they contain images"
  type        = bool
  default     = true
}

variable "eks_enabled" {
  description = "Whether to create the EKS cluster and managed worker nodes for backend/frontend workloads"
  type        = bool
  default     = true
}

variable "eks_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.36"
}

variable "eks_public_access_cidr_blocks" {
  description = "CIDR blocks allowed to reach the public EKS API endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS managed worker nodes"
  type        = list(string)
  default     = ["c7i-flex.large"]
}

variable "eks_node_capacity_type" {
  description = "Capacity type for EKS managed worker nodes"
  type        = string
  default     = "ON_DEMAND"
}

variable "eks_node_disk_size" {
  description = "Disk size in GB for EKS worker nodes"
  type        = number
  default     = 20
}

variable "eks_node_min_size" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 1
}

variable "eks_node_desired_size" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_max_size" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 3
}

variable "eks_admin_role_arn" {
  description = "IAM principal ARN to grant admin access to the EKS cluster (e.g. Jenkins EC2 instance role or an IAM user)"
  type        = string
  default     = ""
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for the Jenkins server"
  type        = string
  default     = "m7i-flex.large"
}

variable "jenkins_root_volume_size" {
  description = "Root EBS volume size in GB for the Jenkins server"
  type        = number
  default     = 20
}

variable "sonarqube_version" {
  description = "SonarQube version to install on the Jenkins server"
  type        = string
  default     = "10.6.0.92116"
}


