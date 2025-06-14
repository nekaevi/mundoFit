// controllers/alunoController.js

const { db } = require('../utils/firebase');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;

exports.createAluno = async (req, res) => {
  try {
    const alunoData = req.body;
    const hashedPassword = await bcrypt.hash(alunoData.cd_senha_al, saltRounds);
    const alunoRef = await db.collection('alunos').add({
      nm_aluno: alunoData.nm_aluno,
      status_aluno: alunoData.status_aluno || 'ativo',
      email_aluno: alunoData.email_aluno,
      cd_senha_al: hashedPassword,
      dt_cadastro: new Date().toISOString(),
      cd_peso: alunoData.cd_peso,
      cd_altura: alunoData.cd_altura,
      genero: alunoData.genero,
      peso_meta: null,
    });
    res.status(201).json({ id: alunoRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlunos = async (req, res) => {
  try {
    const snapshot = await db.collection('alunos').get();
    const alunos = [];
    snapshot.forEach(doc => alunos.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(alunos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlunoById = async (req, res) => {
  try {
    const alunoDoc = await db.collection('alunos').doc(req.params.id).get();
    if (!alunoDoc.exists) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.status(200).json({ id: alunoDoc.id, ...alunoDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAluno = async (req, res) => {
  try {
    const alunoData = req.body;
    if (alunoData.dt_cadastro) {
      alunoData.dt_cadastro = new Date(alunoData.dt_cadastro).toISOString();
    }
    await db.collection('alunos').doc(req.params.id).update(alunoData);
    res.status(200).json({ mensagem: 'Aluno atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAluno = async (req, res) => {
  try {
    await db.collection('alunos').doc(req.params.id).delete();
    res.status(200).json({ mensagem: 'Aluno removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

    console.error(`recuperarSenha recebeu email (entre aspas): "${emailLower}"`);

    const alunoSnapshot = await db
      .collection('alunos')
      .where('email_aluno', '==', emailLower)
      .limit(1)
      .get();

    if (alunoSnapshot.empty) {
      return res.status(404).json({ mensagem: 'E-mail não encontrado' });
    }

    const alunoDoc = alunoSnapshot.docs[0];
    const alunoId = alunoDoc.id;

    const codigo = crypto.randomInt(100000, 999999).toString();
    const validade = new Date(Date.now() + 15 * 60000); // 15 minutos

    await db.collection('codigosRecuperacao').doc(emailLower).set({
      codigo,
      validade: validade.toISOString(),
      alunoId,
    });

    console.log(`Código de recuperação para ${emailLower}: ${codigo}`);

    res.status(200).json({
      mensagem: 'Código de recuperação enviado para seu e-mail',
      alunoId,
      codigo, // Remover em produção
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/alunoController.js (mantenha apenas o essencial)
exports.redefinirSenha = async (req, res) => {
  try {
    const { alunoId, novaSenha } = req.body;

    if (!alunoId || !novaSenha) {
      return res.status(400).json({ mensagem: 'Dados incompletos' });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);
    await db.collection('alunos').doc(alunoId).update({
      cd_senha_al: hashedPassword,
    });

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

// Redefinir senha direto com email + nova senha
exports.redefinirSenhaSimples = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    if (!email || !novaSenha) {
      return res.status(400).json({ mensagem: 'Informe email e nova senha' });
    }

    const alunoSnapshot = await db
      .collection('alunos')
      .where('email_aluno', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (alunoSnapshot.empty) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    const alunoDoc = alunoSnapshot.docs[0];
    const alunoId = alunoDoc.id;

    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

    await db.collection('alunos').doc(alunoId).update({
      cd_senha_al: hashedPassword,
    });

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
