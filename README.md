# google-calendar-proxy-lambda

## Requirements
- `node` 18

## Set up: AWS secrets manager
As a pre-requisite, you will need to set up 2 secrets.
- Google credentials: Google credentials info for accessing Gcal API (json format - should contain `private_key` and `client_email`)
- Proxy credentials: Credentials to access proxy (json with following 2 keys)
  - `access_token`: Access Token required to invoke the Lambda (recommended to generate a token at least 20 characters long)
  - `hash_secret`: Secret for hashing data (recommended to generate a secret at least 20 characters long)

## Variables
- `aws_region`: AWS Region to deploy in
- `allowed_email_domains`: Allowed email domains that will not be hashed
- `gcal_secret_arn`: ARN of the secret in AWS secrets manager that holds your google credentials json info
- `proxy_secret_arn`: ARN of the secret in AWS secrets manager that holds your proxy credentials json info
- `gcal_secret_name`: Name of the secret in AWS secrets manager that holds your google credentials json info
- `proxy_secret_name`: Name of the secret in AWS secrets manager that holds your proxy credentials json info

## Output
- `google_calendar_proxy_lambda_id`: ID of Google Calendar Lambda Created
- `google_calendar_proxy_lambda_api_endpoint`: API Endpoint to Invoke Google Calendar Lambda

## Usage
Replace (ref) with the specific commit hash to deploy

```terraform
module "attuned_google_calendar_proxy_lambda" {
  source = "git@github.com:Attuned-Corp/google-calendar-proxy-lambda.git?ref=(ref)"

  aws_region            = "us-west-2"
  allowed_email_domains = ["example.com"]
  gcal_secret_arn        = "arn:aws:secretsmanager:us-west-2:test:secret:gcal_secret"
  proxy_secret_arn       = "arn:aws:secretsmanager:us-west-2:test:secret:proxy_secret"
  gcal_secret_name        = "gcal_secret"
  proxy_secret_name       = "proxy_secret"
}
```
