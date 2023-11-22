const timingSafeEqual = require("crypto").timingSafeEqual
const assertSecret = require('./secretManager').assertSecret

const isAccessTokenValid = async (accessToken) => {
  const serverAccessToken = await assertSecret("PROXY_LAMBDA_ACCESS_TOKEN")

  const accessTokenBuffer = Buffer.from(accessToken);
  const serverAccessTokenBuffer = Buffer.from(serverAccessToken);

  try {
    return timingSafeEqual(accessTokenBuffer, serverAccessTokenBuffer)
  } catch(_err) {
    return false
  }
}

module.exports = {
    isAccessTokenValid
}