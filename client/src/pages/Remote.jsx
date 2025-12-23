import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Remote.module.css';

const ELEMENTS = ['Noinoi', 'Mauro', 'Linda', 'Pedro', 'Lanita', 'Mom', 'Meu Querido'];

function Remote() {
  const { socket, connected, emit } = useSocket();
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    selectedElement: null,
    gameEnded: false
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleResetClick = () => {
    if (!connected) return;
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    emit('resetGame');
    setShowResetConfirm(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
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
          disabled={!connected || state.currentIndex >= state.totalQuestions - 1 || state.selectedElement === null}
          className={`${styles.button} ${styles.buttonNext} ${
            state.selectedElement === null && state.currentQuestion ? styles.buttonNextDisabled : ''
          }`}
        >
          Seguinte →
        </button>
      </div>

      <div className={styles.resetSection}>
        <button
          onClick={handleResetClick}
          disabled={!connected}
          className={`${styles.button} ${styles.buttonReset}`}
        >
          🔄 Reset Jogo
        </button>
      </div>

      {showResetConfirm && (
        <div className={styles.modalOverlay} onClick={handleResetCancel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>⚠️ Confirmar Reset</h2>
            </div>
            <div className={styles.modalBody}>
              <p>Tem a certeza que deseja fazer reset ao jogo?</p>
              <p className={styles.modalWarning}>
                Todas as respostas e estatísticas serão apagadas e o jogo voltará para a pergunta 1.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={handleResetCancel}
                className={`${styles.modalButton} ${styles.modalButtonCancel}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetConfirm}
                className={`${styles.modalButton} ${styles.modalButtonConfirm}`}
              >
                Confirmar Reset
              </button>
            </div>
          </div>
        </div>
      )}

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

