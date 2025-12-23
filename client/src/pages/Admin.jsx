import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import QuestionTable from '../components/QuestionTable';
import styles from '../styles/Admin.module.css';

function Admin() {
  const { socket, connected, emit } = useSocket();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [audio, setAudio] = useState({ track: null, volume: 0.5, playing: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      setQuestions(newState.questions || []);
      if (newState.audio) {
        setAudio(newState.audio);
      }
    };

    socket.on('stateSync', handleStateSync);

    // Carregar perguntas iniciais
    loadQuestions();
    loadAudioFiles();

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket]);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/questions/all');
      const data = await response.json();
      setQuestions(data || []);
    } catch (error) {
      showMessage('error', 'Erro ao carregar perguntas');
    }
  };

  const loadAudioFiles = async () => {
    try {
      const response = await fetch('/api/audio/list');
      const data = await response.json();
      setAudioFiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar ficheiros de áudio:', error);
    }
  };

  const handleSaveQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions)
      });

      if (response.ok) {
        emit('updateQuestions', questions);
        showMessage('success', 'Perguntas guardadas com sucesso!');
      } else {
        showMessage('error', 'Erro ao guardar perguntas');
      }
    } catch (error) {
      showMessage('error', 'Erro ao guardar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tem certeza que deseja resetar o jogo para a primeira pergunta?')) {
      return;
    }

    try {
      const response = await fetch('/api/state/reset', { method: 'POST' });
      if (response.ok) {
        emit('setQuestionIndex', 0);
        showMessage('success', 'Jogo resetado!');
      }
    } catch (error) {
      showMessage('error', 'Erro ao resetar jogo');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', 'Ficheiro carregado com sucesso!');
        loadAudioFiles();
        e.target.value = ''; // Reset input
      } else {
        showMessage('error', 'Erro ao carregar ficheiro');
      }
    } catch (error) {
      showMessage('error', 'Erro ao carregar ficheiro');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        emit('updateQuestions', data.questions);
        showMessage('success', 'Ficheiro importado com sucesso!');
        e.target.value = '';
      } else {
        showMessage('error', 'Erro ao importar ficheiro');
      }
    } catch (error) {
      showMessage('error', 'Erro ao importar ficheiro');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showMessage('success', 'Ficheiro exportado com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao exportar ficheiro');
    }
  };

  const handleAudioTrackChange = (e) => {
    const track = e.target.value || null;
    emit('audio:setTrack', track);
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    emit('audio:setVolume', volume);
  };

  const handlePlayPause = () => {
    emit('audio:playPause');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Painel de Administração</h1>
        {!connected && (
          <div className={styles.connectionStatus}>Conectando ao servidor...</div>
        )}
      </header>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.sections}>
        {/* Seção de Perguntas */}
        <section className={styles.section}>
          <h2>Gestão de Perguntas</h2>
          <div className={styles.actions}>
            <button
              onClick={handleSaveQuestions}
              disabled={loading || !connected}
              className={styles.primaryButton}
            >
              {loading ? 'A guardar...' : '💾 Guardar Perguntas'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading || !connected}
              className={styles.button}
            >
              🔄 Reset Jogo
            </button>
          </div>

          <QuestionTable questions={questions} onUpdate={setQuestions} />

          <div className={styles.importExport}>
            <div>
              <h3>Importar</h3>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleImport}
                className={styles.fileInput}
                id="importFile"
              />
              <label htmlFor="importFile" className={styles.fileLabel}>
                📥 Escolher ficheiro (JSON ou CSV)
              </label>
            </div>
            <div>
              <h3>Exportar</h3>
              <button onClick={() => handleExport('json')} className={styles.button}>
                📤 Exportar JSON
              </button>
              <button onClick={() => handleExport('csv')} className={styles.button}>
                📤 Exportar CSV
              </button>
            </div>
          </div>
        </section>

        {/* Seção de Áudio */}
        <section className={styles.section}>
          <h2>Controlo de Áudio</h2>
          
          <div className={styles.audioControls}>
            <div className={styles.audioUpload}>
              <h3>Carregar Música</h3>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className={styles.fileInput}
                id="audioFile"
              />
              <label htmlFor="audioFile" className={styles.fileLabel}>
                🎵 Escolher ficheiro MP3
              </label>
            </div>

            <div className={styles.audioSelect}>
              <h3>Música Ativa</h3>
              <select
                value={audio.track || ''}
                onChange={handleAudioTrackChange}
                className={styles.select}
              >
                <option value="">Nenhuma</option>
                {audioFiles.map((file) => (
                  <option key={file.filename} value={file.url}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.audioVolume}>
              <h3>Volume: {Math.round(audio.volume * 100)}%</h3>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audio.volume}
                onChange={handleVolumeChange}
                className={styles.slider}
              />
            </div>

            <div className={styles.audioPlayPause}>
              <button
                onClick={handlePlayPause}
                disabled={!audio.track}
                className={styles.primaryButton}
              >
                {audio.playing ? '⏸️ Pausar' : '▶️ Tocar'}
              </button>
            </div>
          </div>
        </section>

        {/* Seção de Debug */}
        <section className={styles.section}>
          <h2>🔧 Debug - Páginas Finais</h2>
          <div className={styles.actions}>
            <button
              onClick={() => {
                emit('debug:populateTestData');
                showMessage('success', 'Dados de teste populados! Navegue para as páginas finais.');
              }}
              disabled={!connected}
              className={styles.button}
            >
              🎲 Popular Dados de Teste
            </button>
            <button
              onClick={() => navigate('/game-end')}
              className={styles.button}
            >
              📊 Ver Página de Resultados
            </button>
          </div>
          <p className={styles.debugNote}>
            Use "Popular Dados de Teste" para criar respostas fictícias, depois navegue para as páginas finais para visualizar.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Admin;

