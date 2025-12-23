import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/GameEnd.module.css';

function GameEnd() {
  const { socket, connected, emit } = useSocket();
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      if (newState.scores) {
        setScores(newState.scores);
        // Calcular vencedor
        const scoresArray = Object.entries(newState.scores);
        if (scoresArray.length > 0) {
          const winnerEntry = scoresArray
            .sort(([, a], [, b]) => b - a)[0];
          if (winnerEntry && winnerEntry[1] > 0) {
            setWinner(winnerEntry[0]);
          }
        }
      }
    };

    socket.on('stateSync', handleStateSync);

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket, connected]);

  const handleBackToStart = () => {
    // Resetar jogo voltando à pergunta 1
    emit('setQuestionIndex', 0);
    navigate('/tv');
  };

  const sortedScores = Object.entries(scores)
    .map(([element, score]) => ({ element, score }))
    .sort((a, b) => b.score - a.score);

  const maxScore = Object.values(scores).length > 0 
    ? Math.max(...Object.values(scores), 0) 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.confetti}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={styles.confettiPiece} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fee140', '#fa709a'][Math.floor(Math.random() * 6)]
          }} />
        ))}
      </div>

      <div className={styles.content}>
        {/* Seção do Vencedor */}
        {winner && (
          <div className={styles.winnerSection}>
            <div className={styles.trophy}>🏆</div>
            <h1 className={styles.title}>Parabéns!</h1>
            <div className={styles.winnerName}>{winner}</div>
            <div className={styles.subtitle}>é o grande vencedor!</div>
            <div className={styles.winnerScore}>
              {scores[winner]} {scores[winner] === 1 ? 'ponto' : 'pontos'}
            </div>
          </div>
        )}

        {/* Seção de Resultados */}
        <div className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>Resultados Completos</h2>
          
          <div className={styles.resultsGrid}>
            {sortedScores.map(({ element, score }, index) => {
              const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const isWinner = element === winner;
              return (
                <div key={element} className={`${styles.resultCard} ${isWinner ? styles.resultCardWinner : ''}`}>
                  <div className={styles.elementName}>{element}</div>
                  <div className={styles.scoreValue}>{score}</div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleBackToStart}
          className={styles.backButton}
        >
          Voltar ao Início
        </button>
      </div>

      <div className={styles.stars}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.star} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`
          }}>⭐</div>
        ))}
      </div>
    </div>
  );
}

export default GameEnd;
