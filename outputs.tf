output "google_calendar_proxy_lambda_id" {
  description = "ID of Google Calendar proxy lambda"
  value       = aws_lambda_function.google_calendar_proxy_lambda.id
}

output "google_calendar_proxy_lambda_api_invoke_endpoint" {
  description = "API Endpoint to invoke Google Calendar proxy lambda"
  value       = format("%s%s", aws_apigatewayv2_stage.google_calendar_proxy_lambda_v1.invoke_url, element(split(" ", aws_apigatewayv2_route.google_calendar_proxy_lambda.route_key), 1))
}
