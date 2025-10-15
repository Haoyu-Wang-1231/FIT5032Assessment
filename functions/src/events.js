const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore()

function hasValidLatLng(lat, lng) {
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const removeEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const claims = request.auth.token

  if (claims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can create events.')
  }

  const eid = request.data.id
  if(!eid){
    throw new HttpsError('invalid-argument', 'event id is required.')
  }

  try{
    await db.collection('events').doc(eid).delete()
    return {ok: true, deleted: eid}

  }catch(err){
    console.log(err)
  }
// const recipeId = request.data?.id || {}
//   if (!recipeId || typeof recipeId !== 'string') {
//     throw new HttpsError('invalid-argument', 'recipeId is required.')
//   }

//   try {
//     await db.collection('recipes').doc(request.data.id).delete()
//     return { ok: true, deleted: request.data.id }
//   } catch (error) {
//     logger.info(
//       `Failed to delete recipe ${request.data.id} by ${request.auth.uid}: ${error.message}`,
//     )
//     throw new HttpsError(error)
//   }

})

const modifyEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const claims = request.auth.token

  if (claims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can create events.')
  }
  const uid = request.auth.uid
  const eid = request.data.id
  const data = request.data || {}
  const title = sanitizePlainText(data.title, 50)
  const organizer = sanitizePlainText(data.organizer, 50)

  const category = sanitizePlainText(data.organizer, 50)
  const description = sanitizePlainText(data.organizer, 150)
  if (!data.date) {
    throw new HttpsError('invalid-argument', 'Date is required.')
  }

  const date = Timestamp.fromDate(new Date(data.date))
  const lat = parseFloat(data.lat)
  const lng = parseFloat(data.lng)
  if (isNaN(lat) || isNaN(lng)) {
    throw new HttpsError('invalid-argument', 'Invalid latitude or longitude.')
  }
  try {
    // const docRef = await db.collection('events').add({
    //   title,
    //   organizer,
    //   category,
    //   description,
    //   eventDate,
    //   lat,
    //   lng,
    //   createdAt: Timestamp.now(),
    //   createdBy: uid,
    // })

    const eventRef = db.collection('events').doc(eid)
    const snap = await eventRef.set({
      title,
      organizer,
      category,
      description,
      date,
      lat,
      lng,
    })

    // logger.info(`Recipe created ${docRef.id} by ${uid}`)
    return { ok: true }
  } catch (err) {
    console.log(err)
  }
})

const saveEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const claims = request.auth.token

  if (claims.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can create events.')
  }

  const uid = request.auth.uid
  const data = request.data || {}
  const title = sanitizePlainText(data.title, 50)
  const organizer = sanitizePlainText(data.organizer, 50)

  const category = sanitizePlainText(data.organizer, 50)
  const description = sanitizePlainText(data.organizer, 150)
  if (!data.date) {
    throw new HttpsError('invalid-argument', 'Date is required.')
  }

  const eventDate = Timestamp.fromDate(new Date(data.date))
  const lat = parseFloat(data.lat)
  const lng = parseFloat(data.lng)
  if (isNaN(lat) || isNaN(lng)) {
    throw new HttpsError('invalid-argument', 'Invalid latitude or longitude.')
  }

  try {
    const docRef = await db.collection('events').add({
      title,
      organizer,
      category,
      description,
      eventDate,
      lat,
      lng,
      createdAt: Timestamp.now(),
      createdBy: uid,
    })
    logger.info(`Event created ${docRef.id} by ${uid}`)
    return { ok: true, id: docRef.id }
  } catch (err) {
    console.log(err)
  }
})

const getEventListByTitle = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  let searchWord = request.data?.searchWord
  const searchType = request.data?.type

  if (!searchWord) {
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
  } else {
    try {
      const snapshot = await db
        .collection('events')
        .where(searchType, '>=', searchWord)
        .where(searchType, '<=', searchWord + '\uf8ff')
        .get()

      if (snapshot.empty) {
        return []
      }

      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return records
    } catch (error) {
      console.log(error)
    }
  }
})

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

    return { events: documents }
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

module.exports = {
  getEvents,
  getMapEvents,
  getEventById,
  getEventListByIds,
  getEventListByTitle,
  saveEvent,
  modifyEvent,
  removeEvent
}
