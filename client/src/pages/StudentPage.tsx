import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuestionCard from '@/components/QuestionCard';
import NavigationButtons from '@/components/NavigationButtons';
import ResultScreen from '@/components/ResultScreen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock student ID (in a real app, this would come from auth)
const STUDENT_ID = 1;

const StudentPage: React.FC = () => {
  const [, params] = useRoute('/student/:quizId');
  const [, navigate] = useLocation();
  
  const quizId = params?.quizId ? parseInt(params.quizId) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, number>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [studentInfoDialogOpen, setStudentInfoDialogOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  
  // Queries and mutations
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: [quizId ? `/api/quizzes/${quizId}` : null],
    enabled: !!quizId,
  });
  
  const { data: studentQuizResult } = useQuery({
    queryKey: [quizId && showResults ? `/api/students/${STUDENT_ID}/quizzes/${quizId}` : null],
    enabled: !!quizId && showResults,
  });
  
  const createStudentMutation = useMutation({
    mutationFn: (data: { name: string }) => 
      apiRequest('POST', '/api/students', data)
        .then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: 'Welcome',
        description: `Hello, ${data.name}! Let's start the quiz.`,
      });
      startQuiz(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    },
  });
  
  const startQuizMutation = useMutation({
    mutationFn: (studentId: number) => 
      apiRequest('POST', `/api/students/${studentId}/quizzes/${quizId}/start`, {})
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Simulado iniciado',
        description: 'Boa sorte!',
      });
      setStudentInfoDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao iniciar simulado',
        description: String(error),
        variant: 'destructive',
      });
    },
  });
  
  const submitResponseMutation = useMutation({
    mutationFn: ({ 
      studentId, 
      questionId, 
      alternativeId 
    }: { 
      studentId: number; 
      questionId: number; 
      alternativeId: number;
    }) => 
      apiRequest('POST', `/api/students/${studentId}/quizzes/${quizId}/responses`, {
        questionId,
        alternativeId
      })
        .then(res => res.json()),
    onError: (error) => {
      toast({
        title: 'Erro ao salvar resposta',
        description: String(error),
        variant: 'destructive',
      });
    },
  });
  
  const completeQuizMutation = useMutation({
    mutationFn: (studentId: number) => 
      apiRequest('POST', `/api/students/${studentId}/quizzes/${quizId}/complete`, {})
        .then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: 'Simulado concluído',
        description: `Sua pontuação: ${data.score}%`,
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/students/${STUDENT_ID}/quizzes/${quizId}`] 
      });
      setShowResults(true);
      setFinishDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao concluir simulado',
        description: String(error),
        variant: 'destructive',
      });
    },
  });
  
  // Check if quiz ID exists, if not, redirect to home
  useEffect(() => {
    if (!quizId) {
      navigate('/');
    } else {
      // Check if student info should be shown
      setStudentInfoDialogOpen(true);
    }
  }, [quizId, navigate]);
  
  // Handle student info submission
  const handleStudentInfoSubmit = () => {
    if (!studentName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    createStudentMutation.mutate({
      name: studentName
    });
  };
  
  // Start the quiz
  const startQuiz = (studentId: number) => {
    startQuizMutation.mutate(studentId);
  };
  
  // Handle alternative selection
  const handleSelectAlternative = (alternativeId: number) => {
    if (!quiz || !quiz.questions) return;
    
    const questionId = quiz.questions[currentQuestionIndex].id;
    setResponses(new Map(responses.set(questionId, alternativeId)));
    
    // Save response to server
    submitResponseMutation.mutate({
      studentId: STUDENT_ID,
      questionId,
      alternativeId
    });
  };
  
  // Navigation handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (quiz && quiz.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleFinish = () => {
    if (!quiz || !quiz.questions) return;
    
    // Check if all questions are answered
    const unansweredCount = quiz.questions.filter(
      (q: any) => !responses.has(q.id)
    ).length;
    
    if (unansweredCount > 0) {
      setFinishDialogOpen(true);
    } else {
      completeQuizMutation.mutate(STUDENT_ID);
    }
  };
  
  const confirmFinish = () => {
    completeQuizMutation.mutate(STUDENT_ID);
  };
  
  const handleViewAnswers = () => {
    setShowAnswers(true);
    setShowResults(false);
  };
  
  // Current question data
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const selectedAlternativeId = currentQuestion ? responses.get(currentQuestion.id) : null;
  
  // Quiz progress
  const progress = quiz?.questions ? Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) : 0;
  
  // Prepare category stats for result screen
  const categoryStats = studentQuizResult?.quiz?.questions?.reduce((acc: any, q: any) => {
    if (!acc[q.category]) {
      acc[q.category] = { correct: 0, total: 0 };
    }
    
    const selectedAlt = q.alternatives.find((a: any) => a.id === q.selectedAlternativeId);
    if (selectedAlt?.correct) {
      acc[q.category].correct++;
    }
    
    acc[q.category].total++;
    return acc;
  }, {});
  
  const formattedCategoryStats = categoryStats 
    ? Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
        category,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }))
    : [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex border-b border-neutral">
              <button className="tab-btn active">Aluno</button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {isLoadingQuiz ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              </div>
              <p className="mt-2 text-text-dark">Carregando simulado...</p>
            </div>
          ) : quiz ? (
            showResults ? (
              <ResultScreen 
                score={studentQuizResult?.score || 0}
                correctAnswers={studentQuizResult?.correctAnswers || 0}
                totalQuestions={studentQuizResult?.totalQuestions || 0}
                categoryStats={formattedCategoryStats}
                onViewAnswers={handleViewAnswers}
              />
            ) : showAnswers ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6 border-b border-neutral pb-4">
                  <h2 className="font-poppins font-semibold text-xl text-primary mb-2">
                    {quiz.title} - Respostas
                  </h2>
                  <p className="text-text-dark mb-4">
                    Sua pontuação: {studentQuizResult?.score || 0}% 
                    ({studentQuizResult?.correctAnswers || 0} de {studentQuizResult?.totalQuestions || 0} questões)
                  </p>
                  <Button 
                    onClick={() => setShowResults(true)}
                    className="bg-primary hover:bg-primary-light text-white"
                  >
                    Voltar para o Resultado
                  </Button>
                </div>
                
                <div className="space-y-8">
                  {studentQuizResult?.quiz?.questions?.map((question: any, index: number) => (
                    <QuestionCard 
                      key={question.id}
                      question={question}
                      currentQuestionNumber={index + 1}
                      selectedAlternativeId={question.selectedAlternativeId}
                      onSelectAlternative={() => {}}
                      showCorrectAnswers={true}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6 border-b border-neutral pb-4">
                  <h2 className="font-poppins font-semibold text-xl text-primary mb-2">{quiz.title}</h2>
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center text-sm text-text-dark">
                      <i className="ri-questionnaire-line mr-1"></i> {quiz.questions?.length} questões
                    </span>
                    <span className="flex items-center text-sm text-text-dark">
                      <i className="ri-time-line mr-1"></i> Sem limite de tempo
                    </span>
                    <span className="flex items-center text-sm text-text-dark">
                      <i className="ri-group-line mr-1"></i> {quiz.turma}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-dark">Progresso</span>
                    <span className="text-sm font-medium text-primary">
                      {currentQuestionIndex + 1}/{quiz.questions?.length}
                    </span>
                  </div>
                  <div className="w-full bg-neutral rounded-full h-2">
                    <div 
                      className="bg-accent rounded-full h-2" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {currentQuestion && (
                  <>
                    <QuestionCard 
                      question={currentQuestion}
                      currentQuestionNumber={currentQuestionIndex + 1}
                      selectedAlternativeId={selectedAlternativeId || null}
                      onSelectAlternative={handleSelectAlternative}
                    />
                    
                    <NavigationButtons 
                      currentQuestion={currentQuestionIndex + 1}
                      totalQuestions={quiz.questions?.length || 0}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      onFinish={handleFinish}
                    />
                  </>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-text-dark">Simulado não encontrado ou não disponível.</p>
              <Button 
                className="mt-4 bg-primary hover:bg-primary-light text-white"
                onClick={() => navigate('/')}
              >
                Voltar para o Início
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Student Info Dialog */}
      <Dialog open={studentInfoDialogOpen && !!quizId} onOpenChange={setStudentInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Identification</DialogTitle>
            <DialogDescription>
              Please enter your information to start the quiz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-light text-white"
              onClick={handleStudentInfoSubmit}
              disabled={createStudentMutation.isPending || startQuizMutation.isPending}
            >
              {(createStudentMutation.isPending || startQuizMutation.isPending) 
                ? 'Processing...' 
                : 'Start Quiz'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Finish Confirmation Dialog */}
      <AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Simulado</AlertDialogTitle>
            <AlertDialogDescription>
              Você ainda tem {quiz?.questions?.filter((q: any) => !responses.has(q.id)).length} questões 
              não respondidas. Tem certeza que deseja finalizar o simulado?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinish}>Finalizar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default StudentPage;
