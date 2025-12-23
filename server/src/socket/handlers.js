import { getQuestions, getConfig, updateConfig, saveQuestions, saveAnswer, getScores, resetAnswers, getWinner, getAnswers } from '../utils/storage.js';

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
      
      // Guardar resposta
      saveAnswer(config.currentIndex, element);
      
      // Atualizar elemento selecionado
      updateConfig({ selectedElement: element });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('debug:populateTestData', () => {
      // Popular dados de teste para debug
      const questions = getQuestions();
      const elements = ['Noinoi', 'Mauro', 'Linda', 'Pedro', 'Lanita', 'Mom', 'Meu Querido'];
      
      // Resetar respostas primeiro
      resetAnswers();
      
      // Criar respostas de teste para algumas perguntas
      questions.forEach((question, index) => {
        if (index < Math.min(questions.length, 10)) {
          const randomElement = elements[Math.floor(Math.random() * elements.length)];
          saveAnswer(index, randomElement);
        }
      });
      
      // Ir para última pergunta e selecionar um elemento
      const lastIndex = questions.length - 1;
      if (lastIndex >= 0) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        updateConfig({ currentIndex: lastIndex, selectedElement: randomElement });
        saveAnswer(lastIndex, randomElement);
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
  const currentQuestion = questions[config.currentIndex] || null;
  const scores = getScores();
  const isLastQuestion = config.currentIndex >= questions.length - 1;
  const gameEnded = isLastQuestion && config.selectedElement !== null;
  
  // Obter resposta da pergunta atual
  const answersData = getAnswers();
  const currentAnswerEntry = answersData.answers.find(
    a => a.questionIndex === config.currentIndex
  );
  const currentAnswer = currentAnswerEntry ? currentAnswerEntry.element : null;
  
  return {
    questions,
    currentIndex: config.currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    audio: config.audio,
    selectedElement: config.selectedElement || null,
    currentAnswer,
    scores,
    gameEnded
  };
}

