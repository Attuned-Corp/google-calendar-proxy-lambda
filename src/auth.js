const timingSafeEqual = require("crypto").timingSafeEqual
const assertSecret = require('./secretManager').assertSecret

const isAccessTokenValid = async (accessToken) => {
  const proxyCredentials = JSON.parse(await assertSecret("PROXY_SECRET_ID"))

  const serverAccessToken = proxyCredentials.access_token || ""

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