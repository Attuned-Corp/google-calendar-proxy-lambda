const timingSafeEqual = require("crypto").timingSafeEqual

const isAccessTokenValid = (accessToken) => {
  const serverAccessToken = process.env.PROXY_LAMBDA_ACCESS_TOKEN || ""

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