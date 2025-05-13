import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
  currentQuestion, 
  totalQuestions, 
  onPrevious, 
  onNext,
  onFinish
}) => {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        className="px-6 py-2 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        <i className="ri-arrow-left-line mr-1"></i> Anterior
      </Button>
      
      {isLastQuestion ? (
        <Button 
          className="px-6 py-2 bg-accent text-white font-medium rounded-md hover:bg-accent-light transition-colors"
          onClick={onFinish}
        >
          Finalizar <i className="ri-check-line ml-1"></i>
        </Button>
      ) : (
        <Button 
          className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors"
          onClick={onNext}
        >
          Próxima <i className="ri-arrow-right-line ml-1"></i>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
