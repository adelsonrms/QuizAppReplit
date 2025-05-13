import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StudentQuizResult {
  id: number;
  studentId: number;
  studentName: string;
  submittedAt: string;
  score: number;
  totalQuestions: number;
}

const QuizSummaryPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const quizId = parseInt(params.id);
  
  // Fetch quiz details
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
  });
  
  // Fetch students who completed this quiz
  const { data: studentResults, isLoading: isLoadingResults } = useQuery({
    queryKey: [`/api/quizzes/${quizId}/student-results`],
  });
  
  const isLoading = isLoadingQuiz || isLoadingResults;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!quiz) {
    return <div className="container mx-auto px-4 py-8">Quiz not found</div>;
  }
  
  const getPerformanceLabel = (score: number): { label: string; color: string } => {
    if (score >= 80) {
      return { label: 'Excellent', color: 'bg-green-500' };
    } else if (score >= 60) {
      return { label: 'Good', color: 'bg-blue-500' };
    } else if (score >= 40) {
      return { label: 'Average', color: 'bg-yellow-500' };
    } else {
      return { label: 'Needs Improvement', color: 'bg-red-500' };
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-primary">{quiz.title} - Student Results</h1>
          <p className="text-text-dark">Class: {quiz.turma}</p>
        </div>
        <Link href="/instructor">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      {studentResults && studentResults.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary text-primary">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Completion Date</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Performance</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {studentResults.map((result: StudentQuizResult) => {
                const performance = getPerformanceLabel(result.score);
                const submittedDate = new Date(result.submittedAt).toLocaleString();
                const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
                
                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{result.studentName}</td>
                    <td className="px-4 py-3">{submittedDate}</td>
                    <td className="px-4 py-3">{result.score}/{result.totalQuestions} ({scorePercentage}%)</td>
                    <td className="px-4 py-3">
                      <Badge className={`${performance.color} text-white`}>
                        {performance.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/student-answers/${quizId}/${result.studentId}`}>
                        <Button size="sm" variant="outline">View Answers</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-text-dark">No students have completed this quiz yet.</p>
        </div>
      )}
    </div>
  );
};

export default QuizSummaryPage;