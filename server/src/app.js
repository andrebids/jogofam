import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import indexRoutes from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Aceitar conexões de qualquer IP na rede local

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir ficheiros estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rotas API
app.use('/api', apiRoutes);

// Servir React build em produção
const clientPath = path.join(__dirname, '../public/client');
app.use(express.static(clientPath));

// Rotas SPA (deve ser a última)
app.use('*', indexRoutes);

// Setup Socket.io
setupSocketHandlers(io);

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Servidor iniciado em http://${HOST}:${PORT}`);
  console.log(`📺 TV Display: http://localhost:${PORT}/tv`);
  console.log(`📱 Remote: http://localhost:${PORT}/remote`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`\n💡 Para aceder na rede local, use o IP do computador:`);
  console.log(`   Exemplo: http://192.168.1.100:${PORT}/tv\n`);
});

