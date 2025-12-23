import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Servir React build em produção
const clientPath = path.join(__dirname, '../../public/client');

router.get('*', (req, res, next) => {
  // Se for uma rota da API, passar adiante
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
    return next();
  }
  
  // Servir index.html para todas as outras rotas (SPA)
  res.sendFile(path.join(clientPath, 'index.html'));
});

export default router;

