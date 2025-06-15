// ==================== MÓDULOS ESSENCIAIS ====================
const express = require('express');
const cors = require('cors');
const os = require('os');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();
const { db } = require('./utils/firebase');

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

// ==================== CONFIGURAÇÃO CORRIGIDA DO CORS ====================
const allowedOrigins = [
  'http://localhost:8081',
  'https://seusite.com',
  'https://mundofit-production.up.railway.app',
  'https://edwa3uw-anonymous-8081.exp.direct'  // 👈 ADICIONE ESTA ORIGEM
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origem (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso bloqueado por política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // 👈 Pré-flight para todas as rotas


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
    
    // Conexão com Firebase
    console.log('🔗 Conectando ao Firebase...');
    await db.collection('system').doc('status').get();
    sistemaStatus.dbConnected = true;
    console.log('✅ Conexão com Firebase estabelecida');

    // Inicialização do Modelo de ML
    console.log('🧠 Inicializando modelo de ML...');
    const { initialize } = require('./ml/recommender');
    sistemaStatus.mlModelReady = await initialize();
    sistemaStatus.lastTrainingAttempt = new Date().toISOString();
    console.log('✅ Modelo de ML inicializado');

    // Iniciar servidor
    app.listen(PORT, () => {
      const ip = getLocalIPAddress();
      sistemaStatus.serverStarted = new Date().toISOString();
      console.log(`Servidor rodando em http://${ip}:${PORT}`);
    });

  } catch (error) {
    console.error('💥 Erro crítico na inicialização:', error);
    sistemaStatus.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
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

    // Verificação paralela de usuários
    const [professoresSnapshot, alunosSnapshot] = await Promise.all([
      db.collection('professores').get(),
      db.collection('alunos').get()
    ]);

    // Verificação do Admin
    if (email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_SENHA) {
      return res.json({ tipoUsuario: 'admin', sistemaStatus });
    }

    // Verificação de Professores
    const professor = professoresSnapshot.docs.find(doc => 
      doc.data().email_professor === email && 
      bcrypt.compareSync(senha, doc.data().cd_senha_pf)
    );

    if (professor) {
      return res.json({ tipoUsuario: 'professor', id: professor.id, nome: professor.data().nm_professor, sistemaStatus });
    }

    // Verificação de Alunos
    const aluno = alunosSnapshot.docs.find(doc => 
      doc.data().email_aluno === email && 
      bcrypt.compareSync(senha, doc.data().cd_senha_al)
    );

    if (aluno) {
      return res.json({ tipoUsuario: 'aluno', id: aluno.id, nome: aluno.data().nm_aluno, sistemaStatus });
    }

    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ sucesso: false, error: 'Erro interno no servidor' });
  }
});

// ==================== ROTAS DE STATUS ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    versao: '2.1.0',
    timestamp: new Date().toISOString(),
    sistema: 'MundoFit Backend',
    recursos: ['Autenticação', 'Gestão de Alunos', 'Gestão de Professores', 'Gestão de Exercícios', 'Recomendação Inteligente']
  });
});

app.get('/system/status', (req, res) => {
  res.json({
    status: sistemaStatus,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ROTAS DE RECUPERAÇÃO DE SENHA ====================
app.post('/alunos/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.trim().toLowerCase();

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
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
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
    detalhes: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==================== INICIAR APLICAÇÃO ====================
initializeSystem();
