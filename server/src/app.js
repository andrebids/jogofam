import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
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

// Função para obter IP da rede local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar endereços internos e não IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (
          iface.address.startsWith('192.168.') ||
          iface.address.startsWith('10.') ||
          iface.address.startsWith('172.16.') ||
          iface.address.startsWith('172.17.') ||
          iface.address.startsWith('172.18.') ||
          iface.address.startsWith('172.19.') ||
          iface.address.startsWith('172.20.') ||
          iface.address.startsWith('172.21.') ||
          iface.address.startsWith('172.22.') ||
          iface.address.startsWith('172.23.') ||
          iface.address.startsWith('172.24.') ||
          iface.address.startsWith('172.25.') ||
          iface.address.startsWith('172.26.') ||
          iface.address.startsWith('172.27.') ||
          iface.address.startsWith('172.28.') ||
          iface.address.startsWith('172.29.') ||
          iface.address.startsWith('172.30.') ||
          iface.address.startsWith('172.31.')
        ) {
          return iface.address;
        }
      }
    }
  }
  // Se não encontrar IP da rede local, retornar o primeiro IPv4 não interno
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Iniciar servidor
server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  
  console.log(`\n🚀 Servidor iniciado em http://${HOST}:${PORT}`);
  console.log(`\n📱 Acesso Local:`);
  console.log(`   📺 TV Display: http://localhost:${PORT}/tv`);
  console.log(`   📱 Remote: http://localhost:${PORT}/remote`);
  console.log(`   ⚙️  Admin: http://localhost:${PORT}/admin`);
  
  if (localIP) {
    console.log(`\n🌐 Acesso na Rede Local (IP: ${localIP}):`);
    console.log(`   📺 TV Display: http://${localIP}:${PORT}/tv`);
    console.log(`   📱 Remote: http://${localIP}:${PORT}/remote`);
    console.log(`   ⚙️  Admin: http://${localIP}:${PORT}/admin`);
  } else {
    console.log(`\n💡 Para aceder na rede local:`);
    console.log(`   1. Descubra o IP do computador (ipconfig no Windows)`);
    console.log(`   2. Use: http://SEU_IP:${PORT}/tv (ou /remote ou /admin)`);
  }
  console.log('');
});

