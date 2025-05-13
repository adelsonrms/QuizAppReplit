import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuizForm from '@/components/QuizForm';
import QuizList from '@/components/QuizList';
import QuizStats from '@/components/QuizStats';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Mock instructor ID (in a real app, this would come from auth)
const INSTRUCTOR_ID = 1;

const InstructorPage: React.FC = () => {
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [answerKeyDialogOpen, setAnswerKeyDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  
  // Fetch quizzes for this instructor
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: [`/api/instructor/${INSTRUCTOR_ID}/quizzes`],
  });
  
  // Fetch selected quiz details (when dialog opens)
  const { data: selectedQuiz, isLoading: isLoadingSelectedQuiz } = useQuery({
    queryKey: [selectedQuizId ? `/api/quizzes/${selectedQuizId}` : null],
    enabled: !!selectedQuizId,
  });
  
  // Fetch statistics for the selected quiz
  const { data: quizStatistics, isLoading: isLoadingStatistics } = useQuery({
    queryKey: [selectedQuizId ? `/api/quizzes/${selectedQuizId}/statistics` : null],
    enabled: !!selectedQuizId && statsDialogOpen,
  });
  
  const handleViewStatistics = (quizId: number) => {
    setSelectedQuizId(quizId);
    setStatsDialogOpen(true);
  };
  
  const handleViewAnswerKey = (quizId: number) => {
    setSelectedQuizId(quizId);
    setAnswerKeyDialogOpen(true);
  };
  
  // Calculate statistics
  const quizCount = quizzes?.length || 0;
  
  // Get unique turmas from quizzes
  const uniqueTurmas = quizzes 
    ? [...new Set(quizzes.map((quiz: any) => quiz.turma))]
    : [];
  
  const turmaCount = uniqueTurmas.length;
  
  // Mock values for student count and average score
  // In a real app, these would come from API
  const studentCount = 48;
  const averageScore = 78;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex border-b border-neutral">
              <button className="tab-btn active">Instructor</button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Dashboard Controls */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="font-poppins font-semibold text-xl mb-4 text-primary">Instructor Dashboard</h2>
                
                <QuizForm instructorId={INSTRUCTOR_ID} />
                
                <div className="my-4">
                  <Link href="/questions">
                    <a className="w-full flex items-center justify-center px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors">
                      <i className="ri-question-line mr-2"></i>
                      Manage Questions
                    </a>
                  </Link>
                </div>
                
                <QuizStats 
                  quizCount={quizCount}
                  studentCount={studentCount}
                  averageScore={averageScore}
                  turmaCount={turmaCount}
                />
              </div>
            </div>
            
            {/* Right Column: Quiz List */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {isLoadingQuizzes ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
                    </div>
                    <p className="mt-2 text-gray-700">Loading quizzes...</p>
                  </div>
                ) : (
                  <QuizList 
                    quizzes={quizzes || []}
                    instructorId={INSTRUCTOR_ID}
                    onViewStatistics={handleViewStatistics}
                    onViewAnswerKey={handleViewAnswerKey}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Statistics Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quiz Statistics</DialogTitle>
          </DialogHeader>
          
          {isLoadingStatistics ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              </div>
              <p className="mt-2 text-gray-700">Loading statistics...</p>
            </div>
          ) : quizStatistics ? (
            <div>
              <h3 className="font-poppins font-semibold text-lg mb-4">{quizStatistics.title}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary p-4 rounded-md">
                  <span className="block text-2xl font-semibold text-primary">{quizStatistics.totalStudents}</span>
                  <span className="text-sm text-gray-700">Students</span>
                </div>
                <div className="bg-secondary p-4 rounded-md">
                  <span className="block text-2xl font-semibold text-primary">{quizStatistics.averageScore}%</span>
                  <span className="text-sm text-gray-700">Average Score</span>
                </div>
              </div>
              
              <h4 className="font-medium text-lg mb-3">Performance by Category</h4>
              
              <div className="space-y-4 mb-6">
                {quizStatistics.categoriesStats?.map((stat: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">{stat.category}</span>
                      <span className="text-gray-700">
                        {stat.correct}/{stat.total} ({stat.percentage}%)
                      </span>
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
              
              <div className="flex justify-end">
                <Button 
                  className="px-4 py-2"
                  variant="outline"
                  onClick={() => setStatsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-700">No statistics available</p>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Answer Key Dialog */}
      <Dialog open={answerKeyDialogOpen} onOpenChange={setAnswerKeyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Answer Key</DialogTitle>
          </DialogHeader>
          
          {isLoadingSelectedQuiz ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              </div>
              <p className="mt-2 text-gray-700">Loading questions...</p>
            </div>
          ) : selectedQuiz ? (
            <div>
              <h3 className="font-poppins font-semibold text-lg mb-4">{selectedQuiz.title}</h3>
              
              <div className="space-y-8">
                {selectedQuiz.questions?.map((question: any, index: number) => (
                  <div key={question.id} className="p-4 border border-neutral rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-primary">Question {index + 1}</h4>
                      <span className="text-sm text-gray-700 bg-secondary px-3 py-1 rounded-full">
                        {question.category}
                      </span>
                    </div>
                    
                    {question.imagePath && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img 
                          src={question.imagePath} 
                          alt={`Question ${index + 1} image`} 
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="mb-3 text-gray-700">{question.enunciado}</p>
                    
                    <div className="space-y-2">
                      {question.alternatives?.map((alt: any) => (
                        <div 
                          key={alt.id} 
                          className={`p-2 rounded-md ${
                            alt.correct ? 'bg-success/10 border border-success' : ''
                          }`}
                        >
                          <span className="font-medium">{alt.letter}.</span> {alt.texto}
                          {alt.correct && (
                            <span className="ml-2 text-success">
                              <i className="ri-check-line"></i> Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  className="px-4 py-2"
                  variant="outline"
                  onClick={() => setAnswerKeyDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-700">No questions available</p>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default InstructorPage;
