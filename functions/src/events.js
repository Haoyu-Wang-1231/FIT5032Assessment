const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore()

function hasValidLatLng(lat, lng) {
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const getEventListByIds = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const eventIdList = request.data?.idList
  if (!Array.isArray(eventIdList) || eventIdList.length === 0) {
    return { exists: false, events: [] }
  }

  try {
    const docRefs = eventIdList.map((id) => db.collection('events').doc(id))
    const snapshots = await db.getAll(...docRefs)

    const documents = snapshots.map((snap, index) => {
      if (!snap.exists) return { id: idList[index], error: 'Not found' }
      return { id: snap.id, ...snap.data() }
    })

    return {events: documents}
  } catch (error) {
    console.log(error)
  }
})

const getEventById = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const eventId = request.data?.id ?? request.data?.eventId
  if (!eventId) {
    throw new HttpsError('Unexisted', 'please check event id')
  }

  try {
    const docRef = db.collection('events').doc(eventId)
    const snap = await docRef.get()
    if (!snap.exists) {
      throw new HttpsError('not-found', `event "${eventId}" not found.`)
    }

    return { exists: true, event: snap.data() }
  } catch (error) {
    console.log(error)
  }
})

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

      if (!hasValidLatLng(lat, lng)) {
        console.warn('[getMapEvents] drop invalid lat/lng:', {
          id: doc.id,
          lat: data.lat,
          lng: data.lng,
        })
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

module.exports = { getEvents, getMapEvents, getEventById, getEventListByIds}
