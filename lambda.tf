resource "terraform_data" "lambda_gcal_dependencies" {
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

data "archive_file" "lambda_gcal_zip" {
  source_dir  = local.source_dir
  output_path = "${local.source_dir}/lambda-gcal.zip"
  type        = "zip"
  depends_on  = [terraform_data.lambda_gcal_dependencies]
}

resource "aws_cloudwatch_log_group" "lambda_gcal" {
  name = "/aws/lambda/${aws_lambda_function.lambda_gcal.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_gcal" {
  name               = "lambda-gcal"
  assume_role_policy = data.aws_iam_policy_document.lambda_gcal.json
}

data "aws_iam_policy_document" "lambda_gcal" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "lambda_gcal_basic_execution" {
  role       = aws_iam_role.lambda_gcal.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "lambda_gcal" {
  function_name    = "lambda-gcal"
  filename         = data.archive_file.lambda_gcal_zip.output_path
  source_code_hash = data.archive_file.lambda_gcal_zip.output_base64sha256
  package_type     = "Zip"
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  role             = aws_iam_role.lambda_gcal.arn
  publish          = true

  environment {
    variables = {
      GCAL_CLIENT_EMAIL     = var.client_email
      GCAL_PRIVATE_KEY      = var.private_key
      LAMBDA_ACCESS_TOKEN   = var.lambda_access_token
      HASH_SECRET           = var.hash_secret
      ALLOWED_EMAIL_DOMAINS = join(",", var.allowed_email_domains)
    }
  }
}
