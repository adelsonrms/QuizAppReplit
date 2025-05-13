import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryStat {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

interface ResultScreenProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  categoryStats: CategoryStat[];
  onViewAnswers: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  score, 
  correctAnswers, 
  totalQuestions,
  categoryStats,
  onViewAnswers
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-4">
          <span className="text-white text-3xl font-bold">{score}%</span>
        </div>
        <h2 className="font-poppins font-semibold text-xl text-primary">Parabéns por completar o simulado!</h2>
        <p className="text-text-dark">Você acertou {correctAnswers} de {totalQuestions} questões</p>
      </div>
      
      <div className="mb-8">
        <h3 className="font-poppins font-medium text-lg text-primary mb-4">Resumo por Categoria</h3>
        
        <div className="space-y-4">
          {categoryStats.map((stat, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-text-dark">{stat.category}</span>
                <span className="text-text-dark">{stat.correct}/{stat.total} ({stat.percentage}%)</span>
              </div>
              <div className="w-full bg-neutral rounded-full h-2">
                <div 
                  className="bg-accent rounded-full h-2" 
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors"
          onClick={onViewAnswers}
        >
          <i className="ri-file-list-line mr-1"></i> Ver Respostas
        </Button>
        <Button 
          className="px-6 py-3 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
          variant="outline"
        >
          <i className="ri-download-line mr-1"></i> Baixar Certificado
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
