const admin = require('firebase-admin');

// 🔓 Projeto ANTIGO (dentro da pasta "Key")
const oldServiceAccount = require('./Key/serviceAccountKey.json');

// 🔐 Projeto NOVO (fora da pasta, raiz do projeto)
const newServiceAccount = require('./serviceAccountKey.json');

// Inicializa Firestore antigo
const oldApp = admin.initializeApp({
  credential: admin.credential.cert(oldServiceAccount),
}, 'oldApp');
const oldDb = oldApp.firestore();

// Inicializa Firestore novo
const newApp = admin.initializeApp({
  credential: admin.credential.cert(newServiceAccount),
}, 'newApp');
const newDb = newApp.firestore();

// Coleções que serão migradas
const collections = [
  'alunos',
  'professores',
  'exercicios',
  'treinos',
  'historicos',
  'recomendacoes',
  'codigosRecuperacao'
];

async function migrateCollection(collectionName) {
  console.log(`📥 Migrando coleção: ${collectionName}`);
  const snapshot = await oldDb.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`⚠️ Coleção "${collectionName}" está vazia.`);
    return;
  }

  for (const doc of snapshot.docs) {
    await newDb.collection(collectionName).doc(doc.id).set(doc.data());
    console.log(`✔️ Documento ${doc.id} migrado.`);
  }

  console.log(`✅ Coleção "${collectionName}" migrada com sucesso.\n`);
}

async function main() {
  for (const collection of collections) {
    await migrateCollection(collection);
  }
  console.log('🚀 Migração finalizada com sucesso!');
}

main().catch((error) => {
  console.error('❌ Erro durante a migração:', error);
});
