import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Garantir que o diretório existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export function listAudioFiles() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.mp3' || ext === '.m4a' || ext === '.wav';
    }).map(file => ({
      filename: file,
      url: `/uploads/${file}`
    }));
  } catch (error) {
    console.error('Erro ao listar ficheiros de áudio:', error);
    return [];
  }
}

export function deleteFile(filename) {
  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao apagar ficheiro:', error);
    return false;
  }
}

