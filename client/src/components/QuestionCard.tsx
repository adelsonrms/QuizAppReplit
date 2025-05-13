import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Alternative {
  id: number;
  letter: string;
  texto: string; // This field is called 'option_text' in the database schema but 'texto' in API responses
  correct?: boolean;
}

interface Question {
  id: number;
  category: string;
  enunciado: string; // This field is called 'question_text' in the database schema but 'enunciado' in API responses
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
  // Sort alternatives by letter alphabetically (A, B, C, D...)
  const sortedAlternatives = [...question.alternatives].sort((a, b) => 
    a.letter.localeCompare(b.letter)
  );

  return (
    <div className="w-full">
      <div className="pb-2 bg-gray-100 rounded-t-md mb-6">
        <h2 className="text-right text-sm text-gray-600 p-3">
          QUESTION {currentQuestionNumber} - {question.category.toUpperCase()}
        </h2>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-lg text-gray-800 mb-6">{question.enunciado}</h3>
        
        <RadioGroup 
          value={selectedAlternativeId?.toString() || ""}
          onValueChange={(value) => onSelectAlternative(parseInt(value))}
          className="space-y-3"
        >
          {sortedAlternatives.map((alternative) => (
            <div key={alternative.id} className="flex items-start space-x-2 p-3 rounded-md bg-gray-50">
              <RadioGroupItem value={alternative.id.toString()} id={`option-${alternative.id}`} />
              <Label 
                htmlFor={`option-${alternative.id}`} 
                className="flex-1 text-base font-normal text-gray-700"
              >
                <span className="font-medium mr-2">{alternative.letter}.</span> {alternative.texto}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default QuestionCard;
