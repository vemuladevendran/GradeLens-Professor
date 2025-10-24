import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, Users } from "lucide-react";

// Dummy data
const dummyAssignments = [
  {
    id: "1",
    name: "Midterm Exam",
    course: "Introduction to Computer Science",
    dueDate: "2025-11-15",
    status: "active",
    submissions: 45,
    totalStudents: 50,
    questions: 10
  },
  {
    id: "2",
    name: "Data Structures Quiz",
    course: "Advanced Algorithms",
    dueDate: "2025-11-20",
    status: "active",
    submissions: 28,
    totalStudents: 35,
    questions: 5
  },
  {
    id: "3",
    name: "Final Project",
    course: "Web Development",
    dueDate: "2025-12-01",
    status: "upcoming",
    submissions: 0,
    totalStudents: 40,
    questions: 8
  },
  {
    id: "4",
    name: "Database Design Assignment",
    course: "Database Systems",
    dueDate: "2025-10-30",
    status: "graded",
    submissions: 32,
    totalStudents: 32,
    questions: 6
  },
];

const Assignments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Assignments</h1>
          <p className="text-muted-foreground">View and manage all assignments across courses</p>
        </div>

        <div className="grid gap-4">
          {dummyAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{assignment.name}</CardTitle>
                      <Badge variant={
                        assignment.status === "graded" ? "secondary" :
                        assignment.status === "active" ? "default" : "outline"
                      }>
                        {assignment.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span className="font-medium">{assignment.course}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
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
                      <span>{assignment.submissions}/{assignment.totalStudents} submitted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.questions} questions</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
