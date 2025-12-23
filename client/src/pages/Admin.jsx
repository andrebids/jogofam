import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import QuestionTable from '../components/QuestionTable';
import styles from '../styles/Admin.module.css';

function Admin() {
  const { socket, connected, emit } = useSocket();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/questions/all');
      const data = await response.json();
      setQuestions(data || []);
    } catch (error) {
      showMessage('error', 'Erro ao carregar perguntas');
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      setQuestions(newState.questions || []);
    };

    socket.on('stateSync', handleStateSync);

    // Carregar perguntas iniciais
    loadQuestions();

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket]);

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

        {/* Seção de Debug */}
        <section className={styles.section}>
          <h2>🔧 Debug - Páginas Finais</h2>
          <div className={styles.actions}>
            <button
              onClick={() => navigate('/game-end')}
              className={styles.button}
            >
              📊 Ver Página de Resultados
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;

