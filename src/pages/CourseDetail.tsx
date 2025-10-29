import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, BookOpen, FileText, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CourseDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;
  const [uploadedNotes, setUploadedNotes] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedNotes([...uploadedNotes, ...Array.from(e.target.files)]);
      toast.success(`${e.target.files.length} file(s) uploaded`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedNotes(uploadedNotes.filter((_, i) => i !== index));
    toast.success("File removed");
  };

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
          <h1 className="text-3xl font-bold">{course.course_name}</h1>
          <p className="text-muted-foreground">{course.course_description}</p>
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
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <Label htmlFor="notes-upload" className="cursor-pointer">
                  <span className="text-sm text-primary hover:underline">
                    Click to upload files
                  </span>
                  <Input
                    id="notes-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  PDFs, DOCs, TXTs supported
                </p>
              </div>
              
              {uploadedNotes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files ({uploadedNotes.length})</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedNotes.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <CardTitle>📂 Exams</CardTitle>
              <CardDescription>
                Create and manage exams, questions, and grading rubrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate(`/course/${course.id}/assignments`, { state: { course } })}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Exams
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
