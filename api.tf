resource "aws_apigatewayv2_api" "lambda_gcal" {
  name                         = "lambda-gcal"
  protocol_type                = "HTTP"
  api_key_selection_expression = "$request.header.x-api-key"
}

resource "aws_apigatewayv2_stage" "lambda_gcal_v1" {
  api_id = aws_apigatewayv2_api.lambda_gcal.id

  name        = "v1"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lambda_gcal.arn

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

resource "aws_apigatewayv2_integration" "lambda_gcal" {
  api_id = aws_apigatewayv2_api.lambda_gcal.id

  integration_uri        = aws_lambda_function.lambda_gcal.qualified_invoke_arn
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lambda_gcal" {
  api_id = aws_apigatewayv2_api.lambda_gcal.id

  route_key = "POST /invoke"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_gcal.id}"
}

resource "aws_lambda_permission" "lambda_gcal" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_gcal.function_name
  qualifier     = aws_lambda_function.lambda_gcal.version
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_gcal.execution_arn}/*/*"

  lifecycle {
    create_before_destroy = true
  }
}