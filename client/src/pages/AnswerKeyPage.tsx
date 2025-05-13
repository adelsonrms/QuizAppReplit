import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

interface Alternative {
  id: number;
  letter: string;
  texto: string;
  correct: boolean;
}

interface Question {
  id: number;
  category: string;
  enunciado: string;
  imagePath: string | null;
  alternatives: Alternative[];
  order: number;
}

interface StudentAnswer {
  questionId: number;
  alternativeId: number | null;
}

const AnswerKeyPage: React.FC = () => {
  const params = useParams<{ quizId: string, studentId?: string }>();
  const quizId = parseInt(params.quizId);
  const studentId = params.studentId ? parseInt(params.studentId) : undefined;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Fetch quiz details with questions and answers
  const { data: quizDetails, isLoading: isLoadingQuiz } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
  });
  
  // Fetch student answers if studentId is provided
  const { data: studentAnswers, isLoading: isLoadingAnswers } = useQuery({
    queryKey: [studentId ? `/api/student-responses/${studentId}/${quizId}` : null],
    enabled: !!studentId,
  });
  
  const isLoading = isLoadingQuiz || (studentId && isLoadingAnswers);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!quizDetails || !quizDetails.questions || quizDetails.questions.length === 0) {
    return <div className="container mx-auto px-4 py-8">Quiz not found or has no questions</div>;
  }
  
  const questions = quizDetails.questions as Question[];
  const currentQuestion = questions[currentQuestionIndex];
  const studentResponseMap = new Map<number, number | null>();
  
  if (studentAnswers && studentAnswers.responses) {
    studentAnswers.responses.forEach((response: StudentAnswer) => {
      studentResponseMap.set(response.questionId, response.alternativeId);
    });
  }
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-primary">
            {studentId ? 'Student Answers' : 'Answer Key'}: {quizDetails.title}
          </h1>
          {studentId && studentAnswers && (
            <p className="text-text-dark">
              Student: {studentAnswers.studentName} | 
              Score: {studentAnswers.correctAnswers}/{studentAnswers.totalQuestions} 
              ({Math.round((studentAnswers.correctAnswers/studentAnswers.totalQuestions) * 100)}%)
            </p>
          )}
        </div>
        <Link href={studentId ? `/quiz-summary/${quizId}` : "/instructor"}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="pb-2 bg-gray-100 rounded-t-md mb-6">
          <h2 className="text-right text-sm text-gray-600 p-3">
            QUESTION {currentQuestionIndex + 1} - {currentQuestion.category.toUpperCase()}
          </h2>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-lg text-gray-800 mb-6">{currentQuestion.enunciado}</h3>
          
          <div className="space-y-3">
            {currentQuestion.alternatives.sort((a, b) => a.letter.localeCompare(b.letter)).map((alternative) => {
              const isStudentSelected = studentId && studentResponseMap.get(currentQuestion.id) === alternative.id;
              const isCorrect = alternative.correct;
              
              return (
                <div 
                  key={alternative.id} 
                  className={`flex items-start space-x-2 p-3 rounded-md ${
                    isStudentSelected && isCorrect
                      ? 'bg-green-100'
                      : isStudentSelected && !isCorrect
                        ? 'bg-red-100'
                        : isCorrect
                          ? 'bg-green-50'
                          : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-6 flex justify-center">
                    {isStudentSelected && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {isStudentSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {!isStudentSelected && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-600 opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 text-base font-normal text-gray-700">
                    <span className="font-medium mr-2">{alternative.letter}.</span> {alternative.texto}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <div className="text-sm text-gray-600">
            {currentQuestionIndex + 1} of {questions.length}
          </div>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnswerKeyPage;