function QuestionDisplay({ question, questionNumber, totalQuestions }) {
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
        Quem é mais provável
      </div>
      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        lineHeight: '1.2'
      }}>
        {question.pergunta}
      </div>
    </div>
  );
}

export default QuestionDisplay;

