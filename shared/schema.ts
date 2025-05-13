import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Instructor table
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const insertInstructorSchema = createInsertSchema(instructors).pick({
  name: true,
  email: true,
});

export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;

// Student table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  turma: text("turma").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  turma: true,
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

// Quiz table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  instructorId: integer("instructor_id").notNull(),
  turma: text("turma").notNull(),
  questionCount: integer("question_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  instructorId: true,
  turma: true,
  questionCount: true,
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

// Question table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  code: text("code"),
  category: text("category").notNull(),
  enunciado: text("enunciado").notNull(),
  imagePath: text("image_path"),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  code: true,
  category: true,
  enunciado: true,
  imagePath: true,
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// Alternative table
export const alternatives = pgTable("alternatives", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  letter: text("letter").notNull(),
  texto: text("texto").notNull(),
  correct: boolean("correct").default(false).notNull(),
});

export const insertAlternativeSchema = createInsertSchema(alternatives).pick({
  questionId: true,
  letter: true,
  texto: true,
  correct: true,
});

export type Alternative = typeof alternatives.$inferSelect;
export type InsertAlternative = z.infer<typeof insertAlternativeSchema>;

// QuizQuestion junction table
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  questionId: integer("question_id").notNull(),
  order: integer("order").notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).pick({
  quizId: true,
  questionId: true,
  order: true,
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

// StudentResponse table
export const studentResponses = pgTable("student_responses", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  questionId: integer("question_id").notNull(),
  alternativeId: integer("alternative_id"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertStudentResponseSchema = createInsertSchema(studentResponses).pick({
  studentId: true,
  quizId: true,
  questionId: true,
  alternativeId: true,
});

export type StudentResponse = typeof studentResponses.$inferSelect;
export type InsertStudentResponse = z.infer<typeof insertStudentResponseSchema>;

// StudentQuiz table (to track completions)
export const studentQuizzes = pgTable("student_quizzes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score"),
  completed: boolean("completed").default(false).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertStudentQuizSchema = createInsertSchema(studentQuizzes).pick({
  studentId: true,
  quizId: true,
  score: true,
  completed: true,
});

export type StudentQuiz = typeof studentQuizzes.$inferSelect;
export type InsertStudentQuiz = z.infer<typeof insertStudentQuizSchema>;

// For our base user auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  type: text("type").notNull(), // "instructor" or "student"
  profileId: integer("profile_id").notNull(), // reference to instructor or student id
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  type: true,
  profileId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
