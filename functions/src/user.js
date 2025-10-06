const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore()


const getUserInfo = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const userId = request.auth.uid || {}
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId is required.')
  }

  try {
    const snap = await db.collection('users').doc(userId).get()
    if (!snap.exists) {
      return { exists: false, profile: null }
    }
    return { exists: true, profile: snap.data() }
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

module.exports = { getUserInfo }
