import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderOpen } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  question_weight: number;
  min_words: number;
  response: string | null;
  received_weight: number;
  feedback: string | null;
  is_graded: boolean;
}

interface Exam {
  id: number;
  exam_name: string;
  rubrics: string;
  overall_score: number;
  received_score: number;
  overall_feedback: string | null;
  assessment_questions: Question[];
}

const CourseAssignments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = location.state?.course;
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getExams(courseId!), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }

        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error("Fetch exams error:", error);
        toast.error("Failed to load exams");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchExams();
    }
  }, [courseId]);

  const handleAddExam = () => {
    navigate(`/course/${courseId}/exam/new`, { state: { course } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/course/${courseId}`, { state: { course } })} className="mb-4">
            ← Back to Course
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Exams</h1>
              <p className="text-muted-foreground">{course?.course_name}</p>
            </div>
            <Button onClick={handleAddExam}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Loading exams...</p>
            </CardContent>
          </Card>
        ) : exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
              <p className="text-muted-foreground text-center">
                Create your first exam to start adding questions and grading criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 bg-accent/10 rounded-lg w-fit mb-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{exam.exam_name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {exam.assessment_questions.length} questions • {exam.overall_score} points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/course/${courseId}/exam/${exam.id}`, { 
                      state: { course, exam } 
                    })}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    View Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseAssignments;
