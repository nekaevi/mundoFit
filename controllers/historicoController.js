const { db } = require('../utils/firebase');

// historicoController.js - Correção para salvar como string ISO
exports.createHistorico = async (req, res) => {
  try {
    const historicoData = req.body;

    // Converter para string ISO se for Date
    const dtTreino = historicoData.dt_treino_realizado 
      ? new Date(historicoData.dt_treino_realizado).toISOString()
      : new Date().toISOString();

    const historicoRef = await db.collection('historicos').add({
      cd_fk_aluno: historicoData.cd_fk_aluno,
      cd_fk_treino: historicoData.cd_fk_treino,
      dt_treino_realizado: dtTreino, // Salvar como string ISO
      cd_fk_peso: historicoData.cd_fk_peso,
      ds_comentarios: historicoData.ds_comentarios,
    });

    res.status(201).json({ id: historicoRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistoricos = async (req, res) => {
  try {
    const { alunoId } = req.query;
    let query = db.collection('historicos');

    if (alunoId) {
      query = query.where('cd_fk_aluno', '==', alunoId);
    }

    const snapshot = await query.get();
    const historicos = [];
    snapshot.forEach(doc => historicos.push({ id: doc.id, ...doc.data() }));

    res.status(200).json(historicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistoricoById = async (req, res) => {
  try {
    const histDoc = await db.collection('historicos').doc(req.params.id).get();
    if (!histDoc.exists) {
      return res.status(404).json({ error: 'Registro histórico não encontrado' });
    }
    res.status(200).json({ id: histDoc.id, ...histDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHistorico = async (req, res) => {
  try {
    const historicoData = req.body;
    await db.collection('historicos').doc(req.params.id).update(historicoData);
    res.status(200).json({ message: 'Histórico atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHistorico = async (req, res) => {
  try {
    await db.collection('historicos').doc(req.params.id).delete();
    res.status(200).json({ message: 'Histórico removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTreinosConcluidosByAluno = async (req, res) => {
  try {
    const alunoId = req.query.alunoId;
    
    const snapshot = await db.collection('historicos')
      .where('cd_fk_aluno', '==', alunoId)
      .where('cd_fk_treino', '!=', null) // Filtra apenas registros com ID de treino
      .get();

    const historicos = [];
    snapshot.forEach(doc => historicos.push({ id: doc.id, ...doc.data() }));
    
    res.status(200).json(historicos);
  } catch (error) {
    console.error('[BACK] Erro ao buscar treinos concluídos:', error); // ← Log detalhado
    res.status(500).json({ error: error.message });
  }
};