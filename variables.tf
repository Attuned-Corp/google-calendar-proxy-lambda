variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed that will not be hashed"
  type        = list(string)
}

variable "gcal_secret_id" {
  description = "What would you like the secret id to be for the Google Calendar credentials?"
  type        = string
  default     = "gcal_secret_id"
}

variable "proxy_secret_id" {
  description = "What would you like the secret id to be for the proxy credentials (access token and hash secret)?"
  type        = string
  default     = "proxy_secret_id"
}
