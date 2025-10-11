const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions/v1"); // v1
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

setGlobalOptions({ maxInstances: 10, region: 'australia-southeast1'});

if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
}



initializeApp();
const db = getFirestore();
const adminAuth = getAuth();


Object.assign(exports, require("./src/recipes"));
Object.assign(exports, require("./src/events"));
Object.assign(exports, require("./src/user"));


exports.hello = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});


// bugs due to user
// {"role": "admin"}
