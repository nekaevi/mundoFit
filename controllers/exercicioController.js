// controllers/exercicioController.js
const { db } = require('../utils/firebase');

exports.createExercicio = async (req, res) => {
  try {
    const exercicioData = req.body;
    const exercicioRef = await db.collection('exercicios').add({
      nm_exercicio: exercicioData.nm_exercicio,
      ds_exercicio: exercicioData.ds_exercicio,
      tipo_exercicio: exercicioData.tipo_exercicio,
    });
    res.status(201).json({ id: exercicioRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExercicios = async (req, res) => {
  try {
    const snapshot = await db.collection('exercicios').get();
    const exercicios = [];
    snapshot.forEach(doc => exercicios.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(exercicios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExercicioById = async (req, res) => {
  try {
    const exerDoc = await db.collection('exercicios').doc(req.params.id).get();
    if (!exerDoc.exists) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }
    res.status(200).json({ id: exerDoc.id, ...exerDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExercicio = async (req, res) => {
  try {
    const exercicioData = req.body;
    await db.collection('exercicios').doc(req.params.id).update(exercicioData);
    res.status(200).json({ message: 'Exercício atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExercicio = async (req, res) => {
  try {
    await db.collection('exercicios').doc(req.params.id).delete();
    res.status(200).json({ message: 'Exercício removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
