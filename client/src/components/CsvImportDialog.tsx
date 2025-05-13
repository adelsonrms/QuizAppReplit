import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CsvImportDialog: React.FC<CsvImportDialogProps> = ({ open, onOpenChange }) => {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [alternativesFile, setAlternativesFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importQuestionsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/import/questions', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import questions');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Questions imported successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setQuestionsFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Import Failed',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  const importAlternativesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/import/alternatives', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import alternatives');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Alternatives imported successfully',
      });
      setAlternativesFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Import Failed',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  const handleQuestionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setQuestionsFile(e.target.files[0]);
    }
  };

  const handleAlternativesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAlternativesFile(e.target.files[0]);
    }
  };

  const handleQuestionsImport = () => {
    if (!questionsFile) return;

    const formData = new FormData();
    formData.append('file', questionsFile);
    importQuestionsMutation.mutate(formData);
  };

  const handleAlternativesImport = () => {
    if (!alternativesFile) return;

    const formData = new FormData();
    formData.append('file', alternativesFile);
    importAlternativesMutation.mutate(formData);
  };

  const downloadQuestionTemplate = () => {
    const csvContent = 'code,category,enunciado,imagePath\nQ001,Geography,What is the capital of Cayman Islands?,\nQ002,History,When was the Cayman Islands discovered?,\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAlternativesTemplate = () => {
    const csvContent = 'questionId,letter,texto,correct\n1561,a,Option 1,0\n1561,b,Option 2,1\n1561,c,Option 3,0\n1561,d,Option 4,0\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alternatives_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Questions and Alternatives</DialogTitle>
          <DialogDescription>
            Upload CSV files to import questions and alternatives in bulk.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions" className="space-y-4 py-4">
            <div className="flex flex-col space-y-4">
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleQuestionsFileChange}
                className="border p-2"
              />
              <div className="text-sm text-gray-500">
                Expected columns: code, category, enunciado, imagePath
              </div>
              
              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  onClick={downloadQuestionTemplate}
                >
                  Download Template
                </Button>
                <Button 
                  onClick={handleQuestionsImport}
                  disabled={!questionsFile || importQuestionsMutation.isPending}
                  className="bg-primary hover:bg-primary-light text-white"
                >
                  {importQuestionsMutation.isPending ? 'Importing...' : 'Import Questions'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="alternatives" className="space-y-4 py-4">
            <div className="flex flex-col space-y-4">
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleAlternativesFileChange}
                className="border p-2"
              />
              <div className="text-sm text-gray-500">
                Expected columns: questionId, letter, texto, correct
              </div>
              
              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  onClick={downloadAlternativesTemplate}
                >
                  Download Template
                </Button>
                <Button 
                  onClick={handleAlternativesImport}
                  disabled={!alternativesFile || importAlternativesMutation.isPending}
                  className="bg-primary hover:bg-primary-light text-white"
                >
                  {importAlternativesMutation.isPending ? 'Importing...' : 'Import Alternatives'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;