# lambda-gcal

## Variables
- `aws_region`: AWS Region to deploy in
- `client_email`: Google Calendar API Client Email
- `private_key`: Private Key for accessing Google Calendar API
- `lambda_access_token`: Access Token required to invoke the Lambda
- `hash_secret`: Secret for hashing data
- `allowed_email_domains`: Email domains allowed that will not be hashed

## Output
- `lambda_gcal_id`: ID of Google Calendar Lambda Created
- `lambda_gcal_api_endpoint`: API Endpoint to Invoke Google Calendar Lambda

## Usage
```terraform
module "lambda_gcal" {
  source = "git@github.com:terraform-aws-modules/terraform-aws-lambda.git?ref=(ref)"

  aws_region            = "us-west-2"
  client_email          = "example@example.com"
  private_key           = "-----BEGIN PRIVATE KEY-----..."
  lambda_access_token   = "mP8er6zziP"
  hash_secret           = "Q7ApA0hNOP"
  allowed_email_domains = ["example.com"]
}
```
