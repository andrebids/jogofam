// Parser simples de CSV
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (simples, pode falhar com vírgulas dentro de aspas)
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    const question = {
      id: Date.now() + i,
      ordem: i,
      pergunta: values[0] || '',
      resposta: values[1] || '',
      categoria: values[2] || '',
      ativo: true
    };
    
    if (question.pergunta) {
      questions.push(question);
    }
  }
  
  return questions;
}

// Gerar CSV a partir de perguntas
export function generateCSV(questions) {
  const headers = ['pergunta', 'resposta', 'categoria'];
  const lines = [headers.join(',')];
  
  questions.forEach(q => {
    const row = [
      `"${(q.pergunta || '').replace(/"/g, '""')}"`,
      `"${(q.resposta || '').replace(/"/g, '""')}"`,
      `"${(q.categoria || '').replace(/"/g, '""')}"`
    ];
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

