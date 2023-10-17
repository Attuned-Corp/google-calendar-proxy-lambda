resource "aws_apigatewayv2_api" "google_calendar_proxy_lambda" {
  name                         = "google-calendar-proxy-lambda"
  protocol_type                = "HTTP"
  api_key_selection_expression = "$request.header.x-api-key"
}

resource "aws_apigatewayv2_stage" "google_calendar_proxy_lambda_v1" {
  api_id = aws_apigatewayv2_api.google_calendar_proxy_lambda.id

  name        = "v1"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.google_calendar_proxy_lambda.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_apigatewayv2_integration" "google_calendar_proxy_lambda" {
  api_id = aws_apigatewayv2_api.google_calendar_proxy_lambda.id

  integration_uri        = aws_lambda_function.google_calendar_proxy_lambda.qualified_invoke_arn
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "google_calendar_proxy_lambda" {
  api_id = aws_apigatewayv2_api.google_calendar_proxy_lambda.id

  route_key = "POST /invoke"
  target    = "integrations/${aws_apigatewayv2_integration.google_calendar_proxy_lambda.id}"
}

resource "aws_lambda_permission" "google_calendar_proxy_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.google_calendar_proxy_lambda.function_name
  qualifier     = aws_lambda_function.google_calendar_proxy_lambda.version
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.google_calendar_proxy_lambda.execution_arn}/*/*"

  lifecycle {
    create_before_destroy = true
  }
}