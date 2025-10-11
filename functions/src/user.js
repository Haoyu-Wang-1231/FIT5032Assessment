const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')
const { error } = require('firebase-functions/logger')

const db = getFirestore()

const userFavourStateChange = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }
  const userId = request.data?.uid || null
  const recipeId = request.data?.rid || null
  const state = request.data?.favourState || null
  console.log('state: ' + state)
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId is required.')
  } else if (!recipeId) {
    throw new HttpsError('invalid-argument', 'eventId is required.')
  }

  try {
    const userRef = db.collection('users').doc(userId)
    const snap = await userRef.get()

    if (!snap.exists) {
      throw new HttpsError('not-found', 'User profile does not exist.')
    }

    if (state) {
      await userRef.update({
        favourRecipe: FieldValue.arrayUnion(recipeId),
      })
    } else {
      await userRef.update({
        favourRecipe: FieldValue.arrayRemove(recipeId),
      })
    }
    const after = await userRef.get()
    console.log(after)
    return { ok: true, newDoc: after.data() }
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

const userRegisterStateChange = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }
  const userId = request.data?.uid || null
  const eventId = request.data?.eid || null
  const state = request.data?.registerState || null
  console.log('state: ' + state)
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId is required.')
  } else if (!eventId) {
    throw new HttpsError('invalid-argument', 'eventId is required.')
  }

  try {
    const userRef = db.collection('users').doc(userId)
    const snap = await userRef.get()

    if (!snap.exists) {
      throw new HttpsError('not-found', 'User profile does not exist.')
    }

    if (state) {
      await userRef.update({
        registedEvent: FieldValue.arrayUnion(eventId),
      })
    } else {
      await userRef.update({
        registedEvent: FieldValue.arrayRemove(eventId),
      })
    }
    const after = await userRef.get()
    console.log(after)
    return { ok: true, newDoc: after.data() }
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

const getUsernamesByIds = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const userIdList = request.data?.idList
  if (!Array.isArray(userIdList) || userIdList.length === 0) {
    return { exists: false, users: [] }
  }

  try {
    const docRefs = userIdList.map((id) => db.collection('users').doc(id))
    const snapshots = await db.getAll(...docRefs)

    const documents = snapshots.map((snap, index) => {
      if (!snap.exists) {
        return { id: userIdList[index], error: 'Not found' }
      }
      const username = snap.get('username') ?? null
      return { id: snap.id, username: username }
    })
    return { usernames: documents }
  } catch (err) {
    console.log(err)
  }
})

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

module.exports = { getUserInfo, getUsernamesByIds, userRegisterStateChange, userFavourStateChange }
