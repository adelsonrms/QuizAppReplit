import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuizSchema, insertStudentSchema, insertInstructorSchema,
  insertStudentQuizSchema, insertStudentResponseSchema,
  insertQuestionSchema, insertAlternativeSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a HTTP server
  const httpServer = createServer(app);
  
  // ---- INSTRUCTOR ROUTES ----
  
  // Get all quizzes for an instructor
  app.get("/api/instructor/:instructorId/quizzes", async (req, res) => {
    try {
      const instructorId = parseInt(req.params.instructorId);
      if (isNaN(instructorId)) {
        return res.status(400).json({ message: "Invalid instructor ID" });
      }
      
      const quizzes = await storage.getQuizzesByInstructor(instructorId);
      return res.json(quizzes);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  
  // Get all questions
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      console.log(`Returning ${questions.length} questions`);
      return res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({ message: "Failed to fetch questions", error: String(error) });
    }
  });
  
  // Get alternatives for a question
  app.get("/api/questions/:questionId/alternatives", async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const alternatives = await storage.getAlternativesByQuestion(questionId);
      console.log(`Returning ${alternatives.length} alternatives for question ${questionId}`);
      return res.json(alternatives);
    } catch (error) {
      console.error(`Error fetching alternatives for question ${req.params.questionId}:`, error);
      return res.status(500).json({ message: "Failed to fetch alternatives", error: String(error) });
    }
  });
  
  // Create a new quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      
      // Generate quiz questions
      const allQuestions = await storage.getAllQuestions();
      console.log(`Total questions available: ${allQuestions.length}, Requested: ${quizData.questionCount}`);
      
      if (allQuestions.length === 0) {
        return res.status(500).json({ 
          message: "No questions available in the database" 
        });
      }
      
      // Determine how many questions to use
      let actualQuestionCount = quizData.questionCount;
      if (allQuestions.length < quizData.questionCount) {
        console.log(`Warning: Not enough questions. Using all ${allQuestions.length} available questions.`);
        actualQuestionCount = allQuestions.length;
        
        // Update the quiz with the actual number of questions we're using
        await storage.updateQuizQuestionCount(quiz.id, actualQuestionCount);
      }
      
      // Randomly select questions, use as many as available up to requested count
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, actualQuestionCount);
      
      console.log(`Selected ${selectedQuestions.length} questions for quiz ${quiz.id}`);
      
      // Create quiz question relationships
      for (let i = 0; i < selectedQuestions.length; i++) {
        await storage.createQuizQuestion({
          quizId: quiz.id,
          questionId: selectedQuestions[i].id,
          order: i + 1
        });
      }
      
      // Update question count to reflect the actual number of questions
      const actualQuestionsAdded = selectedQuestions.length;
      if (actualQuestionsAdded !== quizData.questionCount) {
        await storage.updateQuizQuestionCount(quiz.id, actualQuestionsAdded);
      }
      
      return res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create quiz", error: String(error) });
    }
  });
  
  // Get quiz with full details and statistics
  app.get("/api/quizzes/:quizId", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuizWithQuestionsAndAlternatives(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      return res.json(quiz);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });
  
  // Get quiz statistics
  app.get("/api/quizzes/:quizId/statistics", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const statistics = await storage.getQuizStatistics(quizId);
      if (!statistics) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      return res.json(statistics);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Update quiz active status
  app.patch("/api/quizzes/:quizId/status", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const { active } = req.body;
      if (typeof active !== "boolean") {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }
      
      const updatedQuiz = await storage.updateQuizActive(quizId, active);
      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      return res.json(updatedQuiz);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update quiz status" });
    }
  });
  
  // ---- STUDENT ROUTES ----
  
  // Get or create student 
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      const student = await storage.createStudent(studentData);
      return res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create student" });
    }
  });
  
  // Start a quiz for a student
  app.post("/api/students/:studentId/quizzes/:quizId/start", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const quizId = parseInt(req.params.quizId);
      
      if (isNaN(studentId) || isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid student or quiz ID" });
      }
      
      // Check if student already started this quiz
      const existingStudentQuiz = await storage.getStudentQuizByIds(studentId, quizId);
      if (existingStudentQuiz) {
        return res.json(existingStudentQuiz);
      }
      
      // Start a new quiz attempt
      const studentQuiz = await storage.createStudentQuiz({
        studentId,
        quizId,
        score: 0,
        completed: false
      });
      
      return res.status(201).json(studentQuiz);
    } catch (error) {
      return res.status(500).json({ message: "Failed to start quiz" });
    }
  });
  
  // Submit a student response
  app.post("/api/students/:studentId/quizzes/:quizId/responses", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const quizId = parseInt(req.params.quizId);
      
      if (isNaN(studentId) || isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid student or quiz ID" });
      }
      
      const responseData = insertStudentResponseSchema.parse({
        ...req.body,
        studentId,
        quizId
      });
      
      const response = await storage.createStudentResponse(responseData);
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to submit response" });
    }
  });
  
  // Complete a quiz and calculate score
  app.post("/api/students/:studentId/quizzes/:quizId/complete", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const quizId = parseInt(req.params.quizId);
      
      if (isNaN(studentId) || isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid student or quiz ID" });
      }
      
      // Get the quiz data
      const quiz = await storage.getQuizWithQuestionsAndAlternatives(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Get student responses
      const responses = await storage.getStudentResponses(studentId, quizId);
      
      // Calculate score
      let correctAnswers = 0;
      for (const question of quiz.questions) {
        const response = responses.find(r => r.questionId === question.id);
        if (!response) continue;
        
        const selectedAlternative = question.alternatives.find(a => a.id === response.alternativeId);
        if (selectedAlternative && selectedAlternative.correct) {
          correctAnswers++;
        }
      }
      
      const totalQuestions = quiz.questions.length;
      const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Get student quiz and update it
      const studentQuiz = await storage.getStudentQuizByIds(studentId, quizId);
      if (!studentQuiz) {
        return res.status(404).json({ message: "Student quiz not found" });
      }
      
      const completedStudentQuiz = await storage.updateStudentQuizCompletion(
        studentQuiz.id, 
        percentageScore
      );
      
      // Return the full quiz with responses and score
      const result = await storage.getStudentQuizWithResponses(studentId, quizId);
      
      return res.json({
        ...result,
        correctAnswers,
        totalQuestions,
        score: percentageScore
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to complete quiz" });
    }
  });
  
  // Get a student's quiz with their responses
  app.get("/api/students/:studentId/quizzes/:quizId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const quizId = parseInt(req.params.quizId);
      
      if (isNaN(studentId) || isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid student or quiz ID" });
      }
      
      const result = await storage.getStudentQuizWithResponses(studentId, quizId);
      if (!result) {
        return res.status(404).json({ message: "Student quiz not found" });
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch student quiz" });
    }
  });

  // Create a new question
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      return res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create question" });
    }
  });
  
  // Create a new alternative for a question
  app.post("/api/alternatives", async (req, res) => {
    try {
      const alternativeData = insertAlternativeSchema.parse(req.body);
      
      // Verify the question exists
      const question = await storage.getQuestion(alternativeData.questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const alternative = await storage.createAlternative(alternativeData);
      return res.status(201).json(alternative);
    } catch (error) {
      console.error("Error creating alternative:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alternative data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create alternative" });
    }
  });
  
  // ---- CSV IMPORT ROUTES ----
  
  // Setup multer storage
  const upload = multer({ dest: 'uploads/' });

  // Import questions from CSV
  app.post('/api/import/questions', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const results: any[] = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            console.log(`Parsed ${results.length} questions from CSV`);
            
            // Process each question
            const imported = [];
            for (const row of results) {
              try {
                // Validate and transform data
                const questionData = {
                  code: row.code || null,
                  category: row.category || 'General',
                  enunciado: row.enunciado,
                  imagePath: row.imagePath || null
                };
                
                // Create the question
                const question = await storage.createQuestion(questionData);
                imported.push(question);
              } catch (err) {
                console.error('Error importing question:', row, err);
                // Continue with next row
              }
            }
            
            // Clean up temporary file
            fs.unlinkSync(filePath);
            
            return res.status(200).json({ 
              message: `Successfully imported ${imported.length} of ${results.length} questions`,
              imported 
            });
          } catch (error) {
            // Clean up temporary file
            fs.unlinkSync(filePath);
            return res.status(500).json({ message: 'Error processing questions', error: String(error) });
          }
        });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to import questions', error: String(error) });
    }
  });

  // Import alternatives from CSV
  app.post('/api/import/alternatives', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const results: any[] = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            console.log(`Parsed ${results.length} alternatives from CSV`);
            
            // Process each alternative
            const imported = [];
            for (const row of results) {
              try {
                // Validate and transform data
                const alternativeData = {
                  questionId: parseInt(row.questionId),
                  letter: row.letter,
                  texto: row.texto,
                  correct: row.correct === '1' || row.correct === 'true' || row.correct === true
                };
                
                // Validate questionId
                if (isNaN(alternativeData.questionId)) {
                  console.error('Invalid questionId:', row.questionId);
                  continue;
                }
                
                // Create the alternative
                const alternative = await storage.createAlternative(alternativeData);
                imported.push(alternative);
              } catch (err) {
                console.error('Error importing alternative:', row, err);
                // Continue with next row
              }
            }
            
            // Clean up temporary file
            fs.unlinkSync(filePath);
            
            return res.status(200).json({ 
              message: `Successfully imported ${imported.length} of ${results.length} alternatives`,
              imported 
            });
          } catch (error) {
            // Clean up temporary file
            fs.unlinkSync(filePath);
            return res.status(500).json({ message: 'Error processing alternatives', error: String(error) });
          }
        });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to import alternatives', error: String(error) });
    }
  });

  return httpServer;
}
