variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed that will not be hashed"
  type        = list(string)
}

variable "private_key_secret_id" {
  description = "What would you like the secret id to be for the Google Calendar private key?"
  type        = string
  default     = "gcal_proxy_lambda_private_key"
}

variable "client_email_secret_id" {
  description = "What would you like the secret id to be for the Google Calendar API Client Email?"
  type        = string
  default     = "gcal_proxy_lambda_client_email"
}

variable "proxy_lambda_access_token_secret_id" {
  description = "What would you like the secret id to be for the access token required to invoke the Lambda?"
  type        = string
  default     = "gcal_proxy_lambda_access_token"
}

variable "hash_secret_secret_id" {
  description = "What would you like the secret id to be for the secret for hashing data?"
  type        = string
  default     = "gcal_proxy_lambda_hash_secret"
}
