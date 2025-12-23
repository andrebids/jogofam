import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getQuestions, getAllQuestions, saveQuestions, getConfig, updateConfig, saveConfig } from '../utils/storage.js';
import { parseCSV, generateCSV } from '../utils/csvParser.js';
import { listAudioFiles, getUploadsDir } from '../utils/fileManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp3|m4a|wav|jpg|jpeg|png|webp)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype.startsWith('audio/') || 
                     file.mimetype.startsWith('image/');
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido. Use MP3/WAV para áudio ou JPG/PNG/WEBP para imagens.'));
    }
  }
});

// Rotas de perguntas
router.get('/questions', (req, res) => {
  try {
    const questions = getQuestions();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar perguntas' });
  }
});

router.get('/questions/all', (req, res) => {
  try {
    const questions = getAllQuestions();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar todas as perguntas' });
  }
});

router.post('/questions', (req, res) => {
  try {
    const questions = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Perguntas devem ser um array' });
    }
    
    const validQuestions = questions.map((q, idx) => ({
      id: q.id || Date.now() + idx,
      ordem: q.ordem !== undefined ? q.ordem : idx + 1,
      pergunta: q.pergunta || '',
      ativo: q.ativo !== false
    }));
    
    saveQuestions(validQuestions);
    res.json({ success: true, questions: validQuestions });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao guardar perguntas' });
  }
});

// Rotas de estado
router.get('/state', (req, res) => {
  try {
    const questions = getQuestions();
    const config = getConfig();
    const currentQuestion = questions[config.currentIndex] || null;
    
    res.json({
      questions,
      currentIndex: config.currentIndex,
      currentQuestion,
      totalQuestions: questions.length,
      audio: config.audio
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estado' });
  }
});

router.post('/state/reset', (req, res) => {
  try {
    updateConfig({ currentIndex: 0 });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar estado' });
  }
});

// Rotas de upload
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
    }
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro ao fazer upload' });
  }
});

// Rotas de áudio
router.get('/audio/list', (req, res) => {
  try {
    const files = listAudioFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar ficheiros de áudio' });
  }
});

// Rotas de import/export
router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
    }
    
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    let questions = [];
    
    if (req.file.originalname.endsWith('.json')) {
      questions = JSON.parse(fileContent);
    } else if (req.file.originalname.endsWith('.csv')) {
      questions = parseCSV(fileContent);
    } else {
      return res.status(400).json({ error: 'Formato de ficheiro não suportado' });
    }
    
    // Validar e salvar
    const validQuestions = questions.map((q, idx) => ({
      id: q.id || Date.now() + idx,
      ordem: q.ordem !== undefined ? q.ordem : idx + 1,
      pergunta: q.pergunta || '',
      ativo: q.ativo !== false
    }));
    
    saveQuestions(validQuestions);
    
    // Apagar ficheiro temporário
    fs.unlinkSync(filePath);
    
    res.json({ success: true, questions: validQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro ao importar ficheiro' });
  }
});

router.get('/export', (req, res) => {
  try {
    const format = req.query.format || 'json';
    const questions = getAllQuestions();
    
    if (format === 'csv') {
      const csv = generateCSV(questions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=questions.json');
      res.json(questions);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar perguntas' });
  }
});

export default router;

