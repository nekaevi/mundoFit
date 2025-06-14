// controllers/professorController.js
const { db } = require('../utils/firebase');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// No professorController.js, atualize o createProfessor
exports.createProfessor = async (req, res) => {
  try {
    const professorData = req.body;
    
    // Verificar se o email já existe
    const emailExists = await db.collection('professores')
      .where('email_professor', '==', professorData.email_professor)
      .get();
    
    if (!emailExists.empty) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(professorData.cd_senha_pf, saltRounds);
    
    const professorRef = await db.collection('professores').add({
      ...professorData,
      cd_senha_pf: hashedPassword,
      dt_cadastro_professor: new Date(),
    });
    
    res.status(201).json({ id: professorRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfessores = async (req, res) => {
  try {
    const snapshot = await db.collection('professores').get();
    const professores = [];
    snapshot.forEach(doc => professores.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(professores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfessorById = async (req, res) => {
  try {
    const profDoc = await db.collection('professores').doc(req.params.id).get();
    if (!profDoc.exists) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.status(200).json({ id: profDoc.id, ...profDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfessor = async (req, res) => {
  try {
    const professorData = req.body;
    if (professorData.cd_senha_pf) {
      professorData.cd_senha_pf = await bcrypt.hash(professorData.cd_senha_pf, saltRounds);
    }
    await db.collection('professores').doc(req.params.id).update(professorData);
    res.status(200).json({ message: 'Professor atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  try {
    await db.collection('professores').doc(req.params.id).delete();
    res.status(200).json({ message: 'Professor removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
