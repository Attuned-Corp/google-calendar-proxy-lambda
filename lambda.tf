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
  output_path = "${path.module}/google-calendar-proxy-lambda.zip"
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

resource "aws_secretsmanager_secret" "gcal_secret_id" {
  name = var.gcal_secret_id
}

resource "aws_secretsmanager_secret" "proxy_secret_id" {
  name = var.proxy_secret_id
}

resource "aws_iam_policy" "secrets" {
  name = "tf-google-calendar-proxy-lambda-secrets"
  path = "/"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect   = "Allow"
        Resource = "${aws_secretsmanager_secret.gcal_secret_id.arn}"
      },
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect   = "Allow"
        Resource = "${aws_secretsmanager_secret.proxy_secret_id.arn}"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "secrets" {
  role       = aws_iam_role.google_calendar_proxy_lambda.name
  policy_arn = aws_iam_policy.secrets.arn
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
      GCAL_SECRET_ID_ASM_NAME  = aws_secretsmanager_secret.gcal_secret_id.name
      PROXY_SECRET_ID_ASM_NAME = aws_secretsmanager_secret.proxy_secret_id.name
      ALLOWED_EMAIL_DOMAINS    = join(",", var.allowed_email_domains)
    }
  }
}
