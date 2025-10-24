import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, FolderOpen } from "lucide-react";

interface Assignment {
  id: string;
  name: string;
  description: string;
}

const CourseAssignments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = location.state?.course;
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignment, setNewAssignment] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateAssignment = () => {
    if (newAssignment.name && newAssignment.description) {
      const assignment: Assignment = {
        id: Date.now().toString(),
        ...newAssignment,
      };
      setAssignments([...assignments, assignment]);
      setNewAssignment({ name: "", description: "" });
      setIsDialogOpen(false);
    }
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
              <h1 className="text-3xl font-bold">Assignments</h1>
              <p className="text-muted-foreground">{course?.name}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Add a new assignment to this course
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignmentName">Assignment Name</Label>
                    <Input
                      id="assignmentName"
                      placeholder="e.g., Midterm Exam"
                      value={newAssignment.name}
                      onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignmentDescription">Description</Label>
                    <Textarea
                      id="assignmentDescription"
                      placeholder="Brief description..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssignment}>
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {assignments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground text-center">
                Create your first assignment to start adding exams and questions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 bg-accent/10 rounded-lg w-fit mb-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{assignment.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/course/${courseId}/assignment/${assignment.id}`, { 
                      state: { course, assignment } 
                    })}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Assignment
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
