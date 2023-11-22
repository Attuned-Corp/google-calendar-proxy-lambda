# google-calendar-proxy-lambda

## Requirements
- `node` 18

## Variables
- `aws_region`: AWS Region to deploy in
- `allowed_email_domains`: Allowed email domains that will not be hashed

## AWS secrets manager
After applying terraform changes, you will need to go in and set values for the following keys in AWS secrets manager:
- `gcal_proxy_lambda_private_key`: Private Key for accessing Google Calendar API
- `gcal_proxy_lambda_client_email`: Google Calendar API Client Email
- `gcal_proxy_lambda_access_token`: Access Token required to invoke the Lambda (recommended to generate a token at least 20 characters long)
- `gcal_proxy_lambda_hash_secret`: Secret for hashing data (recommended to generate a secret at least 20 characters long)

## Output
- `google_calendar_proxy_lambda_id`: ID of Google Calendar Lambda Created
- `google_calendar_proxy_lambda_api_endpoint`: API Endpoint to Invoke Google Calendar Lambda

## Usage
Replace (ref) with the specific commit hash to deploy

```terraform
module "attuned_google_calendar_proxy_lambda" {
  source = "git@github.com:Attuned-Corp/google-calendar-proxy-lambda.git?ref=(ref)"

  aws_region                = "us-west-2"
  allowed_email_domains     = ["example.com"]
}
```
