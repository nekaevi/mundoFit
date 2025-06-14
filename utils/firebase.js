const admin = require('firebase-admin');

// Verifica se já existe um app inicializado para evitar múltiplas inicializações
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_CONFIG)
      ),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    console.log('Firebase Admin inicializado com sucesso!');
  } catch (error) {
    console.error('Erro na inicialização do Firebase:', error);
    throw error; // Força falha visível no deploy
  }
}

// Exporta explicitamente o Firestore e o Admin para uso
module.exports = {
  db: admin.firestore(),
  admin
};
