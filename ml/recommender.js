const { db } = require('../utils/firebase');

// Tipos de treino disponíveis (simplificados)
const TIPOS_TREINO = {
  'superiores': ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
  'inferiores': ['Pernas', 'Glúteos', 'Panturrilha'],
  'core': ['Abdômen', 'Lombar'],
  'cardio': ['Cardio', 'HIIT', 'Circuito'],
  'funcional': ['Funcional', 'Calistenia', 'Cross Training']
};

let exerciciosCache = null;

// Carregar exercícios do Firebase
async function carregarExercicios() {
  if (exerciciosCache) return exerciciosCache;

  try {
    const snapshot = await db.collection('exercicios').get();
    exerciciosCache = [];
    
    snapshot.forEach(doc => {
      exerciciosCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return exerciciosCache;
  } catch (error) {
    console.error('Erro ao carregar exercícios:', error);
    throw error;
  }
}

// Função de filtro otimizada
function filtrarExerciciosPorTipo(exercicios, tipo) {
  const gruposMusculares = TIPOS_TREINO[tipo] || [];
  
  return exercicios.filter(ex => 
    gruposMusculares.some(grupo => ex.tipo_exercicio.includes(grupo))
  );
}

// Inicializar o sistema
async function initialize() {
  try {
    console.log('🔄 Carregando exercícios...');
    await carregarExercicios();
    console.log('✅ Sistema inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Falha na inicialização:', error);
    return false;
  }
}

// Gerar recomendação de treino simplificada
async function recommend(aluno) {
  try {
    if (!aluno.tipo) throw new Error('Tipo de treino não especificado');
    
    const todosExercicios = await carregarExercicios();
    let exerciciosFiltrados = filtrarExerciciosPorTipo(todosExercicios, aluno.tipo);
    
    // Fallback para tipos sem exercícios específicos
    if (exerciciosFiltrados.length === 0) {
      exerciciosFiltrados = todosExercicios;
    }
    
    // Seleciona aleatoriamente 5 exercícios
    const exerciciosSelecionados = [...exerciciosFiltrados]
      .sort(() => 0.9 - Math.random())
      .slice(0, 9);
    
    return {
      tipo: aluno.tipo,
      exercicios: exerciciosSelecionados.map(ex => ({
        id: ex.id,
        nome: ex.nm_exercicio,
        tipo: ex.tipo_exercicio,
        descricao: ex.ds_exercicio || 'Sem descrição'
      })),
      observacoes: [
        aluno.nm_aluno ? `Recomendação para ${aluno.nm_aluno}` : 'Recomendação genérica'
      ]
    };
    
  } catch (error) {
    console.error('Erro ao gerar recomendação:', error);
    return {
      tipo: aluno.tipo || 'erro',
      exercicios: [],
      observacoes: ['Erro: ' + error.message]
    };
  }
}

module.exports = {
  initialize,
  recommend,
  carregarExercicios
};