import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, ClipboardCheck, User, ChevronDown, ChevronUp } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "@/hooks/use-toast";


interface Question {
  id: number;
  question: string;
  question_weight: number;
  min_words: number;
}

interface Answer {
  question: string;
  question_weight: number;
  answer_text: string;
  received_weight: number;
}

interface StudentSubmission {
  student_id?: number;
  student_name: string;
  is_submitted: boolean;
  submission_timestamp: string | null;
  is_graded: boolean;
  answers: Answer[];
}

interface ExamData {
  exam_name: string;
  course_name: string;
  course_id?: number;
  questions_count: number;
  total_submissions: number;
  questions: Question[];
  submissions: StudentSubmission[];
}

const AssignmentDetail = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!assignmentId) return;

      try {
        // Fetch exam submissions
        const response = await fetch(API_ENDPOINTS.getExamSubmissions(assignmentId), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch exam details");
        }

        const data = await response.json();
        setExamData(data);

        // If course_id is in the response, use it
        if (data.course_id) {
          setCourseId(data.course_id);
        } else {
          // Otherwise, fetch from courses list
          const coursesResponse = await fetch(API_ENDPOINTS.getCourses, {
            headers: getAuthHeaders(),
          });
          
          if (coursesResponse.ok) {
            const courses = await coursesResponse.json();
            // Find the course that contains this exam
            const course = courses.find((c: any) => 
              c.exams?.some((e: any) => e.id === parseInt(assignmentId))
            );
            if (course) {
              setCourseId(course.id);
            }
          }
        }
      } catch (error) {
        console.error("Fetch exam details error:", error);
        toast({
          title: "Error",
          description: "Failed to load exam details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [assignmentId]);


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!examData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Assignment not found</p>
          <Button onClick={() => navigate("/assignments")} className="mt-4">
            Back to Assignments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const gradedCount = examData.submissions.filter(s => s.is_graded).length;
  const totalSubmitted = examData.total_submissions;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/assignments")} className="mb-4">
            ← Back to Assignments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{examData.exam_name}</h1>
            <p className="text-muted-foreground">{examData.course_name}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{examData.questions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total points: {examData.questions.reduce((sum, q) => sum + q.question_weight, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {examData.total_submissions}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total submissions received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                Grading Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {gradedCount}/{totalSubmitted}
              </p>
              <Progress value={totalSubmitted > 0 ? (gradedCount / totalSubmitted) * 100 : 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalSubmitted - gradedCount} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Questions ({examData.questions.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({examData.total_submissions})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Questions</CardTitle>
                <CardDescription>
                  Total points: {examData.questions.reduce((sum, q) => sum + q.question_weight, 0)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {examData.questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-primary">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge>{question.question_weight} points</Badge>
                            <Badge variant="secondary">{question.min_words} min words</Badge>
                          </div>
                          <p className="text-sm">{question.question}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <div className="grid gap-4">
              {examData.submissions.map((student, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{student.student_name}</h4>
                            {student.submission_timestamp && (
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(student.submission_timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={student.is_submitted ? "default" : "outline"}>
                            {student.is_submitted ? "Submitted" : "Not Submitted"}
                          </Badge>
                          <Badge variant={student.is_graded ? "secondary" : "outline"}>
                            {student.is_graded ? "Graded" : "Not Graded"}
                          </Badge>
                          {student.is_submitted && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const studentId = student.student_id || 0;
                                const cId = courseId || examData?.course_id || 0;
                                navigate(`/grade-submission/${cId}/${assignmentId}/${studentId}/${encodeURIComponent(student.student_name)}`);
                              }}
                            >
                              View Answers
                            </Button>
                          )}
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
