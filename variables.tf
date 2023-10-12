variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "gcal_client_email" {
  description = "Google Calendar Email to use for Client"
  type        = string
  sensitive   = true
}

variable "gcal_private_key" {
  description = "Google Calendar Private Key to use for Client"
  type        = string
  sensitive   = true
}
