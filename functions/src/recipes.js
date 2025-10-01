const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore, AggregateField } = require('firebase-admin/firestore')

const db = getFirestore()

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

// const recipesNotesListener = async () => {
//     const q = query(recipesCollection)
//     const querySnapshot = await getDocs(q);
//     const rows = await Promise.all(
//         querySnapshot.docs.map(async (d) => {
//             const rate = await loadrating(d.id)
//             const rating = rate.avg
//             const ratingNum = rate.count

//             return { id: d.id, ...d.data(), rating, ratingNum }
//         })
//     )
//     recipes.value = rows
//     console.log("recipesNotesListener", recipes)
// }

module.exports = { getRecipes }
