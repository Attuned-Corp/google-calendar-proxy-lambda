const timingSafeEqual = require("crypto").timingSafeEqual

const isAccessTokenValid = (accessToken) => {
    const serverAccessToken = process.env.PROXY_ACCESS_TOKEN || ""

    const accessTokenBuffer = Buffer.from(accessToken);
    const serverAccessTokenBuffer = Buffer.from(serverAccessToken);

    return timingSafeEqual(accessTokenBuffer, serverAccessTokenBuffer)
}

module.exports = {
    isAccessTokenValid
}