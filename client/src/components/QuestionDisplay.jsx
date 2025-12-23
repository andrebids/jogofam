import { useState, useEffect } from 'react';

function QuestionDisplay({ question, questionNumber, totalQuestions, selectedElement, currentAnswer }) {
  const [displayedAnswer, setDisplayedAnswer] = useState(null);

  // Atualizar resposta exibida quando currentAnswer mudar
  useEffect(() => {
    if (currentAnswer) {
      setDisplayedAnswer(currentAnswer);
    } else {
      // Limpar quando mudar de pergunta (currentAnswer é null)
      setDisplayedAnswer(null);
    }
  }, [currentAnswer, questionNumber]);

  if (!question) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem', opacity: 0.8, fontSize: '1.5rem' }}>
          Quem é mais provável?
        </div>
        <p style={{ fontSize: '2rem', opacity: 0.9, color: '#ffffff' }}>Nenhuma pergunta disponível</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', opacity: 0.8, fontSize: '1.5rem' }}>
        Quem é mais provável?
      </div>
      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        lineHeight: '1.2'
      }}>
        {question.pergunta}
      </div>
      {displayedAnswer && (
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.3) 100%)',
          borderRadius: '1rem',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.9 }}>
            Votado:
          </div>
          <div style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            {displayedAnswer}
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

export default QuestionDisplay;

