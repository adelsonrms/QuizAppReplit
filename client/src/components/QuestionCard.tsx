import React from 'react';

interface Alternative {
  id: number;
  letter: string;
  texto: string;
  correct?: boolean;
}

interface Question {
  id: number;
  category: string;
  enunciado: string;
  imagePath: string | null;
  alternatives: Alternative[];
}

interface QuestionCardProps {
  question: Question;
  currentQuestionNumber: number;
  selectedAlternativeId: number | null;
  onSelectAlternative: (alternativeId: number) => void;
  showCorrectAnswers?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  currentQuestionNumber, 
  selectedAlternativeId,
  onSelectAlternative,
  showCorrectAnswers = false
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-poppins font-medium text-lg text-primary">Questão {currentQuestionNumber}</h3>
        <span className="text-sm text-text-dark bg-secondary px-3 py-1 rounded-full">{question.category}</span>
      </div>
      
      {question.imagePath && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={question.imagePath} 
            alt={`Imagem da questão ${currentQuestionNumber}`} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-text-dark mb-4">{question.enunciado}</p>
        
        <div className="space-y-3 mt-4">
          {question.alternatives.map((alternative) => (
            <label 
              key={alternative.id}
              className={`quiz-option ${selectedAlternativeId === alternative.id ? 'selected' : ''} ${
                showCorrectAnswers && alternative.correct ? 'border-success bg-success/10' : ''
              }`}
              onClick={() => onSelectAlternative(alternative.id)}
            >
              <input 
                type="radio" 
                name={`question${question.id}`}
                className="mt-1 mr-3"
                checked={selectedAlternativeId === alternative.id}
                onChange={() => {}}
              />
              <span>
                <span className="font-medium text-text-dark">{alternative.letter}.</span>{' '}
                {alternative.texto}
              </span>
              {showCorrectAnswers && alternative.correct && (
                <span className="ml-auto text-success">
                  <i className="ri-check-line"></i>
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
