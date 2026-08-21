output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "ecr_repository_urls" {
  description = "Map of microservice names to ECR repository URLs"
  value       = { for name, repo in aws_ecr_repository.microservice : name => repo.repository_url }
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = var.eks_enabled ? aws_eks_cluster.this[0].name : null
}

output "eks_cluster_endpoint" {
  description = "Endpoint of the EKS cluster API server"
  value       = var.eks_enabled ? aws_eks_cluster.this[0].endpoint : null
}

output "eks_cluster_ca_certificate" {
  description = "Base64-encoded CA certificate for the EKS cluster"
  value       = var.eks_enabled ? aws_eks_cluster.this[0].certificate_authority[0].data : null
  sensitive   = true
}

output "eks_node_group_name" {
  description = "Name of the EKS managed node group"
  value       = var.eks_enabled ? aws_eks_node_group.this[0].node_group_name : null
}

output "monitoring_instance_public_ip" {
  description = "Public IP of the monitoring EC2 instance"
  value       = aws_instance.monitoring.public_ip
}

output "monitoring_instance_public_dns" {
  description = "Public DNS of the monitoring EC2 instance"
  value       = aws_instance.monitoring.public_dns
}

output "grafana_url" {
  description = "Grafana access URL"
  value       = var.grafana_enabled ? "http://${aws_eip.monitoring.public_ip}:3000" : null
}

output "prometheus_url" {
  description = "Prometheus access URL"
  value       = var.prometheus_enabled ? "http://${aws_eip.monitoring.public_ip}:9090" : null
}

output "alertmanager_url" {
  description = "Alertmanager access URL"
  value       = var.alertmanager_enabled ? "http://${aws_eip.monitoring.public_ip}:9093" : null
}

output "ssh_monitoring_command" {
  description = "SSH command to connect to the monitoring instance"
  value       = "ssh -i ${var.ssh_private_key_path} ubuntu@${aws_eip.monitoring.public_ip}"
}

output "configure_kubectl_command" {
  description = "Command to configure kubectl for the EKS cluster"
  value       = var.eks_enabled ? "aws eks update-kubeconfig --region ${var.aws_region} --name ${local.name_prefix}" : null
}

output "jenkins_instance_public_ip" {
  description = "Public IP of the Jenkins EC2 instance"
  value       = aws_instance.jenkins.public_ip
}

output "jenkins_instance_public_dns" {
  description = "Public DNS of the Jenkins EC2 instance"
  value       = aws_instance.jenkins.public_dns
}

output "jenkins_url" {
  description = "Jenkins access URL"
  value       = "http://${aws_eip.jenkins.public_ip}:8080"
}

output "sonarqube_url" {
  description = "SonarQube access URL"
  value       = "http://${aws_eip.jenkins.public_ip}:9000"
}

output "ssh_jenkins_command" {
  description = "SSH command to connect to the Jenkins instance"
  value       = "ssh -i ${var.ssh_private_key_path} ubuntu@${aws_eip.jenkins.public_ip}"
}
