import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, BookOpen, FileText, Upload } from "lucide-react";

const CourseDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            ← Back to Courses
          </Button>
          <h1 className="text-3xl font-bold">{course.name}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>📘 Notes</CardTitle>
              <CardDescription>
                Upload and manage course materials, lecture notes, and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <CardTitle>📂 Assignments</CardTitle>
              <CardDescription>
                Create and manage assignments, exams, and grading rubrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate(`/course/${course.id}/assignments`, { state: { course } })}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Open Assignments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
