import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, ClipboardCheck, User } from "lucide-react";

const AssignmentDetail = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const location = useLocation();
  const assignment = location.state?.assignment;

  // Dummy questions for this assignment
  const questions = [
    { id: 1, text: "Explain the difference between a stack and a queue", points: 10 },
    { id: 2, text: "What is Big O notation and why is it important?", points: 10 },
    { id: 3, text: "Implement a function to reverse a linked list", points: 15 },
    { id: 4, text: "Describe the SOLID principles in object-oriented programming", points: 15 },
    { id: 5, text: "What is the difference between SQL and NoSQL databases?", points: 10 },
  ];

  const submissions = [
    { id: "s1", name: "Alice Johnson", status: "graded", score: 85, submittedAt: "2025-10-28 14:30" },
    { id: "s2", name: "Bob Smith", status: "graded", score: 92, submittedAt: "2025-10-28 15:45" },
    { id: "s3", name: "Charlie Brown", status: "pending", score: null, submittedAt: "2025-10-29 09:20" },
    { id: "s4", name: "Diana Prince", status: "pending", score: null, submittedAt: "2025-10-29 11:15" },
    { id: "s5", name: "Eve Wilson", status: "graded", score: 78, submittedAt: "2025-10-27 16:00" },
  ];

  if (!assignment) {
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

  const submissionRate = (assignment.submissions / assignment.totalStudents) * 100;
  const gradedCount = submissions.filter(s => s.status === "graded").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/assignments")} className="mb-4">
            ← Back to Assignments
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{assignment.name}</h1>
              <p className="text-muted-foreground">{assignment.course}</p>
            </div>
            <Badge variant={
              assignment.status === "graded" ? "secondary" :
              assignment.status === "active" ? "default" : "outline"
            }>
              {assignment.status}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'long' })}
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
                {assignment.submissions}/{assignment.totalStudents}
              </p>
              <Progress value={submissionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {submissionRate.toFixed(0)}% submitted
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
                {gradedCount}/{assignment.submissions}
              </p>
              <Progress value={(gradedCount / assignment.submissions) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {assignment.submissions - gradedCount} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({assignment.submissions})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Questions</CardTitle>
                <CardDescription>
                  Total points: {questions.reduce((sum, q) => sum + q.points, 0)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-primary">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge>{question.points} points</Badge>
                          </div>
                          <p className="text-sm">{question.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Student Submissions</h3>
              <Button onClick={() => navigate("/grading")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Go to Grading
              </Button>
            </div>
            <div className="grid gap-4">
              {submissions.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {student.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.status === "graded" && student.score !== null && (
                          <Badge variant="secondary" className="text-lg px-4 py-1">
                            {student.score}/100
                          </Badge>
                        )}
                        <Badge variant={student.status === "graded" ? "secondary" : "default"}>
                          {student.status}
                        </Badge>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/grade/${student.id}`, { 
                            state: { studentName: student.name, assignmentId } 
                          })}
                        >
                          {student.status === "graded" ? "View" : "Grade"}
                        </Button>
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
