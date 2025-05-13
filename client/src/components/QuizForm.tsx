import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Add validation schema
const quizFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must have at least 5 characters' }),
  turma: z.string().min(1, { message: 'Please select a class' }),
  questionCount: z.number().min(5).max(50),
  instructorId: z.number(),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  instructorId: number;
}

const QuizForm: React.FC<QuizFormProps> = ({ instructorId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      turma: '',
      questionCount: 10,
      instructorId,
    },
  });
  
  const createQuizMutation = useMutation({
    mutationFn: (data: QuizFormValues) => 
      apiRequest('POST', '/api/quizzes', data)
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Quiz created',
        description: 'The quiz was successfully created!',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/instructor/${instructorId}/quizzes`] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating quiz',
        description: String(error),
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: QuizFormValues) => {
    createQuizMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-poppins text-lg font-medium mb-3 text-gray-700">Create New Quiz</h3>
        
        <FormField
          control={form.control}
          name="turma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Class A - 2023">Class A - 2023</SelectItem>
                  <SelectItem value="Class B - 2023">Class B - 2023</SelectItem>
                  <SelectItem value="Class C - 2023">Class C - 2023</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="questionCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Questions</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={5} 
                  max={50} 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Monthly Assessment - Cayman Islands" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-light text-white"
          disabled={createQuizMutation.isPending}
        >
          {createQuizMutation.isPending ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </form>
    </Form>
  );
};

export default QuizForm;
