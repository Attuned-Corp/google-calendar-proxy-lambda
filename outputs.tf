output "lambda_gcal_id" {
  description = "ID of Google Calendar Lambda Created"
  value = aws_lambda_function.lambda_gcal.id
}

output "lambda_gcal_api_endpoint" {
  description = "API Endpoint to Invoke Google Calendar Lambda"
  value = aws_apigatewayv2_stage.lambda_gcal_v1.invoke_url
}
