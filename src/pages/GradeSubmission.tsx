import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "sonner";

interface Answer {
  question_id?: number;
  question: string;
  question_weight: number;
  answer_text: string;
  received_weight: number;
  feedback?: string;
}

interface GradeData {
  received_weight: number;
  feedback: string;
}

interface StudentSubmission {
  student_name: string;
  is_submitted: boolean;
  submission_timestamp: string | null;
  is_graded: boolean;
  answers: Answer[];
}

const GradeSubmission = () => {
  const navigate = useNavigate();
  const { courseId, assignmentId, studentId, studentName } = useParams();
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [grades, setGrades] = useState<{ [key: number]: GradeData }>({});
  const [overallFeedback, setOverallFeedback] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!assignmentId || !studentName) return;

      try {
        const response = await fetch(API_ENDPOINTS.getExamSubmissions(assignmentId), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch submission");
        }

        const data = await response.json();
        const studentSubmission = data.student_submissions.find(
          (s: StudentSubmission) => s.student_name === decodeURIComponent(studentName)
        );

        if (studentSubmission) {
          setSubmission(studentSubmission);
          
          // Initialize grades with existing data if already graded
          if (studentSubmission.is_graded) {
            const existingGrades: { [key: number]: GradeData } = {};
            studentSubmission.answers.forEach((answer) => {
              if (answer.question_id) {
                existingGrades[answer.question_id] = {
                  received_weight: answer.received_weight,
                  feedback: answer.feedback || "",
                };
              }
            });
            setGrades(existingGrades);
          }
        } else {
          throw new Error("Student submission not found");
        }
      } catch (error) {
        console.error("Fetch submission error:", error);
        toast.error("Failed to load submission. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId, studentName]);

  const handleAutoGrade = async () => {
    if (!courseId || !assignmentId || !studentId || studentId === "0") {
      toast.error("Missing required information for grading. Please ensure your backend API returns student_id in the submissions response.");
      return;
    }

    setIsGrading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.autoGrade(courseId, assignmentId, studentId),
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to auto-grade");
      }

      const data = await response.json();
      
      // Populate grades from API response with question_id as key
      const newGrades: { [key: number]: GradeData } = {};
      data.answers.forEach((answer: any) => {
        if (answer.question_id) {
          newGrades[answer.question_id] = {
            received_weight: parseFloat(answer.feedback?.total_score?.result || "0"),
            feedback: answer.feedback?.overall_feedback || "",
          };
        }
      });
      
      // Update submission with question_ids if available
      if (submission) {
        const updatedAnswers = submission.answers.map((ans, idx) => ({
          ...ans,
          question_id: data.answers[idx]?.question_id || ans.question_id,
        }));
        setSubmission({ ...submission, answers: updatedAnswers });
      }
      
      setGrades(newGrades);
      setOverallFeedback(data.overall_feedback || "");
      
      toast.success("AI grading completed! Review and edit as needed.");
    } catch (error) {
      console.error("Auto-grade error:", error);
      toast.error("Failed to auto-grade. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleGradeChange = (index: number, field: keyof GradeData, value: string | number) => {
    setGrades((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: field === "received_weight" ? parseFloat(value as string) || 0 : value,
      },
    }));
  };

  const handleSaveGrades = async () => {
    if (!courseId || !assignmentId || !studentId) {
      toast.error("Missing required information");
      return;
    }

    // Validate that all questions have been graded
    const allGraded = submission?.answers.every((answer) => {
      const questionId = answer.question_id;
      return questionId && grades[questionId] && grades[questionId].received_weight !== undefined;
    });

    if (!allGraded) {
      toast.error("Please provide grades for all questions");
      return;
    }

    try {
      // Calculate overall score
      const overall_received_score = submission?.answers.reduce(
        (total, answer) => total + (grades[answer.question_id!]?.received_weight || 0),
        0
      ) || 0;

      // Format answers for API
      const answers = submission?.answers.map((answer) => ({
        question_id: answer.question_id!,
        received_weight: grades[answer.question_id!]?.received_weight || 0,
        feedback: grades[answer.question_id!]?.feedback || "",
        is_graded: true,
      })) || [];

      const response = await fetch(
        API_ENDPOINTS.saveGrades(courseId, assignmentId, studentId),
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            overall_received_score,
            overall_feedback: overallFeedback,
            answers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save grades");
      }

      const data = await response.json();
      toast.success(data.message || "Grades saved successfully!");
      navigate(`/assignment/${assignmentId}`);
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!submission) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Submission not found</p>
          <Button onClick={() => navigate(`/assignment/${assignmentId}`)} className="mt-4">
            Back to Assignment
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalScore = submission.answers.reduce(
    (sum, answer) => sum + (grades[answer.question_id!]?.received_weight || 0), 
    0
  );
  const maxScore = submission.answers.reduce((sum, a) => sum + a.question_weight, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/assignment/${assignmentId}`)} className="mb-4">
            ← Back to Assignment
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{submission.student_name}'s Submission</h1>
              <p className="text-muted-foreground">
                {submission.submission_timestamp && 
                  `Submitted: ${new Date(submission.submission_timestamp).toLocaleString()}`}
              </p>
            </div>
            <Button onClick={handleAutoGrade} disabled={isGrading}>
              {isGrading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Auto Grade using AI
            </Button>
          </div>
        </div>

        {Object.keys(grades).length > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Score</CardTitle>
                  <CardDescription>Current total based on grading</CardDescription>
                </div>
                <Badge variant="default" className="text-2xl px-6 py-2">
                  {totalScore.toFixed(2)}/{maxScore}
                </Badge>
              </div>
            </CardHeader>
            {overallFeedback && (
              <CardContent>
                <Label>Overall Feedback</Label>
                <Textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </CardContent>
            )}
          </Card>
        )}

        <Tabs defaultValue="detailed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="detailed">Grade Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-4">
            {submission.answers.map((answer, index) => {
              const questionId = answer.question_id || index;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">Question {index + 1}</CardTitle>
                        <p className="text-sm text-muted-foreground font-medium mb-2">{answer.question}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{answer.question_weight} points</Badge>
                          {grades[questionId]?.received_weight !== undefined && (
                            <Badge 
                              variant={
                                grades[questionId].received_weight >= answer.question_weight * 0.8 
                                  ? "default" 
                                  : grades[questionId].received_weight >= answer.question_weight * 0.6 
                                  ? "secondary" 
                                  : "destructive"
                              }
                            >
                              Score: {grades[questionId].received_weight.toFixed(2)}/{answer.question_weight}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Student Answer:</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{answer.answer_text}</pre>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 pt-4 border-t">
                      <div className="grid gap-2">
                        <Label htmlFor={`score-${index}`}>
                          Score (Max: {answer.question_weight} points)
                        </Label>
                        <Input
                          id={`score-${index}`}
                          type="number"
                          min="0"
                          max={answer.question_weight}
                          step="0.1"
                          placeholder="Enter score"
                          value={grades[questionId]?.received_weight || ""}
                          onChange={(e) => handleGradeChange(questionId, "received_weight", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor={`feedback-${index}`}>Feedback</Label>
                        <Textarea
                          id={`feedback-${index}`}
                          placeholder="Enter feedback for the student"
                          rows={4}
                          value={grades[questionId]?.feedback || ""}
                          onChange={(e) => handleGradeChange(questionId, "feedback", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {Object.keys(grades).length > 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/assignment/${assignmentId}`)}>
              Back to Assignment
            </Button>
            <Button onClick={handleSaveGrades}>
              Submit Grades
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradeSubmission;
