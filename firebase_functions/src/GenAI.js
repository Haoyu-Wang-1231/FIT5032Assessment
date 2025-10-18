const { onCall, HttpsError } = require('firebase-functions/v2/https')

// Define the required JSON structure for the nutrition analysis

const analyzeRecipe = onCall(async (request) => {
  const { GoogleGenAI, Type } = await import('@google/genai')
  const GEMINI_API_KEY = process.env.GEMINI_KEY
  const ai = new GoogleGenAI({ apiKey: "AIzaSyAze_Syac7Rrns-afYjPOmEZlUpEKac14k" })

  const nutritionSchema = {
    type: Type.OBJECT,
    properties: {
      totalCalories: {
        type: Type.NUMBER,
        description: 'Total estimated calories for the entire recipe.',
      },
      macronutrients: {
        type: Type.OBJECT,
        properties: {
          protein_g: { type: Type.NUMBER, description: 'Total protein in grams.' },
          fat_g: { type: Type.NUMBER, description: 'Total fat in grams.' },
          carbs_g: { type: Type.NUMBER, description: 'Total carbohydrates in grams.' },
        },
      },
      ingredientsBreakdown: {
        type: Type.ARRAY,
        description: 'A list of key ingredients with their estimated calorie count.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
          },
        },
      },
      overallEvaluation: {
        type: Type.STRING,
        description:
          "A brief, encouraging summary (1-2 sentences) of the recipe's overall health quality.",
      },
      healthRecommendations: {
        type: Type.ARRAY,
        description:
          "A list of 2-3 specific, actionable recommendations to improve the recipe's nutritional value (e.g., reduce salt, add fiber).",
        items: {
          type: Type.STRING,
        },
      },
    },
    // Optional: enforce order
    propertyOrdering: ['totalCalories', 'macronutrients', 'ingredientsBreakdown'],
  }

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in first.')
  }

  const recipeText = request.data.recipe

  if (!recipeText) {
    throw new HttpsError('UnExisted', 'Please recheck the recipe id.')
  }

  //   return
  const systemInstruction = `You are an expert nutritionist. Analyze the provided recipe text, focusing on the ingredients and instructions 
    to estimate the nutritional content for one serving. Return a precise, structured nutritional breakdown in 
    JSON format. Assume common serving sizes and preparation methods for the ingredients. Do not include any 
    explanatory text, only the final JSON object.`
  const userPrompt = `Analyze the nutrition for this recipe: ${recipeText}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // A fast, capable model perfect for this
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: nutritionSchema, // Enforce the required structure
        temperature: 0.2, // Lower temperature for factual, less creative output
      },
    })

    const jsonResponse = JSON.parse(response.text)
    return { success: true, nutritionData: jsonResponse }
  } catch (err) {
    console.error('Gemini API or Parsing Error:', err) // Log the original error for debugging

    throw new HttpsError(
      'internal',
      'The recipe analysis service failed due to an internal error.',
      err.message, // Optionally pass the original error message for advanced debugging
    )
  }
})

module.exports = { analyzeRecipe }
