import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import CourseAssignments from "./pages/CourseAssignments";
import ExamDetail from "./pages/ExamDetail";
import ViewExam from "./pages/ViewExam";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import Grading from "./pages/Grading";
import GradeSubmission from "./pages/GradeSubmission";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course/:courseId/assignments" element={<CourseAssignments />} />
          <Route path="/course/:courseId/exam/new" element={<ExamDetail />} />
          <Route path="/course/:courseId/exam/:examId" element={<ViewExam />} />
          <Route path="/course/:courseId/assignment/:assignmentId" element={<ExamDetail />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignment/:assignmentId" element={<AssignmentDetail />} />
          <Route path="/grading" element={<Grading />} />
          <Route path="/grade-submission/:assignmentId/:studentName" element={<GradeSubmission />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
