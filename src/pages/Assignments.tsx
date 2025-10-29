import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users, HelpCircle } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "@/hooks/use-toast";

interface Exam {
  id: number;
  exam_name: string;
  course_name: string;
  overall_score: number;
  num_questions: number;
  num_enrolled_students: number;
  num_students_submitted: number;
}

const Assignments = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getAllExams, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch exams");
        }

        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error("Fetch exams error:", error);
        toast({
          title: "Error",
          description: "Failed to load assignments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">All Assignments</h1>
            <p className="text-muted-foreground">View and manage all assignments across courses</p>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Assignments</h1>
          <p className="text-muted-foreground">View and manage all assignments across courses</p>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Assignments Yet</CardTitle>
              <CardDescription>
                You haven't created any assignments yet. Create your first course and add exams to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{exam.exam_name}</CardTitle>
                        <Badge variant="default">
                          {exam.overall_score} points
                        </Badge>
                      </div>
                      <CardDescription className="font-medium">
                        {exam.course_name}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.num_students_submitted}/{exam.num_enrolled_students} submitted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.num_questions} questions</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/assignment/${exam.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
