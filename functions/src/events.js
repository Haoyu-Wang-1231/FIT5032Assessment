const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore()

function hasValidLatLng(lat, lng) {
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const getMapEvents = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  try {
    const snap = await db.collection('events').get()
    const output = []

    for (const doc of snap.docs) {
      const data = doc.data() || {}
      const lat = data.lat
      const lng = data.lng

      console.warn('[getMapEvents] drop invalid lat/lng:', {
          id: doc.id,
          lat: data.lat,
          lng: data.lng,
        })

      if (!hasValidLatLng(lat, lng)) {
        
        continue
      }

      output.push({ id: doc.id, ...data })
    }

    return output
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

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

module.exports = { getEvents, getMapEvents }
