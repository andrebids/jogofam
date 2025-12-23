import { getQuestions, getConfig, updateConfig, saveConfig, saveQuestions, saveAnswer, getScores, resetAnswers, getWinner, getAnswers, generateRandomQuestionOrder } from '../utils/storage.js';

let ioInstance = null;

export function setupSocketHandlers(io) {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    // Enviar estado atual ao conectar
    const state = getCurrentState();
    socket.emit('stateSync', state);
    
    // Eventos de navegação
    socket.on('nextQuestion', () => {
      const config = getConfig();
      const questions = getQuestions();
      if (questions.length === 0) return;
      
      const previousIndex = config.currentIndex;
      const newIndex = Math.min(config.currentIndex + 1, questions.length - 1);
      
      // Resetar respostas se voltou à pergunta 1
      if (previousIndex > 0 && newIndex === 0) {
        resetAnswers();
        updateConfig({ currentIndex: newIndex, selectedElement: null });
      } else {
        updateConfig({ currentIndex: newIndex, selectedElement: null });
      }
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('prevQuestion', () => {
      const config = getConfig();
      const previousIndex = config.currentIndex;
      const newIndex = Math.max(config.currentIndex - 1, 0);
      
      // Resetar respostas se voltou à pergunta 1
      if (previousIndex > 0 && newIndex === 0) {
        resetAnswers();
        updateConfig({ currentIndex: newIndex, selectedElement: null });
      } else {
        updateConfig({ currentIndex: newIndex, selectedElement: null });
      }
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('setQuestionIndex', (index) => {
      const config = getConfig();
      const questions = getQuestions();
      const newIndex = Math.max(0, Math.min(index, questions.length - 1));
      updateConfig({ currentIndex: newIndex });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('updateQuestions', (questions) => {
      // Validar e salvar perguntas
      const validQuestions = questions.map((q, idx) => ({
        id: q.id || Date.now() + idx,
        ordem: q.ordem !== undefined ? q.ordem : idx + 1,
        pergunta: q.pergunta || '',
        ativo: q.ativo !== false
      }));
      
      saveQuestions(validQuestions);
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('audio:setTrack', (track) => {
      const config = getConfig();
      updateConfig({
        audio: {
          ...config.audio,
          track: track
        }
      });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('audio:setVolume', (volume) => {
      const config = getConfig();
      updateConfig({
        audio: {
          ...config.audio,
          volume: Math.max(0, Math.min(1, volume))
        }
      });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('audio:playPause', () => {
      const config = getConfig();
      updateConfig({
        audio: {
          ...config.audio,
          playing: !config.audio.playing
        }
      });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('selectElement', (element) => {
      const config = getConfig();
      const questions = getQuestions();
      
      if (!element || questions.length === 0) return;
      
      // Validar/inicializar questionOrder se necessário
      const totalQuestions = questions.length;
      if (!config.questionOrder || config.questionOrder.length !== totalQuestions) {
        config.questionOrder = generateRandomQuestionOrder(totalQuestions);
        saveConfig(config);
      }
      
      // Obter índice real da pergunta atual via questionOrder
      const realQuestionIndex = config.questionOrder[config.currentIndex];
      
      // Guardar resposta usando índice REAL da pergunta
      saveAnswer(realQuestionIndex, element);
      
      // Atualizar elemento selecionado
      updateConfig({ selectedElement: element });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('resetGame', () => {
      // Resetar todas as respostas e scores
      resetAnswers();
      
      // Gerar nova ordem aleatória das perguntas
      const questions = getQuestions();
      const totalQuestions = questions.length;
      const newQuestionOrder = generateRandomQuestionOrder(totalQuestions);
      
      // Voltar para a pergunta 1 e limpar elemento selecionado com nova ordem
      updateConfig({ 
        currentIndex: 0, 
        selectedElement: null,
        questionOrder: newQuestionOrder
      });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('debug:populateTestData', () => {
      // Popular dados de teste para debug
      const questions = getQuestions();
      const elements = ['Noinoi', 'Mauro', 'Linda', 'Pedro', 'Lanita', 'Mom', 'Meu Querido'];
      
      // Resetar respostas primeiro
      resetAnswers();
      
      // Garantir que há questionOrder válida
      const config = getConfig();
      const totalQuestions = questions.length;
      if (!config.questionOrder || config.questionOrder.length !== totalQuestions) {
        config.questionOrder = generateRandomQuestionOrder(totalQuestions);
        saveConfig(config);
      }
      
      // Criar respostas de teste para algumas perguntas usando índices reais
      for (let sequenceIndex = 0; sequenceIndex < Math.min(questions.length, 10); sequenceIndex++) {
        const realQuestionIndex = config.questionOrder[sequenceIndex];
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        saveAnswer(realQuestionIndex, randomElement);
      }
      
      // Ir para última pergunta e selecionar um elemento
      const lastIndex = questions.length - 1;
      if (lastIndex >= 0) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        const realQuestionIndex = config.questionOrder[lastIndex];
        updateConfig({ currentIndex: lastIndex, selectedElement: randomElement });
        saveAnswer(realQuestionIndex, randomElement);
      }
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

function getCurrentState() {
  const questions = getQuestions();
  const config = getConfig();
  const totalQuestions = questions.length;
  
  // Validar/inicializar questionOrder se necessário
  if (!config.questionOrder || config.questionOrder.length !== totalQuestions) {
    config.questionOrder = generateRandomQuestionOrder(totalQuestions);
    saveConfig(config);
  }
  
  // Mapear currentIndex para índice real da pergunta
  const realQuestionIndex = config.questionOrder[config.currentIndex];
  const currentQuestion = questions[realQuestionIndex] || null;
  
  // Detectar se estamos na primeira pergunta da sequência
  const isFirstQuestion = config.currentIndex === 0;
  
  // Obter resposta da pergunta atual - IMPORTANTE: usar índice REAL da pergunta
  const answersData = getAnswers();
  const currentAnswerEntry = answersData.answers.find(
    a => a.questionIndex === realQuestionIndex // Usar realQuestionIndex, não config.currentIndex
  );
  const currentAnswer = currentAnswerEntry ? currentAnswerEntry.element : null;
  
  // Obter scores (não afetado pela ordem)
  const scores = getScores();
  const isLastQuestion = config.currentIndex >= questions.length - 1;
  const gameEnded = isLastQuestion && config.selectedElement !== null;
  
  return {
    questions,
    currentIndex: config.currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    audio: config.audio,
    selectedElement: config.selectedElement || null,
    currentAnswer,
    scores,
    gameEnded,
    isFirstQuestion // true quando currentIndex === 0 (indica início/reset do jogo)
  };
}

