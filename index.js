// ==================== MÓDULOS ESSENCIAIS ====================
const express = require('express');
const cors = require('cors');
const os = require('os');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { db } = require('./utils/firebase'); // Importação modificada

// ==================== IMPORTAÇÃO DE ROTAS ====================
const alunoRoutes = require('./routes/alunoRoutes');
const professorRoutes = require('./routes/professorRoutes');
const exercicioRoutes = require('./routes/exercicioRoutes');
const treinoRoutes = require('./routes/treinoRoutes');
const historicoRoutes = require('./routes/historicoRoutes');
const mlRoutes = require('./routes/mlRoutes');

// ==================== CONFIGURAÇÃO DO EXPRESS ====================
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES GLOBAIS ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== MONITORAMENTO DO SISTEMA ====================
let sistemaStatus = {
  mlModelReady: false,
  lastTrainingAttempt: null,
  dbConnected: false,
  serverStarted: null,
  nodeVersion: process.version,
  lastError: null
};

// Função auxiliar para obter o IP local
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.values(interfaces)) {
    for (const iface of interfaceName) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ==================== INICIALIZAÇÃO ASSÍNCRONA ====================
async function initializeSystem() {
  try {
    console.log('⚙ Iniciando inicialização do sistema...');
    
    // Teste de conexão com Firebase
    console.log('🔗 Testando conexão com Firestore...');
    const testDoc = db.collection('system').doc('connection-test');
    await testDoc.set({
      timestamp: new Date().toISOString(),
      status: 'testing',
      message: 'Teste de conexão inicial'
    });
    sistemaStatus.dbConnected = true;
    console.log('✅ Conexão com Firestore estabelecida com sucesso');

    // Inicialização do Modelo de ML
    if (process.env.ENABLE_ML === 'true') {
      console.log('🧠 Inicializando modelo de ML...');
      try {
        const { initialize } = require('./ml/recommender');
        sistemaStatus.mlModelReady = await initialize();
        sistemaStatus.lastTrainingAttempt = new Date().toISOString();
        console.log('✅ Modelo de ML inicializado');
      } catch (mlError) {
        console.error('⚠️ Erro na inicialização do ML:', mlError);
        sistemaStatus.mlModelReady = false;
        sistemaStatus.lastError = {
          message: mlError.message,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      console.log('⏩ Inicialização de ML desabilitada');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      const ip = getLocalIPAddress();
      sistemaStatus.serverStarted = new Date().toISOString();
      console.log(`🚀 Servidor rodando em http://${ip}:${PORT}`);
    });

  } catch (error) {
    console.error('💥 Erro crítico na inicialização:', error);
    sistemaStatus.lastError = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    // Tentativa de registrar o erro no Firestore antes de sair
    try {
      await db.collection('system-errors').doc(new Date().toISOString()).set({
        error: error.message,
        stack: error.stack,
        status: sistemaStatus
      });
    } catch (loggingError) {
      console.error('Falha ao registrar erro:', loggingError);
    }
    
    process.exit(1);
  }
}

// ==================== ROTEAMENTO PRINCIPAL ====================
app.get('/', (req, res) => {
  res.send(`
    MundoFit API 2.1\n
    Endpoints disponíveis:
    - /alunos
    - /professores
    - /exercicios
    - /treinos
    - /historicos
    - /ml/recomendar
    - /login
    - /system/status
  `);
});

// ==================== REGISTRO DE ROTAS ====================
app.use('/alunos', alunoRoutes);
app.use('/professores', professorRoutes);
app.use('/exercicios', exercicioRoutes);
app.use('/treinos', treinoRoutes);
app.use('/historicos', historicoRoutes);
app.use('/ml', mlRoutes);

// ==================== ROTAS DE AUTENTICAÇÃO ====================
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificação paralela otimizada
    const [professorQuery, alunoQuery] = await Promise.all([
      db.collection('professores')
        .where('email_professor', '==', email)
        .limit(1)
        .get(),
      db.collection('alunos')
        .where('email_aluno', '==', email)
        .limit(1)
        .get()
    ]);

    // Verificação do Admin
    if (email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_SENHA) {
      return res.json({ 
        tipoUsuario: 'admin', 
        sistemaStatus: {
          ...sistemaStatus,
          // Ocultar informações sensíveis
          lastError: sistemaStatus.lastError ? { 
            message: sistemaStatus.lastError.message,
            timestamp: sistemaStatus.lastError.timestamp
          } : null
        } 
      });
    }

    // Verificação de Professores
    if (!professorQuery.empty) {
      const professor = professorQuery.docs[0];
      if (bcrypt.compareSync(senha, professor.data().cd_senha_pf)) {
        return res.json({ 
          tipoUsuario: 'professor', 
          id: professor.id, 
          nome: professor.data().nm_professor,
          sistemaStatus: {
            dbConnected: sistemaStatus.dbConnected,
            serverStarted: sistemaStatus.serverStarted
          }
        });
      }
    }

    // Verificação de Alunos
    if (!alunoQuery.empty) {
      const aluno = alunoQuery.docs[0];
      if (bcrypt.compareSync(senha, aluno.data().cd_senha_al)) {
        return res.json({ 
          tipoUsuario: 'aluno', 
          id: aluno.id, 
          nome: aluno.data().nm_aluno,
          sistemaStatus: {
            dbConnected: sistemaStatus.dbConnected,
            serverStarted: sistemaStatus.serverStarted
          }
        });
      }
    }

    res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Credenciais inválidas',
      sistemaStatus: {
        dbConnected: sistemaStatus.dbConnected
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    sistemaStatus.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json({ 
      sucesso: false, 
      error: 'Erro interno no servidor',
      sistemaStatus: {
        dbConnected: sistemaStatus.dbConnected,
        lastError: {
          timestamp: sistemaStatus.lastError.timestamp
        }
      }
    });
  }
});

// ==================== ROTAS DE STATUS ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: sistemaStatus.dbConnected ? 'healthy' : 'degraded',
    versao: '2.1.0',
    timestamp: new Date().toISOString(),
    sistema: 'MundoFit Backend',
    recursos: ['Autenticação', 'Gestão de Alunos', 'Gestão de Professores', 'Gestão de Exercícios', 'Recomendação Inteligente'],
    dbStatus: sistemaStatus.dbConnected ? 'connected' : 'disconnected',
    mlStatus: sistemaStatus.mlModelReady ? 'ready' : 'not-ready'
  });
});

app.get('/system/status', (req, res) => {
  res.json({
    status: {
      ...sistemaStatus,
      // Ocultar stack traces em produção
      lastError: sistemaStatus.lastError ? {
        message: sistemaStatus.lastError.message,
        timestamp: sistemaStatus.lastError.timestamp
      } : null
    },
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    firestore: {
      status: sistemaStatus.dbConnected ? 'connected' : 'disconnected'
    }
  });
});

// ==================== ROTAS DE RECUPERAÇÃO DE SENHA ====================
app.post('/alunos/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

    const alunoQuery = await db
      .collection('alunos')
      .where('email_aluno', '==', emailLower)
      .limit(1)
      .get();

    if (alunoQuery.empty) {
      return res.status(404).json({ 
        mensagem: 'E-mail não encontrado',
        sistemaStatus: {
          dbConnected: sistemaStatus.dbConnected
        }
      });
    }

    const alunoDoc = alunoQuery.docs[0];
    const alunoId = alunoDoc.id;

    const codigo = crypto.randomInt(100000, 999999).toString();
    const validade = new Date(Date.now() + 15 * 60000); // 15 minutos

    await db.collection('codigosRecuperacao').doc(emailLower).set({
      codigo,
      validade: validade.toISOString(),
      alunoId,
      used: false
    });

    console.log(`Código de recuperação para ${emailLower}: ${codigo}`);

    res.status(200).json({
      mensagem: 'Código de recuperação enviado para seu e-mail',
      alunoId,
      sistemaStatus: {
        dbConnected: sistemaStatus.dbConnected
      }
    });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    sistemaStatus.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      sistemaStatus: {
        dbConnected: sistemaStatus.dbConnected,
        lastError: {
          timestamp: sistemaStatus.lastError.timestamp
        }
      }
    });
  }
});

// ==================== TRATAMENTO DE ERROS GLOBAL ====================
app.use((err, req, res, next) => {
  console.error('🚨 Erro não tratado:', err);
  sistemaStatus.lastError = {
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(500).json({
    sucesso: false,
    erro: "Falha interna no servidor",
    sistemaStatus: {
      dbConnected: sistemaStatus.dbConnected,
      lastError: {
        timestamp: sistemaStatus.lastError.timestamp,
        message: process.env.NODE_ENV === 'development' ? 
          sistemaStatus.lastError.message : undefined
      }
    }
  });
});

// ==================== INICIAR APLICAÇÃO ====================
initializeSystem();

module.exports = app; // Para testes
