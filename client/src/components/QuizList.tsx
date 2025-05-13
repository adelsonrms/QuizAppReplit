import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
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

interface Quiz {
  id: number;
  title: string;
  turma: string;
  questionCount: number;
  active: boolean;
  createdAt: string;
  completedCount?: number;
  averageScore?: number;
}

interface QuizListProps {
  quizzes: Quiz[];
  instructorId: number;
  onViewStatistics: (quizId: number) => void;
  onViewAnswerKey: (quizId: number) => void;
}

const QuizList: React.FC<QuizListProps> = ({ 
  quizzes, 
  instructorId,
  onViewStatistics,
  onViewAnswerKey
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const updateQuizStatusMutation = useMutation({
    mutationFn: ({ quizId, active }: { quizId: number; active: boolean }) => 
      apiRequest('PATCH', `/api/quizzes/${quizId}/status`, { active })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/instructor/${instructorId}/quizzes`] });
      toast({
        title: 'Status atualizado',
        description: 'O status do simulado foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  const toggleQuizStatus = (quizId: number, currentStatus: boolean) => {
    setSelectedQuizId(quizId);
    setDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (selectedQuizId !== null) {
      const quiz = quizzes.find(q => q.id === selectedQuizId);
      if (quiz) {
        updateQuizStatusMutation.mutate({ 
          quizId: selectedQuizId, 
          active: !quiz.active 
        });
      }
    }
    setDialogOpen(false);
  };

  const copyQuizLink = (quizId: number) => {
    const link = `${window.location.origin}/student/${quizId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link copied',
        description: 'The quiz link has been copied to your clipboard.',
      });
    });
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.turma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins font-semibold text-xl text-primary">Generated Quizzes</h2>
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Search quiz..." 
            className="pl-9 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dark opacity-70"></i>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-8 text-text-dark opacity-70">
            No quizzes found.
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="border border-neutral rounded-lg p-4 hover:border-accent transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-poppins font-medium text-text-dark">{quiz.title}</h3>
                  <p className="text-sm text-text-dark opacity-70">
                    Class: {quiz.turma} • {quiz.questionCount} questions
                  </p>
                </div>
                <span 
                  className={`text-white text-sm py-1 px-3 rounded-full ${
                    quiz.active ? 'bg-accent' : 'bg-gray-500'
                  }`}
                >
                  {quiz.active ? 'Ativo' : 'Encerrado'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-secondary py-1 px-2 rounded text-xs text-text-dark">
                  {quiz.completedCount || 0} alunos completaram
                </span>
                <span className="bg-secondary py-1 px-2 rounded text-xs text-text-dark">
                  Média: {quiz.averageScore || 0}%
                </span>
                <span className="bg-secondary py-1 px-2 rounded text-xs text-text-dark">
                  Criado: {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    className="text-primary hover:text-primary-light transition-colors"
                    onClick={() => onViewAnswerKey(quiz.id)}
                  >
                    <i className="ri-file-list-line mr-1"></i> Ver Gabarito
                  </button>
                  <button 
                    className="text-primary hover:text-primary-light transition-colors"
                    onClick={() => onViewStatistics(quiz.id)}
                  >
                    <i className="ri-bar-chart-line mr-1"></i> Estatísticas
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="text-text-dark hover:text-primary transition-colors"
                    onClick={() => copyQuizLink(quiz.id)}
                  >
                    <i className="ri-link mr-1"></i> Copiar Link
                  </button>
                  <button 
                    className="text-text-dark hover:text-primary transition-colors"
                    onClick={() => toggleQuizStatus(quiz.id, quiz.active)}
                  >
                    <i className={`ri-${quiz.active ? 'close' : 'check'}-line mr-1`}></i> 
                    {quiz.active ? 'Encerrar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar status do simulado</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedQuizId !== null && quizzes.find(q => q.id === selectedQuizId)?.active 
                ? 'Deseja encerrar este simulado? Os alunos não poderão mais acessá-lo.'
                : 'Deseja ativar este simulado? Os alunos poderão acessá-lo novamente.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizList;
