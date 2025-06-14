// controllers/treinoController.js
const { db } = require('../utils/firebase');

// treinoController.js
// treinoController.js - createTreino
exports.createTreino = async (req, res) => {
  try {
    const treinoData = req.body;
    const treinoRef = await db.collection('treinos').add({
      nm_treino: treinoData.nm_treino,
      nm_fk_exercicio: treinoData.nm_fk_exercicio,
      cd_fk_exercicio: treinoData.cd_fk_exercicio,
      cd_fk_aluno: treinoData.cd_fk_aluno,
      cd_fk_professor: treinoData.cd_fk_professor,
      dt_treino: treinoData.dt_treino || new Date(),
      ds_objetivo: treinoData.ds_objetivo,
      ds_observacao: treinoData.ds_observacao,
      nm_dia_semana: treinoData.nm_dia_semana,
      // ▼▼▼ ADICIONE ESTES 3 CAMPOS ▼▼▼
      qtd_carga: treinoData.qtd_carga,
      cd_serie: Number(treinoData.cd_serie),
      qtd_repeticoes: Number(treinoData.qtd_repeticoes)
    });
    res.status(201).json({ id: treinoRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// treinoController.js - getTreinos (atualizado)
// treinoController.js - getTreinos (atualizado)
exports.getTreinos = async (req, res) => {
  try {
    const { alunoId, diaSemana } = req.query;
    let query = db.collection('treinos');

    // Normaliza o dia para formato completo
    const diasCompletos = {
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };

    const diaFormatado = diasCompletos[diaSemana?.toLowerCase()] || diaSemana;

    if (alunoId) query = query.where('cd_fk_aluno', '==', alunoId);
    if (diaFormatado) query = query.where('nm_dia_semana', '==', diaFormatado); // Usa o dia formatado

    const snapshot = await query.get();
    const treinos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.status(200).json(treinos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTreinoById = async (req, res) => {
  try {
    const treinoDoc = await db.collection('treinos').doc(req.params.id).get();
    if (!treinoDoc.exists) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    res.status(200).json({ id: treinoDoc.id, ...treinoDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTreino = async (req, res) => {
  try {
    const treinoData = req.body;
    await db.collection('treinos').doc(req.params.id).update(treinoData);
    console.log("=============================================")
    res.status(200).json({ message: 'Treino atualizado com sucesso' });
    console.log("=============================================")

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTreino = async (req, res) => {
  try {
    await db.collection('treinos').doc(req.params.id).delete();
    console.log("=============================================")
    res.status(200).json({ message: 'Treino removido com sucesso' });
    console.log("=============================================")

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
