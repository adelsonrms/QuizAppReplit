import React from 'react';

interface QuizStatsProps {
  quizCount: number;
  studentCount: number;
  averageScore: number;
  turmaCount: number;
}

const QuizStats: React.FC<QuizStatsProps> = ({ 
  quizCount, 
  studentCount, 
  averageScore, 
  turmaCount 
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-poppins text-lg font-medium mb-3 text-text-dark">Estatísticas</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary p-4 rounded-md">
          <span className="block text-2xl font-semibold text-primary">{quizCount}</span>
          <span className="text-sm text-text-dark">Simulados</span>
        </div>
        <div className="bg-secondary p-4 rounded-md">
          <span className="block text-2xl font-semibold text-primary">{studentCount}</span>
          <span className="text-sm text-text-dark">Alunos</span>
        </div>
        <div className="bg-secondary p-4 rounded-md">
          <span className="block text-2xl font-semibold text-primary">{averageScore}%</span>
          <span className="text-sm text-text-dark">Média</span>
        </div>
        <div className="bg-secondary p-4 rounded-md">
          <span className="block text-2xl font-semibold text-primary">{turmaCount}</span>
          <span className="text-sm text-text-dark">Turmas</span>
        </div>
      </div>
    </div>
  );
};

export default QuizStats;
