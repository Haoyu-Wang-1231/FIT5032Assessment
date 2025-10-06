const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')

const db = getFirestore()

const deleteRecipe = onCall(async (request) => {
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

  const recipeId = request.data?.id || {}
  if (!recipeId || typeof recipeId !== 'string') {
    throw new HttpsError('invalid-argument', 'recipeId is required.')
  }

  try {
    await db.collection('recipes').doc(request.data.id).delete()
    return { ok: true, deleted: request.data.id }
  } catch (error) {
    logger.info(
      `Failed to delete recipe ${request.data.id} by ${request.auth.uid}: ${error.message}`,
    )
    throw new HttpsError(error)
  }
})

const saveRecipe = onCall(async (request) => {
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

  const data = request.data || {}
  const title = sanitizePlainText(data.title, 50)
  const author = sanitizePlainText(data.author, 20)
  const description = sanitizePlainText(data.description, 250)
  const prepTime = sanitizePlainText(data.prepTime, 50)

  const docRef = await db.collection('recipes').add({
    title,
    author,
    description,
    prepTime,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: request.auth.uid,
  })
  logger.info(`Recipe created ${docRef.id} by ${request.auth.uid}`)

  return { ok: true, id: docRef.id }
})

const getRecipeByID = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }
  const recipeId = request.data?.id ?? request.data?.recipeId

  if (!recipeId) {
    throw new HttpsError('UnExisted', 'Please recheck the recipe id.')
  }

  try {
    const docRef = db.collection('recipes').doc(recipeId)
    const snap = await docRef.get()
    if (!snap.exists) {
      throw new HttpsError('not-found', `Recipe "${recipeId}" not found.`)
    }
    let sum = 0
    let ratingNum = 0
    commentsSnap.forEach((c) => {
      const r = c.get('rating')
      if (typeof r === 'number') {
        sum += r
        ratingNum += 1
      }
    })

    const rows = await Promise.all(
      snap.docs.map(async (doc) => {
        const commentsSnap = await db.collection('recipes').doc(doc.id).collection('comments').get()

        let sum = 0
        let ratingNum = 0
        commentsSnap.forEach((c) => {
          const r = c.get('rating')
          if (typeof r === 'number') {
            sum += r
            ratingNum += 1
          }
        })

        const rating = ratingNum ? +(sum / ratingNum).toFixed(1) : 0

        return {
          id: doc.id,
          ...doc.data(),
          rating,
          ratingNum,
        }
      }),
    )

    return rows
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

const getRecipes = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  try {
    const snap = await db.collection('recipes').get()

    const rows = await Promise.all(
      snap.docs.map(async (doc) => {
        const commentsSnap = await db.collection('recipes').doc(doc.id).collection('comments').get()

        let sum = 0
        let ratingNum = 0
        commentsSnap.forEach((c) => {
          const r = c.get('rating')
          if (typeof r === 'number') {
            sum += r
            ratingNum += 1
          }
        })

        const rating = ratingNum ? +(sum / ratingNum).toFixed(1) : 0

        return {
          id: doc.id,
          ...doc.data(),
          rating,
          ratingNum,
        }
      }),
    )

    return rows
  } catch (error) {
    throw new HttpsError('internal', error.message)
  }
})

module.exports = { getRecipes, saveRecipe, deleteRecipe }
