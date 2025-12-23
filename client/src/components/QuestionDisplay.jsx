function QuestionDisplay({ question, revealAnswer, questionNumber, totalQuestions }) {
  if (!question) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '2rem', opacity: 0.7 }}>Nenhuma pergunta disponível</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', opacity: 0.8, fontSize: '1.5rem' }}>
        Pergunta {questionNumber} / {totalQuestions}
      </div>
      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        lineHeight: '1.2'
      }}>
        {question.pergunta}
      </div>
      {question.categoria && (
        <div style={{ 
          fontSize: '1.2rem', 
          opacity: 0.6,
          marginBottom: '1rem'
        }}>
          {question.categoria}
        </div>
      )}
      {revealAnswer && question.resposta && (
        <div style={{ 
          fontSize: '3rem', 
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.8 }}>Resposta:</div>
          <div>{question.resposta}</div>
        </div>
      )}
    </div>
  );
}

export default QuestionDisplay;

