import React from 'react';
import { useParams } from 'wouter';
import AnswerKeyPage from './AnswerKeyPage';

const StudentAnswersPage: React.FC = () => {
  const params = useParams<{ quizId: string, studentId: string }>();
  
  return <AnswerKeyPage />;
};

export default StudentAnswersPage;