import { getQuestions, getConfig, updateConfig, saveQuestions } from '../utils/storage.js';

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
      
      const newIndex = Math.min(config.currentIndex + 1, questions.length - 1);
      updateConfig({ currentIndex: newIndex });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('prevQuestion', () => {
      const config = getConfig();
      const newIndex = Math.max(config.currentIndex - 1, 0);
      updateConfig({ currentIndex: newIndex });
      
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
    
    socket.on('toggleReveal', () => {
      const config = getConfig();
      updateConfig({ revealAnswer: !config.revealAnswer });
      
      const newState = getCurrentState();
      io.emit('stateSync', newState);
    });
    
    socket.on('updateQuestions', (questions) => {
      // Validar e salvar perguntas
      const validQuestions = questions.map((q, idx) => ({
        id: q.id || Date.now() + idx,
        ordem: q.ordem !== undefined ? q.ordem : idx + 1,
        pergunta: q.pergunta || '',
        resposta: q.resposta || '',
        categoria: q.categoria || '',
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
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

function getCurrentState() {
  const questions = getQuestions();
  const config = getConfig();
  const currentQuestion = questions[config.currentIndex] || null;
  
  return {
    questions,
    currentIndex: config.currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    revealAnswer: config.revealAnswer,
    audio: config.audio
  };
}

