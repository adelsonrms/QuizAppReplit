import { 
  type User, type InsertUser, type Quiz, type InsertQuiz, 
  type Question, type InsertQuestion, type Alternative, type InsertAlternative,
  type Instructor, type InsertInstructor, type Student, type InsertStudent,
  type QuizQuestion, type InsertQuizQuestion, type StudentResponse, type InsertStudentResponse,
  type StudentQuiz, type InsertStudentQuiz
} from "@shared/schema";
import Database from 'better-sqlite3';
import path from 'path';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Instructor methods
  getInstructor(id: number): Promise<Instructor | undefined>;
  getInstructorByEmail(email: string): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  
  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentsByTurma(turma: string): Promise<Student[]>;
  
  // Quiz methods
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByInstructor(instructorId: number): Promise<Quiz[]>;
  getQuizzesByTurma(turma: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuizActive(id: number, active: boolean): Promise<Quiz | undefined>;
  updateQuizQuestionCount(id: number, questionCount: number): Promise<Quiz | undefined>;
  
  // Question methods
  getQuestion(id: number): Promise<Question | undefined>;
  getAllQuestions(): Promise<Question[]>;
  getQuestionsByCategory(category: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Alternative methods
  getAlternativesByQuestion(questionId: number): Promise<Alternative[]>;
  createAlternative(alternative: InsertAlternative): Promise<Alternative>;
  
  // QuizQuestion methods
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(quizQuestion: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // StudentResponse methods
  getStudentResponses(studentId: number, quizId: number): Promise<StudentResponse[]>;
  createStudentResponse(response: InsertStudentResponse): Promise<StudentResponse>;
  
  // StudentQuiz methods
  getStudentQuizzes(studentId: number): Promise<StudentQuiz[]>;
  getStudentQuizByIds(studentId: number, quizId: number): Promise<StudentQuiz | undefined>;
  createStudentQuiz(studentQuiz: InsertStudentQuiz): Promise<StudentQuiz>;
  updateStudentQuizCompletion(id: number, score: number): Promise<StudentQuiz | undefined>;
  
  // Aggregation methods
  getQuizWithQuestionsAndAlternatives(quizId: number): Promise<any>;
  getStudentQuizWithResponses(studentId: number, quizId: number): Promise<any>;
  getQuizStatistics(quizId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private instructors: Map<number, Instructor>;
  private students: Map<number, Student>;
  private quizzes: Map<number, Quiz>;
  private questions: Map<number, Question>;
  private alternatives: Map<number, Alternative>;
  private quizQuestions: Map<number, QuizQuestion>;
  private studentResponses: Map<number, StudentResponse>;
  private studentQuizzes: Map<number, StudentQuiz>;
  private db: Database.Database | null = null;
  
  // Counters for IDs
  private userId = 1;
  private instructorId = 1;
  private studentId = 1;
  private quizId = 1;
  private questionId = 1;
  private alternativeId = 1;
  private quizQuestionId = 1;
  private studentResponseId = 1;
  private studentQuizId = 1;
  
  constructor() {
    this.users = new Map();
    this.instructors = new Map();
    this.students = new Map();
    this.quizzes = new Map();
    this.questions = new Map();
    this.alternatives = new Map();
    this.quizQuestions = new Map();
    this.studentResponses = new Map();
    this.studentQuizzes = new Map();
    
    // Try to connect to SQLite database
    try {
      const dbPath = path.resolve('./attached_assets/QuizAppDb.sqlite');
      console.log(`Connecting to SQLite database at: ${dbPath}`);
      this.db = new Database(dbPath);
      console.log('Successfully connected to SQLite database');
      
      // Load questions and alternatives from SQLite
      this.loadQuestionsFromSQLite();
      this.loadAlternativesFromSQLite();
    } catch (error) {
      console.error('Error connecting to SQLite database:', error);
      this.db = null;
    }
    
    // Initialize remaining data
    this.initSampleData();
  }
  
  private loadQuestionsFromSQLite() {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare('SELECT * FROM Questoes');
      const rows = stmt.all();
      
      console.log(`Loaded ${rows.length} questions from SQLite database`);
      console.log('First question from SQLite:', rows.length > 0 ? JSON.stringify(rows[0]) : 'No questions found');
      
      rows.forEach((row: any) => {
        const question: Question = {
          id: row.Id,
          code: row.Codigo || null,
          category: row.Categoria,
          enunciado: row.Enunciado,
          imagePath: row.ImagemPath
        };
        
        console.log(`Processing question ID: ${question.id}, Category: ${question.category}`);
        this.questions.set(question.id, question);
        
        // Update the questionId counter to avoid conflicts
        if (question.id >= this.questionId) {
          this.questionId = question.id + 1;
        }
      });
      
      // Log all questions loaded to verify
      console.log(`Total questions in memory after loading: ${this.questions.size}`);
      console.log('Question IDs in memory:', Array.from(this.questions.keys()).join(', '));
    } catch (error) {
      console.error('Error loading questions from SQLite:', error);
    }
  }
  
  private loadAlternativesFromSQLite() {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare('SELECT * FROM Alternativas');
      const rows = stmt.all();
      
      console.log(`Loaded ${rows.length} alternatives from SQLite database`);
      console.log('First alternative from SQLite:', rows.length > 0 ? JSON.stringify(rows[0]) : 'No alternatives found');
      
      rows.forEach((row: any) => {
        const alternative: Alternative = {
          id: row.Id,
          questionId: row.QuestaoId,
          letter: row.Letra,
          texto: row.Texto,
          correct: row.Correta === 1
        };
        
        console.log(`Processing alternative ID: ${alternative.id}, for Question ID: ${alternative.questionId}, Letter: ${alternative.letter}`);
        this.alternatives.set(alternative.id, alternative);
        
        // Update the alternativeId counter to avoid conflicts
        if (alternative.id >= this.alternativeId) {
          this.alternativeId = alternative.id + 1;
        }
      });
      
      // Log all alternatives loaded to verify
      console.log(`Total alternatives in memory after loading: ${this.alternatives.size}`);
      const questionAlternatives = new Map<number, number[]>();
      this.alternatives.forEach(alt => {
        if (!questionAlternatives.has(alt.questionId)) {
          questionAlternatives.set(alt.questionId, []);
        }
        questionAlternatives.get(alt.questionId)?.push(alt.id);
      });
      console.log('Alternatives by question:', JSON.stringify(Array.from(questionAlternatives.entries())));
    } catch (error) {
      console.error('Error loading alternatives from SQLite:', error);
    }
  }
  
  private initSampleData() {
    // Create sample questions and alternatives
    this.initSampleQuestions();
  }
  
  private initSampleQuestions() {
    // Geography question 1
    const q1 = this.createQuestion({
      code: "GEO001",
      category: "Geografia",
      enunciado: "Qual é a principal atividade econômica das Ilhas Cayman na atualidade, responsável por grande parte de sua riqueza e desenvolvimento?",
      imagePath: "https://pixabay.com/get/gf2c04077f12b35a6abddb0c792c3414acb07114586834514ddb00652fcaeb5994568538d27d54a011d0d2d6e17a9fceda9ae26dfc0c46f4bc51e6a27e7744cf7_1280.jpg"
    });
    
    this.createAlternative({
      questionId: q1.id,
      letter: "A",
      texto: "Pesca comercial e exportação de frutos do mar",
      correct: false
    });
    
    this.createAlternative({
      questionId: q1.id,
      letter: "B",
      texto: "Serviços financeiros e bancários offshore",
      correct: true
    });
    
    this.createAlternative({
      questionId: q1.id,
      letter: "C",
      texto: "Agricultura de exportação, principalmente cana-de-açúcar",
      correct: false
    });
    
    this.createAlternative({
      questionId: q1.id,
      letter: "D",
      texto: "Extração e refino de petróleo",
      correct: false
    });
    
    this.createAlternative({
      questionId: q1.id,
      letter: "E",
      texto: "Produção e exportação de têxteis",
      correct: false
    });
    
    // Historia question
    const q2 = this.createQuestion({
      code: "HIS001",
      category: "História",
      enunciado: "Em que ano as Ilhas Cayman foram descobertas por Cristóvão Colombo?",
      imagePath: "https://pixabay.com/get/ga750f8229d42056721520ad14ef7a1e4cec14e0f72da2f742fbbc30523e5ffe257ebfb46d283f49a8dde44d740427673c5d1e44d53abfc76ae7dc1f2652f16e2_1280.jpg"
    });
    
    this.createAlternative({
      questionId: q2.id,
      letter: "A",
      texto: "1492",
      correct: false
    });
    
    this.createAlternative({
      questionId: q2.id,
      letter: "B",
      texto: "1503",
      correct: true
    });
    
    this.createAlternative({
      questionId: q2.id,
      letter: "C",
      texto: "1513",
      correct: false
    });
    
    this.createAlternative({
      questionId: q2.id,
      letter: "D",
      texto: "1598",
      correct: false
    });
    
    this.createAlternative({
      questionId: q2.id,
      letter: "E",
      texto: "1623",
      correct: false
    });
    
    // Cultura question
    const q3 = this.createQuestion({
      code: "CUL001",
      category: "Cultura",
      enunciado: "Qual é o nome do festival tradicional anual celebrado nas Ilhas Cayman em dezembro/janeiro?",
      imagePath: "https://pixabay.com/get/g3e54ffe61cca2f56e37a2b5e26c0fd0c3c3a4c19ddcbd6e4b54c4a81aef9ad98a56c5bc66e03c8baf2d49e24a1cb00d9d8d6e7ffa3e8a8df12dec3473e13ed1_1280.jpg"
    });
    
    this.createAlternative({
      questionId: q3.id,
      letter: "A",
      texto: "Pirates Week",
      correct: false
    });
    
    this.createAlternative({
      questionId: q3.id,
      letter: "B",
      texto: "Cayman Carnival Batabano",
      correct: false
    });
    
    this.createAlternative({
      questionId: q3.id,
      letter: "C",
      texto: "Cayman Islands Jazz Festival",
      correct: false
    });
    
    this.createAlternative({
      questionId: q3.id,
      letter: "D",
      texto: "Cayman Cookout",
      correct: true
    });
    
    this.createAlternative({
      questionId: q3.id,
      letter: "E",
      texto: "Seven Mile Beach Festival",
      correct: false
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Instructor methods
  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }
  
  async getInstructorByEmail(email: string): Promise<Instructor | undefined> {
    return Array.from(this.instructors.values()).find(
      (instructor) => instructor.email === email,
    );
  }
  
  async createInstructor(insertInstructor: InsertInstructor): Promise<Instructor> {
    const id = this.instructorId++;
    const instructor: Instructor = { ...insertInstructor, id };
    this.instructors.set(id, instructor);
    return instructor;
  }
  
  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const student: Student = { 
      ...insertStudent, 
      id
    };
    this.students.set(id, student);
    return student;
  }
  
  async getStudentsByTurma(turma: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.turma === turma,
    );
  }
  
  // Quiz methods
  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async getQuizzesByInstructor(instructorId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.instructorId === instructorId,
    );
  }
  
  async getQuizzesByTurma(turma: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.turma === turma,
    );
  }
  
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizId++;
    const createdAt = new Date();
    const quiz: Quiz = { ...insertQuiz, id, createdAt, active: true };
    this.quizzes.set(id, quiz);
    return quiz;
  }
  
  async updateQuizActive(id: number, active: boolean): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz: Quiz = { ...quiz, active };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }
  
  // Question methods
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async getAllQuestions(): Promise<Question[]> {
    console.log(`Getting all questions. Total questions in memory: ${this.questions.size}`);
    const questions = Array.from(this.questions.values());
    
    // Log first 5 questions to debug
    if (questions.length > 0) {
      console.log('Sample questions:');
      questions.slice(0, 5).forEach(q => console.log(`ID: ${q.id}, Category: ${q.category}, Question: ${q.enunciado.substring(0, 50)}...`));
    }
    
    return questions;
  }
  
  async getQuestionsByCategory(category: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.category === category,
    );
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }
  
  // Alternative methods
  async getAlternativesByQuestion(questionId: number): Promise<Alternative[]> {
    console.log(`Getting alternatives for question ID: ${questionId}`);
    const alternatives = Array.from(this.alternatives.values()).filter(
      (alternative) => alternative.questionId === questionId,
    );
    console.log(`Found ${alternatives.length} alternatives for question ID: ${questionId}`);
    if (alternatives.length > 0) {
      console.log(`Sample alternative: ${JSON.stringify(alternatives[0])}`);
    }
    return alternatives;
  }
  
  async createAlternative(insertAlternative: InsertAlternative): Promise<Alternative> {
    const id = this.alternativeId++;
    const alternative: Alternative = { ...insertAlternative, id };
    this.alternatives.set(id, alternative);
    return alternative;
  }
  
  // QuizQuestion methods
  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter((quizQuestion) => quizQuestion.quizId === quizId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  async createQuizQuestion(insertQuizQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    try {
      console.log(`Creating quiz question: ${JSON.stringify(insertQuizQuestion)}`);
      
      // Ensure the question exists
      const question = await this.getQuestion(insertQuizQuestion.questionId);
      if (!question) {
        throw new Error(`Question with ID ${insertQuizQuestion.questionId} not found`);
      }
      
      // Ensure the quiz exists
      const quiz = await this.getQuiz(insertQuizQuestion.quizId);
      if (!quiz) {
        throw new Error(`Quiz with ID ${insertQuizQuestion.quizId} not found`);
      }
      
      const id = this.quizQuestionId++;
      const quizQuestion: QuizQuestion = { 
        ...insertQuizQuestion, 
        id,
        order: insertQuizQuestion.order || 1 // Provide default order if not specified
      };
      
      this.quizQuestions.set(id, quizQuestion);
      console.log(`Created quiz question: ${JSON.stringify(quizQuestion)}`);
      return quizQuestion;
    } catch (error) {
      console.error('Error creating quiz question:', error);
      throw error;
    }
  }
  
  // StudentResponse methods
  async getStudentResponses(studentId: number, quizId: number): Promise<StudentResponse[]> {
    return Array.from(this.studentResponses.values()).filter(
      (response) => response.studentId === studentId && response.quizId === quizId,
    );
  }
  
  async createStudentResponse(insertResponse: InsertStudentResponse): Promise<StudentResponse> {
    const id = this.studentResponseId++;
    const submittedAt = new Date();
    const response: StudentResponse = { ...insertResponse, id, submittedAt };
    this.studentResponses.set(id, response);
    return response;
  }
  
  // StudentQuiz methods
  async getStudentQuizzes(studentId: number): Promise<StudentQuiz[]> {
    return Array.from(this.studentQuizzes.values()).filter(
      (studentQuiz) => studentQuiz.studentId === studentId,
    );
  }
  
  async getStudentQuizByIds(studentId: number, quizId: number): Promise<StudentQuiz | undefined> {
    return Array.from(this.studentQuizzes.values()).find(
      (studentQuiz) => studentQuiz.studentId === studentId && studentQuiz.quizId === quizId,
    );
  }
  
  async createStudentQuiz(insertStudentQuiz: InsertStudentQuiz): Promise<StudentQuiz> {
    const id = this.studentQuizId++;
    const startedAt = new Date();
    const studentQuiz: StudentQuiz = { 
      ...insertStudentQuiz, 
      id, 
      startedAt, 
      completedAt: undefined, 
      completed: false
    };
    this.studentQuizzes.set(id, studentQuiz);
    return studentQuiz;
  }
  
  async updateStudentQuizCompletion(id: number, score: number): Promise<StudentQuiz | undefined> {
    const studentQuiz = this.studentQuizzes.get(id);
    if (!studentQuiz) return undefined;
    
    const completedAt = new Date();
    const updatedStudentQuiz: StudentQuiz = { 
      ...studentQuiz, 
      score, 
      completed: true, 
      completedAt 
    };
    this.studentQuizzes.set(id, updatedStudentQuiz);
    return updatedStudentQuiz;
  }
  
  // Aggregation methods
  async getQuizWithQuestionsAndAlternatives(quizId: number): Promise<any> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) return null;
    
    const quizQuestions = await this.getQuizQuestions(quizId);
    const questionsData = await Promise.all(
      quizQuestions.map(async (quizQuestion) => {
        const question = await this.getQuestion(quizQuestion.questionId);
        if (!question) return null;
        
        const alternatives = await this.getAlternativesByQuestion(question.id);
        return {
          ...question,
          order: quizQuestion.order,
          alternatives,
        };
      })
    );
    
    return {
      ...quiz,
      questions: questionsData.filter(Boolean).sort((a, b) => a.order - b.order),
    };
  }
  
  async getStudentQuizWithResponses(studentId: number, quizId: number): Promise<any> {
    const studentQuiz = await this.getStudentQuizByIds(studentId, quizId);
    if (!studentQuiz) return null;
    
    const responses = await this.getStudentResponses(studentId, quizId);
    const quiz = await this.getQuizWithQuestionsAndAlternatives(quizId);
    
    const questionsWithResponses = quiz.questions.map((question: any) => {
      const response = responses.find((r) => r.questionId === question.id);
      return {
        ...question,
        selectedAlternativeId: response?.alternativeId,
      };
    });
    
    return {
      ...studentQuiz,
      quiz: {
        ...quiz,
        questions: questionsWithResponses,
      },
    };
  }
  
  async getQuizStatistics(quizId: number): Promise<any> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) return null;
    
    const studentQuizzes = Array.from(this.studentQuizzes.values()).filter(
      (sq) => sq.quizId === quizId && sq.completed
    );
    
    const totalStudents = studentQuizzes.length;
    const averageScore = totalStudents > 0 
      ? studentQuizzes.reduce((sum, sq) => sum + (sq.score || 0), 0) / totalStudents
      : 0;
    
    // Group by categories
    const questions = (await this.getQuizWithQuestionsAndAlternatives(quizId)).questions;
    const categoryMap = new Map<string, { total: number, correct: number }>();
    
    for (const question of questions) {
      if (!categoryMap.has(question.category)) {
        categoryMap.set(question.category, { total: 0, correct: 0 });
      }
      
      const category = categoryMap.get(question.category)!;
      category.total++;
    }
    
    // Count correct answers per category
    const allResponses = Array.from(this.studentResponses.values()).filter(
      (r) => r.quizId === quizId
    );
    
    for (const response of allResponses) {
      const question = questions.find((q: any) => q.id === response.questionId);
      if (!question) continue;
      
      const alternative = question.alternatives.find((a: any) => a.id === response.alternativeId);
      if (!alternative) continue;
      
      if (alternative.correct) {
        const category = categoryMap.get(question.category);
        if (category) {
          category.correct++;
        }
      }
    }
    
    const categoriesStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
    
    return {
      id: quizId,
      title: quiz.title,
      turma: quiz.turma,
      totalStudents,
      averageScore,
      categoriesStats,
    };
  }
}

export const storage = new MemStorage();
