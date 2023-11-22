variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed that will not be hashed"
  type        = list(string)
}
