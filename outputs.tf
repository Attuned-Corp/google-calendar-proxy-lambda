output "lambda_gcal_id" {
  value = aws_lambda_function.lambda_gcal.id
}

output "lambda_gcal_api_endpoint" {
  value = aws_apigatewayv2_stage.lambda_gcal_v1.invoke_url
}
