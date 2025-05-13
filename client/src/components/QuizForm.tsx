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
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres' }),
  turma: z.string().min(1, { message: 'Selecione uma turma' }),
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
        title: 'Simulado criado',
        description: 'O simulado foi criado com sucesso!',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/instructor/${instructorId}/quizzes`] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar simulado',
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
        <h3 className="font-poppins text-lg font-medium mb-3 text-text-dark">Gerar Novo Simulado</h3>
        
        <FormField
          control={form.control}
          name="turma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Turma A - 2023">Turma A - 2023</SelectItem>
                  <SelectItem value="Turma B - 2023">Turma B - 2023</SelectItem>
                  <SelectItem value="Turma C - 2023">Turma C - 2023</SelectItem>
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
              <FormLabel>Número de Questões</FormLabel>
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
              <FormLabel>Título do Simulado</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Avaliação Mensal - Ilhas Cayman" {...field} />
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
          {createQuizMutation.isPending ? 'Gerando...' : 'Gerar Simulado'}
        </Button>
      </form>
    </Form>
  );
};

export default QuizForm;
