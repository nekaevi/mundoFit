# 💪 MundoFit - App de Academia

Aplicativo mobile desenvolvido para facilitar o acompanhamento de treinos em academias. Com o *MundoFit*, instrutores podem visualizar seus alunos e adicionar treinos personalizados. Alunos, por sua vez, conseguem acompanhar seus treinos, marcar como concluídos e verificar seu desempenho com praticidade e clareza.

## 📱 Guia de como Rodar a aplicação
## Backend 

1. Clone o repositório:
```bash
git clone https://github.com/nekaevi/mundoFit
cd mundoFit
```

2.Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4.Adicione as credenciais do Firebase:
- Create a `serviceAccountKey.js` file with your Firebase credentials

5. Rode o servidor:
```bash
npm run dev
```

## Frontend 

1. Clone o repositório:
```bash
git clone https://github.com/illY0701/MundoFit_App
cd MundoFit_App
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
- Edit `firebaseConfig.js` with your Firebase credentials

4. inicie o app:
```bash
expo start
```

## 📱 Guia de como utilizar o aplicativo

### 🛠️ Instalação

*Requisitos do sistema:*
- Android 8.0 ou superior.

*Passo a passo de instalação:*
1. Baixe o arquivo .APK do link fornecido pela sua academia/equipe.
2. Toque no arquivo baixado e habilite "Fontes desconhecidas" nas configurações do Android (se solicitado).
3. Siga as instruções na tela para concluir a instalação.

*Solução de problemas comuns (Expo):*
- *Erro: "App não instalado."*  
  ➤ Verifique se há conflito com versões anteriores (desinstale o app antigo primeiro).

---

### 🧭 Descrição das Telas

#### 🏁 Tela Inicial
- *O que você vê:* Botão "Entrar" no centro da tela.
- *Como usar:*  
  ➤ Toque no botão "Entrar" para acessar sua conta.

#### 📝 Tela de Cadastro
- *O que você vê:* Campos para nome, e-mail, senha e outros dados.
- *Como usar:*  
  ➤ Preencha todos os campos obrigatórios.  
  ➤ Toque em "Cadastrar" para criar sua conta.  
  💡 Dica: anote sua senha em um local seguro.

#### 🔐 Tela de Login
- *O que você vê:* Campos para e-mail e senha.
- *Como usar:*  
  ➤ Digite o e-mail e senha usados no cadastro.  
  ➤ Toque em "Entrar".  
  🔁 Esqueceu a senha? Toque em "Recuperar senha".

---

### 👨‍🏫 Telas do Professor

#### 🧑‍🎓 Tela Principal (Professor)
- *O que você vê:* Lista de alunos cadastrados.
- *Como usar:*  
  ➤ Toque em um aluno para editar treinos ou ver detalhes.

#### ⚙️ Tela de Configuração da Conta
- *O que você vê:* Dados pessoais e opções de edição.
- *Como usar:*  
  ➤ Toque no campo desejado.  
  ➤ Digite as novas informações.  
  ➤ Salve as mudanças.

#### 🧾 Tela do Aluno (acessada pelo Professor)
- *O que você vê:* Informações do aluno e treinos atribuídos.
- *Como usar:*  
  ➤ Toque em "Adicionar Treino" para criar um novo plano.  
  ➤ Deslize para a esquerda em um treino para excluí-lo.

#### 🏋️ Tela de Treino (Professor/Admin)
- *Objetivo:* Criar ou editar treinos.
- *Passos:*
  1. Selecione o tipo de treino (ex: musculação, cardio).
  2. Escolha o dia da semana.
  3. Defina séries e repetições.
  4. Toque em "Salvar".

#### 👤 Tela de Cadastro do Professor
- *Objetivo:* Registrar novos instrutores.
- *Passos:*
  ➤ Preencha os dados do professor (nome, CRM, etc.).  
  ➤ Toque em "Cadastrar".

#### ❓ Tela de Perguntas Frequentes (FAQ)
- *Objetivo:* Solucionar dúvidas rápidas.
- *Como usar:*  
  ➤ Role a tela para ver as perguntas e respostas.  
  ➤ Use a barra de busca para encontrar tópicos específicos.

---

### 🧑‍💻 Telas do Aluno

#### 🏠 Tela Inicial do Aluno
- *Objetivo:* Visualizar treinos ativos.
- *Funcionalidades:*
  ➤ Veja os treinos do dia.  
  ➤ Acesse o calendário semanal no topo da tela.

#### 📋 Tela de Treino do Aluno
- *Objetivo:* Acompanhar os treinos atribuídos.
- *Como usar:*  
  ➤ Toque em um treino para ver os detalhes.  
  ➤ Use o calendário para planejar sua semana.

#### ⚙️ Tela de Configurações da Conta (Aluno)
- *Objetivo:* Personalizar perfil.
- *Ações:*
  ➤ Toque em "Editar Perfil" para alterar dados.  
  ➤ Toque em "Sair" para deslogar do app.

#### 🎯 Tela de Visualização de Treino
- *Objetivo:* Executar treinos.
- *Passos:*
  ➤ Toque em "Iniciar Treino".  
  ➤ Siga as instruções exibidas.  
  ➤ Toque em "Finalizar" ao concluir.

#### 📊 Tela de Desempenho (Aluno)
- *Objetivo:* Monitorar progresso.
- *Funcionalidades:*
  ➤ *Histórico:* Veja todos os treinos concluídos.  
  ➤ *Medidas:* Atualize peso, altura, etc.  
  ➤ *Gráficos:* Acompanhe sua evolução física.

## 🧰 Tecnologias Utilizadas

- *Frontend:* [React Native](https://reactnative.dev/)
- *Backend:* [Node.js](https://nodejs.org/)
- *Banco de Dados:* [Firebase Firestore](https://firebase.google.com/products/firestore)
- *API e Backend hospedado:* [Railway](https://railway.app/)
- *Distribuição do App:* [Expo](https://expo.dev/)

## 📦 Baixe o APK

📲 [Clique aqui para baixar o aplicativo MundoFit](https://expo.dev/accounts/druwg/projects/mundoFit/builds/26b1c77d-d062-4428-a039-92555a4e96d8)

> ⚠️ Para instalar o APK, você pode precisar habilitar a instalação de apps de fontes desconhecidas no seu dispositivo Android.

## 👥 Equipe

| Nome             | Função                         |
|------------------|--------------------------------|
| Anna Isabelle    | Desenvolvedora Frontend        |
| César Rodrigues  | Desenvolvedor Backend          |
| Evily Maria      | Banco de Dados e Suporte       |
