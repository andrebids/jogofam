import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Remote.module.css';

function Remote() {
  const { socket, connected, emit } = useSocket();
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    revealAnswer: false
  });

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      setState(newState);
    };

    socket.on('stateSync', handleStateSync);

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket]);

  const handleNext = () => {
    emit('nextQuestion');
  };

  const handlePrev = () => {
    emit('prevQuestion');
  };

  const handleToggleReveal = () => {
    emit('toggleReveal');
  };

  return (
    <div className={styles.container}>
      {!connected && (
        <div className={styles.connectionStatus}>
          Conectando ao servidor...
        </div>
      )}

      <div className={styles.header}>
        <h1>Controle Remoto</h1>
        <div className={styles.questionInfo}>
          <div className={styles.questionNumber}>
            Pergunta {state.currentIndex + 1} / {state.totalQuestions}
          </div>
          {state.currentQuestion && (
            <div className={styles.questionPreview}>
              {state.currentQuestion.pergunta}
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={handlePrev}
          disabled={!connected || state.currentIndex === 0}
          className={`${styles.button} ${styles.buttonPrev}`}
        >
          ← Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!connected || state.currentIndex >= state.totalQuestions - 1}
          className={`${styles.button} ${styles.buttonNext}`}
        >
          Seguinte →
        </button>
      </div>

      <div className={styles.revealSection}>
        <button
          onClick={handleToggleReveal}
          disabled={!connected || !state.currentQuestion?.resposta}
          className={`${styles.button} ${styles.buttonReveal} ${state.revealAnswer ? styles.active : ''}`}
        >
          {state.revealAnswer ? '👁️ Ocultar' : '👁️ Revelar'} Resposta
        </button>
      </div>
    </div>
  );
}

export default Remote;

