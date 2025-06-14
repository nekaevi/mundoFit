const { db } = require('../utils/firebase');

class RecomendacaoController {
  static async obterDadosAluno(userId) {
    try {
      const alunoDoc = await db.collection('alunos').doc(userId).get();
      if (!alunoDoc.exists) {
        throw new Error('Aluno não encontrado');
      }
      return alunoDoc.data();
    } catch (error) {
      console.error('Erro ao obter dados do aluno:', error);
      throw error;
    }
  }

  static async criarRecomendacao(userId, recomendacao, parametros) {
    try {
      const docRef = await db.collection('recomendacoes').add({
        userId,
        data: new Date(),
        recomendacao,
        parametros,
        utilizado: false
      });
      return { id: docRef.id, ...recomendacao };
    } catch (error) {
      console.error('Erro ao criar recomendação:', error);
      throw error;
    }
  }

  static async obterHistorico(userId, limit = 5) {
    try {
      const snapshot = await db.collection('recomendacoes')
        .where('userId', '==', userId)
        .orderBy('data', 'desc')
        .limit(limit)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      }));
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw error;
    }
  }
}

module.exports = RecomendacaoController;