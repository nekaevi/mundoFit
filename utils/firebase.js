const admin = require('firebase-admin');

// Configuração enxuta para Firestore
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_CONFIG)
  ),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// Exporta APENAS o Firestore
module.exports = admin.firestore();
