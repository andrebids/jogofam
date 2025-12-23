import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css';

function QuestionTable({ questions, onUpdate }) {
  const [localQuestions, setLocalQuestions] = useState(questions);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const handleChange = (index, field, value) => {
    const updated = [...localQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setLocalQuestions(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleAdd = () => {
    const newQuestion = {
      id: Date.now(),
      ordem: localQuestions.length + 1,
      pergunta: '',
      resposta: '',
      categoria: '',
      ativo: true
    };
    const updated = [...localQuestions, newQuestion];
    setLocalQuestions(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleDelete = (index) => {
    const updated = localQuestions.filter((_, i) => i !== index);
    setLocalQuestions(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleDuplicate = (index) => {
    const question = localQuestions[index];
    const duplicated = {
      ...question,
      id: Date.now(),
      ordem: localQuestions.length + 1
    };
    const updated = [...localQuestions, duplicated];
    setLocalQuestions(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ordem</th>
            <th>Pergunta</th>
            <th>Resposta</th>
            <th>Categoria</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {localQuestions.map((q, index) => (
            <tr key={q.id || index}>
              <td>
                <input
                  type="number"
                  value={q.ordem || index + 1}
                  onChange={(e) => handleChange(index, 'ordem', parseInt(e.target.value) || index + 1)}
                  className={styles.input}
                  style={{ width: '60px' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.pergunta || ''}
                  onChange={(e) => handleChange(index, 'pergunta', e.target.value)}
                  className={styles.input}
                  placeholder="Digite a pergunta"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.resposta || ''}
                  onChange={(e) => handleChange(index, 'resposta', e.target.value)}
                  className={styles.input}
                  placeholder="Resposta (opcional)"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.categoria || ''}
                  onChange={(e) => handleChange(index, 'categoria', e.target.value)}
                  className={styles.input}
                  placeholder="Categoria (opcional)"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={q.ativo !== false}
                  onChange={(e) => handleChange(index, 'ativo', e.target.checked)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleDuplicate(index)}
                  className={styles.smallButton}
                  title="Duplicar"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className={styles.smallButton}
                  title="Apagar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className={styles.addButton}>
        + Adicionar Pergunta
      </button>
    </div>
  );
}

export default QuestionTable;

