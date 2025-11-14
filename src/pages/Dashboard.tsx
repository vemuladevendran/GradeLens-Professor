import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, BookOpen, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";

interface Course {
  id: number;
  course_name: string;
  course_code: string;
  course_description: string;
  exams?: any[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ 
    course_name: "", 
    course_code: "", 
    course_description: "" 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getCourses, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Fetch courses error:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!newCourse.course_name || !newCourse.course_code || !newCourse.course_description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.createCourse, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      const data = await response.json();
      setCourses([...courses, data.course]);
      setNewCourse({ course_name: "", course_code: "", course_description: "" });
      setIsDialogOpen(false);
      toast.success("Course created successfully");
    } catch (error) {
      console.error("Create course error:", error);
      toast.error("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(API_ENDPOINTS.deleteCourse(courseToDelete.id.toString()), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      const data = await response.json();
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
      toast.success(data.message || "Course deleted successfully");
      setCourseToDelete(null);
    } catch (error) {
      console.error("Delete course error:", error);
      toast.error("Failed to delete course");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Manage your courses and assignments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your dashboard. A Notes and Assignments folder will be created automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Deep Learning Fundamentals"
                    value={newCourse.course_name}
                    onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., DLF101"
                    value={newCourse.course_code}
                    onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseDescription">Course Description</Label>
                  <Textarea
                    id="courseDescription"
                    placeholder="Brief description of the course..."
                    value={newCourse.course_description}
                    onChange={(e) => setNewCourse({ ...newCourse, course_description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {courses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first course to get started with managing assignments and grading.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg mb-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{course.course_name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.course_code} • {course.course_description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/course/${course.id}`, { state: { course } })}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Course
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCourseToDelete(course);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the course{" "}
                <strong>{courseToDelete?.course_name}</strong> and all its related data including exams, notes, and student submissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
