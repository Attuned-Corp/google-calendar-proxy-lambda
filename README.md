# google-calendar-proxy-lambda

## Requirements
- `node` 18

## Variables
- `aws_region`: AWS Region to deploy in
- `allowed_email_domains`: Allowed email domains that will not be hashed

## AWS secrets manager
After applying terraform changes, you will need to go in and set values for the following keys in AWS secrets manager. If you used custom secret ids, make sure you find the secrets with the ids you entered into terraform as variables.
- `gcal_secret_id`: Google credentials info (json format)
- `proxy_secret_id`: Credentials to access proxy (json with following 2 keys)
  - `access_token`: Access Token required to invoke the Lambda (recommended to generate a token at least 20 characters long)
  - `hash_secret`: Secret for hashing data (recommended to generate a secret at least 20 characters long)

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
  gcal_secret_id        = "gcal_secret_id"
  proxy_secret_id       = "proxy_secret_id"
}
```
