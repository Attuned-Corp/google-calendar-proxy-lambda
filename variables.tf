variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed that will not be hashed"
  type        = list(string)
}

variable "gcal_secret_arn" {
  description = "What is your secret arn for the Google Calendar credentials?"
  type        = string
  default     = "gcal_secret_arn"
}

variable "proxy_secret_arn" {
  description = "What is your secret arn for the proxy credentials (access token and hash secret)?"
  type        = string
  default     = "proxy_secret_arn"
}

variable "gcal_secret_name" {
  description = "What is your secret name for the Google Calendar credentials?"
  type        = string
  default     = "gcal_secret_name"
}

variable "proxy_secret_name" {
  description = "What is your secret name for the proxy credentials (access token and hash secret)?"
  type        = string
  default     = "proxy_secret_name"
}
