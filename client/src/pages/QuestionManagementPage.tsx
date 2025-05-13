import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Link } from 'wouter';

// Question schema for form validation
const questionSchema = z.object({
  code: z.string().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  enunciado: z.string().min(5, { message: 'Question text must be at least 5 characters' }),
  imagePath: z.string().optional()
});

// Alternative schema for form validation
const alternativeSchema = z.object({
  letter: z.string().min(1, { message: 'Letter is required' }),
  texto: z.string().min(1, { message: 'Alternative text is required' }),
  correct: z.boolean().default(false),
  questionId: z.number()
});

type QuestionFormValues = z.infer<typeof questionSchema>;
type AlternativeFormValues = z.infer<typeof alternativeSchema>;

const QuestionManagementPage: React.FC = () => {
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [alternativeDialogOpen, setAlternativeDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['/api/questions'],
  });

  // Fetch alternatives for a selected question
  const { data: alternatives, isLoading: isLoadingAlternatives } = useQuery({
    queryKey: [selectedQuestionId ? `/api/questions/${selectedQuestionId}/alternatives` : null],
    enabled: !!selectedQuestionId,
  });

  // Question form
  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      code: '',
      category: '',
      enunciado: '',
      imagePath: ''
    }
  });

  // Alternative form
  const alternativeForm = useForm<AlternativeFormValues>({
    resolver: zodResolver(alternativeSchema),
    defaultValues: {
      letter: '',
      texto: '',
      correct: false,
      questionId: 0
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormValues) => 
      apiRequest('POST', '/api/questions', data)
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Question Created',
        description: 'The question was successfully created.',
      });
      questionForm.reset();
      setQuestionDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Question',
        description: String(error),
        variant: 'destructive',
      });
    }
  });

  // Create alternative mutation
  const createAlternativeMutation = useMutation({
    mutationFn: (data: AlternativeFormValues) => 
      apiRequest('POST', '/api/alternatives', data)
        .then(res => res.json()),
    onSuccess: () => {
      toast({
        title: 'Alternative Created',
        description: 'The alternative was successfully created.',
      });
      alternativeForm.reset();
      setAlternativeDialogOpen(false);
      if (selectedQuestionId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/questions/${selectedQuestionId}/alternatives`] 
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Alternative',
        description: String(error),
        variant: 'destructive',
      });
    }
  });

  // Handle question submit
  const onQuestionSubmit = (data: QuestionFormValues) => {
    createQuestionMutation.mutate(data);
  };

  // Handle alternative submit
  const onAlternativeSubmit = (data: AlternativeFormValues) => {
    if (!selectedQuestionId) {
      toast({
        title: 'No Question Selected',
        description: 'Please select a question first.',
        variant: 'destructive',
      });
      return;
    }
    
    createAlternativeMutation.mutate({
      ...data,
      questionId: selectedQuestionId
    });
  };

  // Open alternative dialog for a specific question
  const handleAddAlternative = (questionId: number) => {
    setSelectedQuestionId(questionId);
    alternativeForm.setValue('questionId', questionId);
    setAlternativeDialogOpen(true);
  };

  // View alternatives for a specific question
  const handleViewAlternatives = (questionId: number) => {
    setSelectedQuestionId(questionId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex border-b border-neutral">
              <button className="tab-btn active">Question Management</button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-poppins font-semibold text-primary">
              Question and Alternative Management
            </h1>
            <div className="flex space-x-2">
              <Button 
                className="bg-primary hover:bg-primary-light text-white"
                onClick={() => setQuestionDialogOpen(true)}
              >
                <i className="ri-add-line mr-1"></i> Add Question
              </Button>
              <Link href="/instructor">
                <a className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors flex items-center">
                  <i className="ri-arrow-left-line mr-1"></i> Back to Instructor
                </a>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Questions List</CardTitle>
                  <CardDescription>Manage the quiz questions for Cayman Islands content.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingQuestions ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-2 text-gray-700">Loading questions...</p>
                    </div>
                  ) : questions && questions.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="w-[400px]">Question</TableHead>
                            <TableHead>Has Image</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions.map((question: any) => (
                            <TableRow key={question.id}>
                              <TableCell>{question.code || '-'}</TableCell>
                              <TableCell>{question.category}</TableCell>
                              <TableCell className="max-w-[400px] truncate">{question.enunciado}</TableCell>
                              <TableCell>{question.imagePath ? 'Yes' : 'No'}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  className="h-8 px-2 text-primary"
                                  onClick={() => handleAddAlternative(question.id)}
                                >
                                  <i className="ri-add-line mr-1"></i> Add Alternative
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 px-2 text-accent"
                                  onClick={() => handleViewAlternatives(question.id)}
                                >
                                  <i className="ri-eye-line mr-1"></i> View Alternatives
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-700">
                      No questions found. Use the "Add Question" button to create one.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="alternatives" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedQuestionId ? 'Alternatives for Selected Question' : 'Alternatives'}
                  </CardTitle>
                  <CardDescription>
                    {selectedQuestionId 
                      ? 'View and manage alternatives for the selected question.' 
                      : 'Select a question to view its alternatives.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedQuestionId ? (
                    <div className="text-center py-8 text-gray-700">
                      Select a question from the Questions tab to view its alternatives.
                    </div>
                  ) : isLoadingAlternatives ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-2 text-gray-700">Loading alternatives...</p>
                    </div>
                  ) : alternatives && alternatives.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Letter</TableHead>
                            <TableHead className="w-[500px]">Text</TableHead>
                            <TableHead>Correct</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alternatives.map((alt: any) => (
                            <TableRow key={alt.id}>
                              <TableCell>{alt.letter}</TableCell>
                              <TableCell className="max-w-[500px]">{alt.texto}</TableCell>
                              <TableCell>
                                {alt.correct ? (
                                  <span className="text-success">
                                    <i className="ri-check-line mr-1"></i> Yes
                                  </span>
                                ) : 'No'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-700">
                      No alternatives found for this question. 
                      <Button 
                        variant="link" 
                        className="text-primary ml-2"
                        onClick={() => handleAddAlternative(selectedQuestionId)}
                      >
                        Add Alternative
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                {selectedQuestionId && (
                  <CardFooter>
                    <Button 
                      className="ml-auto"
                      onClick={() => handleAddAlternative(selectedQuestionId)}
                    >
                      <i className="ri-add-line mr-1"></i> Add Alternative
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Add Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
              <FormField
                control={questionForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GEO001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Geography">Geography</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Culture">Culture</SelectItem>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="Wildlife">Wildlife</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="enunciado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the question text here..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={questionForm.control}
                name="imagePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Alternative Dialog */}
      <Dialog open={alternativeDialogOpen} onOpenChange={setAlternativeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Alternative to Question</DialogTitle>
          </DialogHeader>
          
          <Form {...alternativeForm}>
            <form onSubmit={alternativeForm.handleSubmit(onAlternativeSubmit)} className="space-y-4">
              <FormField
                control={alternativeForm.control}
                name="letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternative Letter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a letter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={alternativeForm.control}
                name="texto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternative Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the alternative text here..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={alternativeForm.control}
                name="correct"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Correct Answer</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Mark this if the alternative is the correct answer
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createAlternativeMutation.isPending}
                >
                  {createAlternativeMutation.isPending ? 'Creating...' : 'Create Alternative'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default QuestionManagementPage;