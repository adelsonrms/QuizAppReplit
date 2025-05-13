import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuizSchema, insertStudentSchema, insertInstructorSchema,
  insertStudentQuizSchema, insertStudentResponseSchema
} from "@shared/schema";
import { z } from "zod";

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
  
  // Create a new quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      
      // Generate quiz questions
      const allQuestions = await storage.getAllQuestions();
      if (allQuestions.length < quizData.questionCount) {
        return res.status(400).json({ 
          message: "Not enough questions available for the requested count" 
        });
      }
      
      // Randomly select questions
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, quizData.questionCount);
      
      // Create quiz question relationships
      for (let i = 0; i < selectedQuestions.length; i++) {
        await storage.createQuizQuestion({
          quizId: quiz.id,
          questionId: selectedQuestions[i].id,
          order: i + 1
        });
      }
      
      return res.status(201).json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create quiz" });
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

  return httpServer;
}
