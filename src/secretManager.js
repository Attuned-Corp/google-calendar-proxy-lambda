const SecretsManager = require("aws-sdk").SecretsManager

const secretsManagerClient = new SecretsManager()

function assertEnvVar(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }

  return value
}

async function assertSecret(name) {
  const secretAsmName = assertEnvVar(`${name}_ASM_NAME`)

  const { SecretString: value } = await secretsManagerClient
      .getSecretValue({ SecretId: secretAsmName })
      .promise()

  if (!value) {
      throw new Error(`Missing ${secretAsmName} secret`)
  }
  return value
}

module.exports = {
  assertSecret
}