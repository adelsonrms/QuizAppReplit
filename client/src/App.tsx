import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import InstructorPage from "@/pages/InstructorPage";
import StudentPage from "@/pages/StudentPage";
import QuestionManagementPage from "@/pages/QuestionManagementPage";

// Import Remix Icons from CDN for icons
const remixIconsCss = document.createElement("link");
remixIconsCss.href = "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css";
remixIconsCss.rel = "stylesheet";
document.head.appendChild(remixIconsCss);

// Set document title
document.title = "AMS-QUIZ - Online Quiz System for Cayman Islands";

// Import Google Fonts
const googleFonts = document.createElement("link");
googleFonts.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap";
googleFonts.rel = "stylesheet";
document.head.appendChild(googleFonts);

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/instructor" component={InstructorPage} />
      <Route path="/questions" component={QuestionManagementPage} />
      <Route path="/student/:quizId" component={StudentPage} />
      <Route path="/student" component={() => <StudentPage />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
