variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "client_email" {
  description = "Google Calendar API Client Email"
  type        = string
}

variable "private_key" {
  description = "Private Key for accessing Google Calendar API"
  type        = string
  sensitive   = true
}

variable "proxy_lambda_access_token" {
  description = "Access Token required to invoke the Lambda"
  type        = string
  sensitive   = true
}

variable "hash_secret" {
  description = "Secret for hashing data"
  type        = string
  sensitive   = true
}

variable "allowed_email_domains" {
  description = "Email domains allowed that will not be hashed"
  type        = list(string)
}
