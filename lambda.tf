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

resource "aws_iam_role" "lambda_gcal" {
  name               = "lambda-gcal"
  assume_role_policy = data.aws_iam_policy_document.lambda_gcal.json
}

resource "aws_lambda_function" "lambda_gcal" {
  function_name    = "lambda-gcal"
  filename         = data.archive_file.lambda_gcal_zip.output_path
  source_code_hash = data.archive_file.lambda_gcal_zip.output_base64sha256
  package_type     = "zip"
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  role             = aws_iam_role.lambda_gcal.arn
  publish          = true

  environment {
    variables = {
      GCAL_CLIENT_EMAIL = var.gcal_client_email
      GCAL_PRIVATE_KEY  = var.gcal_private_key
    }
  }
}
