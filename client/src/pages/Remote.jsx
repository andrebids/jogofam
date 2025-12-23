import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Remote.module.css';

const ELEMENTS = ['Noinoi', 'André', 'Linda', 'Pedro', 'Lanita', 'Mom', 'meu querido'];

function Remote() {
  const { socket, connected, emit } = useSocket();
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    selectedElement: null,
    gameEnded: false
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

  const handleSelectElement = (element) => {
    if (!connected || state.gameEnded) return;
    emit('selectElement', element);
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
            Quem é mais provável ?
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

      {state.currentQuestion && (
        <div className={styles.elementsSection}>
          <h2 className={styles.elementsTitle}>Escolher elemento:</h2>
          <div className={styles.elementsGrid}>
            {ELEMENTS.map((element) => (
              <button
                key={element}
                onClick={() => handleSelectElement(element)}
                disabled={!connected || state.gameEnded}
                className={`${styles.elementButton} ${
                  state.selectedElement === element ? styles.elementButtonSelected : ''
                }`}
              >
                {element}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Remote;

