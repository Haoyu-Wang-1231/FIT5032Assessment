const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore();

const getEvents = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  try {
    const snap = await db.collection('events').get()
    const rows = await Promise.all(
      snap.docs.map(async (doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      }),
    )

    return rows
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

module.exports = { getEvents }
