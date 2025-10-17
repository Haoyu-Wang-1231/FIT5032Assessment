const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')
const { error } = require('firebase-functions/logger')
const { sendEmailFromFunctions } = require('./mail.js')
const db = getFirestore()

const registerUser = onCall(async (request) => {
  const uid = request.data.uid
  const email = request.data.email
  const username = request.data.username

  try {
    const userRef = db.collection('users').doc(uid)
    const snap = await userRef.set({
      email: email,
      role: 'viewer',
      createdAt: FieldValue.serverTimestamp(),
      username: username,
      favourRecipe: [],
      registedEvent: [],
    })

    const payload = {
      to: email,
      subject: 'Thanks for join us',
      text: 'Welcome to General Nutrition Educator.',
    }
    await sendEmailFromFunctions(payload)

    return { ok: true }
  } catch (err) {
    console.log(err)
    return { error: err }
  }
})

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

    const recipeRef = db.collection('recipes').doc(recipeId)
    const recipeSnap = await recipeRef.get()

    if (!recipeSnap.exists) {
      throw new HttpsError('not-found', 'Event does not exist.')
    }

    if (state) {
      await userRef.update({
        favourRecipe: FieldValue.arrayUnion(recipeId),
      })
       await recipeRef.update({
        favours: FieldValue.arrayUnion(userId),
      })
    } else {
      await userRef.update({
        favourRecipe: FieldValue.arrayRemove(recipeId),
      })

      await recipeRef.update({
        favours: FieldValue.arrayRemove(userId),
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

    const eventRef = db.collection('events').doc(eventId)
    const eventSnap = await eventRef.get()

    if (!eventSnap.exists) {
      throw new HttpsError('not-found', 'Event does not exist.')
    }

    if (state) {
      await userRef.update({
        registedEvent: FieldValue.arrayUnion(eventId),
      })
      await eventRef.update({
        registers: FieldValue.arrayUnion(userId),
      })
    } else {
      await userRef.update({
        registedEvent: FieldValue.arrayRemove(eventId),
      })
      await eventRef.update({
        registers: FieldValue.arrayRemove(userId),
      })
    }
    const userAfter = await userRef.get()
    const eventAfter = await eventRef.get()
    // console.log(after)

    return { ok: true, newDoc: { user: userAfter.data(), event: eventAfter.data() } }
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

const getUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  let isAdmin = request.auth.token?.role === 'admin' || request.auth.token?.admin === true

  if (!isAdmin) {
    const roleSnap = await db.collection('users').doc(request.auth.uid).get()
    isAdmin = roleSnap.exists && roleSnap.data()?.role === 'admin'
  }

  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'You do not have permission to perform this action.')
  }

  try {
    const snap = await db.collection('users').get()
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
  getUserInfo,
  getUsernamesByIds,
  userRegisterStateChange,
  userFavourStateChange,
  registerUser,
  getUsers,
}
