# Jogo de Família - App Web Local

Uma aplicação web para jogos de família que funciona em rede local, permitindo exibir perguntas numa TV e controlá-las através de dispositivos móveis ou PC.

## Características

- 📺 **Display TV** - Página otimizada para TV com tema de Natal elegante
- 📱 **Controle Remoto** - Interface simples para avançar/retroceder perguntas
- ⚙️ **Painel Admin** - Gestão completa de perguntas, import/export e controlo de áudio
- 🔄 **Sincronização em Tempo Real** - WebSockets para sincronização instantânea
- 🎵 **Música de Fundo** - Suporte para música de fundo em loop
- 💾 **Persistência Local** - Dados guardados em JSON, sem necessidade de base de dados

## Requisitos

- Node.js 18+ 
- npm ou yarn

## Instalação

1. **Instalar dependências**:
   ```bash
   npm run install:all
   ```

   Ou manualmente:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

## Execução

### Modo Desenvolvimento

Roda o servidor e o cliente em paralelo:

```bash
npm run dev
```

- Servidor: `http://localhost:3000`
- Cliente (Vite): `http://localhost:5173` (com hot reload)

### Modo Produção

1. **Build do frontend**:
   ```bash
   npm run build
   ```

2. **Iniciar servidor**:
   ```bash
   npm start
   ```

   Ou:
   ```bash
   cd server && npm start
   ```

O servidor estará disponível em `http://localhost:3000`

## Acesso na Rede Local

Para aceder a partir de outros dispositivos na mesma rede Wi-Fi:

1. **Iniciar o servidor**: O IP local é detectado e exibido automaticamente no console quando o servidor inicia.

2. **Aceder às páginas** usando o IP mostrado no console:
   - **TV Display**: `http://SEU_IP:3000/tv`
   - **Remote**: `http://SEU_IP:3000/remote`
   - **Admin**: `http://SEU_IP:3000/admin`

3. **Nota**: 
   - O servidor está configurado para aceitar conexões de qualquer IP na rede local (`0.0.0.0`)
   - Se o IP não for detectado automaticamente, descubra manualmente:
     - **Windows**: `ipconfig` no PowerShell/CMD
     - **Linux/Mac**: `ifconfig` ou `ip addr`

## Estrutura do Projeto

```
jogo/
├── server/           # Backend Express + Socket.io
│   ├── src/
│   │   ├── app.js    # Servidor principal
│   │   ├── routes/   # Rotas API
│   │   ├── socket/   # Handlers Socket.io
│   │   ├── storage/  # JSON de persistência
│   │   └── utils/    # Utilitários
│   └── public/       # Ficheiros estáticos
├── client/           # Frontend React + Vite
│   └── src/
│       ├── pages/    # Páginas (TV, Remote, Admin)
│       ├── components/
│       ├── hooks/
│       └── styles/
├── data/             # Dados de exemplo
└── README.md
```

## Páginas

### `/tv` - Display TV
- Exibe a pergunta atual em grande
- Tema de Natal elegante com efeitos visuais
- Suporte para música de fundo
- Botão "Ativar Som" para contornar bloqueio de autoplay

### `/remote` - Controle Remoto
- Botões grandes para navegação (Anterior/Seguinte)
- Botão para revelar/ocultar resposta
- Preview da pergunta atual
- Design otimizado para telemóveis

### `/admin` - Painel de Administração
- Tabela editável de perguntas
- Importar/Exportar (JSON e CSV)
- Upload de ficheiros MP3
- Controlo de música (selecionar, volume, play/pause)
- Reset do jogo

## Importar Perguntas

### Formato JSON
```json
[
  {
    "id": 1,
    "ordem": 1,
    "pergunta": "Qual é a capital de Portugal?",
    "resposta": "Lisboa",
    "categoria": "Geografia",
    "ativo": true
  }
]
```

### Formato CSV
```csv
pergunta,resposta,categoria
"Qual é a capital de Portugal?","Lisboa","Geografia"
```

Ficheiros de exemplo estão disponíveis em `data/`:
- `questions-example.json`
- `questions-example.csv`

## Funcionalidades

### Sincronização em Tempo Real
- Todas as mudanças são sincronizadas instantaneamente via WebSockets
- Reconexão automática se a ligação cair
- Estado mantido no servidor (source of truth)

### Música de Fundo
- Upload de ficheiros MP3 através do admin
- Controlo de volume e play/pause
- Loop automático
- Sincronização entre todos os clientes

### Persistência
- Perguntas guardadas em `server/src/storage/questions.json`
- Configuração em `server/src/storage/config.json`
- Dados persistem após reiniciar o servidor

## Resolução de Problemas

### Não consigo aceder na rede local
- Verificar que o firewall permite conexões na porta 3000
- Confirmar que todos os dispositivos estão na mesma rede Wi-Fi
- Verificar o IP local do servidor

### Áudio não toca na TV
- Browsers bloqueiam autoplay com som por padrão
- Clicar no botão "Ativar Som" na primeira vez
- Verificar que o ficheiro MP3 foi carregado corretamente

### Socket.io não conecta
- Verificar que o servidor está a correr
- Verificar que a porta 3000 está acessível
- Verificar console do browser para erros

## Tecnologias Utilizadas

- **Backend**: Express, Socket.io, Multer
- **Frontend**: React, Vite, React Router
- **Estilização**: CSS Modules
- **Persistência**: JSON local

## Licença

MIT

