import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '../storage');
const QUESTIONS_FILE = path.join(STORAGE_DIR, 'questions.json');
const CONFIG_FILE = path.join(STORAGE_DIR, 'config.json');

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

