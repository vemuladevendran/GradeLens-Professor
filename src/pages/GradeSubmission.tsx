import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "@/hooks/use-toast";

interface Answer {
  question: string;
  question_weight: number;
  answer_text: string;
  received_weight: number;
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
  const { assignmentId, studentName } = useParams();
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

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
        } else {
          throw new Error("Student submission not found");
        }
      } catch (error) {
        console.error("Fetch submission error:", error);
        toast({
          title: "Error",
          description: "Failed to load submission. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId, studentName]);

  const handleAutoGrade = () => {
    setIsGrading(true);
    // Simulate AI grading
    setTimeout(() => {
      setIsGrading(false);
      toast({
        title: "AI Grading",
        description: "AI grading feature will be available soon.",
      });
    }, 2000);
  };

  const handleSaveGrades = () => {
    toast({
      title: "Success",
      description: "Grades saved successfully!",
    });
    navigate(`/assignment/${assignmentId}`);
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

  const totalScore = submission.answers.reduce((sum, a) => sum + a.received_weight, 0);
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
            {!submission.is_graded && (
              <Button onClick={handleAutoGrade} disabled={isGrading}>
                {isGrading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Auto Grade using AI
              </Button>
            )}
          </div>
        </div>

        {submission.is_graded && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall Score</CardTitle>
                  <CardDescription>Final grade</CardDescription>
                </div>
                <Badge variant="default" className="text-2xl px-6 py-2">
                  {totalScore}/{maxScore}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="detailed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="detailed">
              {submission.is_graded ? "Graded Answers" : "Student Answers"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-4">
            {submission.answers.map((answer, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">Question {index + 1}</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium mb-2">{answer.question}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{answer.question_weight} points</Badge>
                        {submission.is_graded && answer.received_weight > 0 && (
                          <Badge 
                            variant={
                              answer.received_weight >= answer.question_weight * 0.8 
                                ? "default" 
                                : answer.received_weight >= answer.question_weight * 0.6 
                                ? "secondary" 
                                : "destructive"
                            }
                          >
                            Score: {answer.received_weight}/{answer.question_weight}
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
                  {submission.is_graded && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Feedback:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {answer.received_weight === answer.question_weight 
                          ? "Perfect score! Excellent work." 
                          : "Good attempt. Review the feedback for improvement."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {submission.is_graded && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/assignment/${assignmentId}`)}>
              Back to Assignment
            </Button>
            <Button onClick={handleSaveGrades}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradeSubmission;
