const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { sanitizePlainText } = require('./sanitize.js')
const { logger } = require('firebase-functions')
const cors = require('cors')({ origin: true })

const db = getFirestore()
// /getEventsList

const getEventsAPI = onCall(async (request) => {
  try {
    const eventsCollection = db.collection('events')
    const snapshot = await eventsCollection.get()
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { events: events }
  } catch (error) {
    logger.error('Error counting books:', error)
    res.status(500).send('Internal Server Error')
  }
})
// /getRecipesList
const getRecipesAPI = onCall(async (request) => {
  try {
    const eventsCollection = db.collection('recipes')
    const snapshot = await eventsCollection.get()
    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { recipes: recipes }
  } catch (error) {
    logger.error('Error counting books:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = { getEventsAPI, getRecipesAPI }
