const { setGlobalOptions } = require("firebase-functions/v2");
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
Object.assign(exports, require("./src/mail"));
Object.assign(exports, require("./src/GenAI"));
Object.assign(exports, require("./src/API"));




// bugs due to user
// {"role": "admin"}
