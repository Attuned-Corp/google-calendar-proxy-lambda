# lambda-gcal

## Variables
- `aws_region`: AWS Region to deploy in
- `gcal_client_email`: Google Calendar Email to use for Client
- `gcal_private_key`: Google Calendar Private Key to use for Client

## Output
- `lambda_gcal_id`: ID of Google Calendar Lambda Created
- `lambda_gcal_api_endpoint`: API Endpoint to Invoke Google Calendar Lambda

## Usage
```terraform
module "lambda_gcal" {
  source = "git@github.com:terraform-aws-modules/terraform-aws-lambda.git?ref=(ref)"

  aws_region        = "us-west-2"
  gcal_client_email = ""
  gcal_private_key  = ""
}
```
