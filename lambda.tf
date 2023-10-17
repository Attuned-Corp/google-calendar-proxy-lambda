resource "terraform_data" "google_calendar_proxy_lambda_source" {
  provisioner "local-exec" {
    working_dir = local.source_dir
    command     = "npm ci"
  }

  triggers_replace = {
    index   = sha256(file("${local.source_dir}/index.js"))
    package = sha256(file("${local.source_dir}/package.json"))
    lock    = sha256(file("${local.source_dir}/package-lock.json"))
    node    = sha256(join("", fileset(path.module, "${local.source_folder}/**/*.js")))
  }
}

data "archive_file" "google_calendar_proxy_lambda_zip" {
  source_dir  = local.source_dir
  output_path = "${local.source_dir}/../google-calendar-proxy-lambda.zip"
  type        = "zip"
  depends_on  = [terraform_data.google_calendar_proxy_lambda_source]
}

resource "aws_cloudwatch_log_group" "google_calendar_proxy_lambda" {
  name = "/aws/lambda/${aws_lambda_function.google_calendar_proxy_lambda.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "google_calendar_proxy_lambda" {
  name               = "google-calendar-proxy-lambda"
  assume_role_policy = data.aws_iam_policy_document.google_calendar_proxy_lambda.json
}

data "aws_iam_policy_document" "google_calendar_proxy_lambda" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "google_calendar_proxy_lambda_basic_execution" {
  role       = aws_iam_role.google_calendar_proxy_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "google_calendar_proxy_lambda" {
  function_name    = "google-calendar-proxy-lambda"
  filename         = data.archive_file.google_calendar_proxy_lambda_zip.output_path
  source_code_hash = data.archive_file.google_calendar_proxy_lambda_zip.output_base64sha256
  package_type     = "Zip"
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  role             = aws_iam_role.google_calendar_proxy_lambda.arn
  memory_size      = 256
  publish          = true

  environment {
    variables = {
      GCAL_CLIENT_EMAIL         = var.client_email
      GCAL_PRIVATE_KEY          = var.private_key
      PROXY_LAMBDA_ACCESS_TOKEN = var.proxy_lambda_access_token
      HASH_SECRET               = var.hash_secret
      ALLOWED_EMAIL_DOMAINS     = join(",", var.allowed_email_domains)
    }
  }
}
