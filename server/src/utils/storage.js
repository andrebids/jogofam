import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '../storage');
const QUESTIONS_FILE = path.join(STORAGE_DIR, 'questions.json');
const CONFIG_FILE = path.join(STORAGE_DIR, 'config.json');
const ANSWERS_FILE = path.join(STORAGE_DIR, 'answers.json');

// Garantir que o diretório existe
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Função genérica para ler JSON
function readJSON(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      if (defaultValue !== null) {
        writeJSON(filePath, defaultValue);
        return defaultValue;
      }
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
    return defaultValue !== null ? defaultValue : null;
  }
}

// Função genérica para escrever JSON
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filePath}:`, error);
    return false;
  }
}

// Funções específicas para perguntas
export function getQuestions() {
  const questions = readJSON(QUESTIONS_FILE, []);
  return questions.filter(q => q.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

export function getAllQuestions() {
  return readJSON(QUESTIONS_FILE, []);
}

export function saveQuestions(questions) {
  return writeJSON(QUESTIONS_FILE, questions);
}

// Funções específicas para config
export function getConfig() {
  return readJSON(CONFIG_FILE, {
    currentIndex: 0,
    audio: {
      track: null,
      volume: 0.5,
      playing: false
    }
  });
}

export function saveConfig(config) {
  return writeJSON(CONFIG_FILE, config);
}

export function updateConfig(updates) {
  const config = getConfig();
  const newConfig = { ...config, ...updates };
  return saveConfig(newConfig);
}

// Funções específicas para respostas
const ELEMENTS = ['Noinoi', 'André', 'Linda', 'Pedro', 'Lanita', 'Mom', 'meu querido'];

function getDefaultAnswers() {
  return {
    gameId: Date.now(),
    answers: [],
    scores: {
      'Noinoi': 0,
      'André': 0,
      'Linda': 0,
      'Pedro': 0,
      'Lanita': 0,
      'Mom': 0,
      'meu querido': 0
    }
  };
}

export function getAnswers() {
  return readJSON(ANSWERS_FILE, getDefaultAnswers());
}

export function saveAnswer(questionIndex, element) {
  const answersData = getAnswers();
  
  // Verificar se já existe resposta para esta pergunta
  const existingAnswerIndex = answersData.answers.findIndex(
    a => a.questionIndex === questionIndex
  );
  
  const answerEntry = {
    questionIndex,
    element,
    timestamp: Date.now()
  };
  
  if (existingAnswerIndex >= 0) {
    // Atualizar resposta existente
    const oldElement = answersData.answers[existingAnswerIndex].element;
    if (oldElement !== element) {
      // Decrementar contador do elemento antigo
      if (answersData.scores[oldElement] > 0) {
        answersData.scores[oldElement]--;
      }
      // Incrementar contador do novo elemento
      answersData.scores[element] = (answersData.scores[element] || 0) + 1;
    }
    answersData.answers[existingAnswerIndex] = answerEntry;
  } else {
    // Nova resposta
    answersData.answers.push(answerEntry);
    answersData.scores[element] = (answersData.scores[element] || 0) + 1;
  }
  
  return writeJSON(ANSWERS_FILE, answersData);
}

export function getScores() {
  const answersData = getAnswers();
  return answersData.scores;
}

export function resetAnswers() {
  const defaultAnswers = getDefaultAnswers();
  defaultAnswers.gameId = Date.now();
  return writeJSON(ANSWERS_FILE, defaultAnswers);
}

export function getWinner() {
  const scores = getScores();
  let maxScore = -1;
  let winner = null;
  
  for (const [element, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = element;
    }
  }
  
  return winner;
}

