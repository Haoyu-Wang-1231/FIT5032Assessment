const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { google } = require('googleapis')
const nodemailer = require('nodemailer')

const GMAIL = 'why1658129453@gmail.com'
const CLIENT_ID = '265542789915-ujk076piq74isl9hf80mjhf89omgjedj.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN =
  '1//04CZyQWrUA4ywCgYIARAAGAQSNwF-L9IrFIUy65ZYm4A9jgU6Pd0treAsqr4uFp_QPNAMwUcAQiYTxQAZWkwt1rJ79wlhwAJkgI4'

const sendMail = onCall(async (req) => {
  // const { to, subject, text, html } = req.data

  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const { to, subject, text, html, attachments } = req.data
  if (!to || !subject) {
    throw new HttpsError('invalid-argument', "Missing 'to' or 'subject'.")
  }

  const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2.setCredentials({ refresh_token: REFRESH_TOKEN })

  try {
    const accessToken = await oauth2.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    })

    const mailOptions = {
      from: GMAIL,
      to: to,
      subject: subject,
      text: text,
      attachments: attachments || []
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (err) {
    return err
  }
})

const sendEmailFromFunctions= async(request)=>{

  const to = request.to
  const subject = request.subject
  const text = request.text
  if (!to || !subject) {
    throw new HttpsError('invalid-argument', "Missing 'to' or 'subject'.")
  }
  const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2.setCredentials({ refresh_token: REFRESH_TOKEN })

  try {
    const accessToken = await oauth2.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    })

    const mailOptions = {
      from: GMAIL,
      to: to,
      subject: subject,
      text: text,
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (err) {
    return err
  }
}


module.exports = { sendMail, sendEmailFromFunctions }
