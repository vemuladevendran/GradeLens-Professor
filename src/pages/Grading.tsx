import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, User, FileText } from "lucide-react";

// Dummy data
const dummyCourses = [
  { id: "1", name: "Introduction to Computer Science" },
  { id: "2", name: "Advanced Algorithms" },
  { id: "3", name: "Web Development" },
];

const dummyAssignments: Record<string, any[]> = {
  "1": [
    { id: "a1", name: "Midterm Exam", submissions: 45 },
    { id: "a2", name: "Programming Assignment 1", submissions: 50 },
  ],
  "2": [
    { id: "a3", name: "Data Structures Quiz", submissions: 28 },
  ],
  "3": [
    { id: "a4", name: "Final Project", submissions: 40 },
  ],
};

const dummyStudents: Record<string, any[]> = {
  "a1": [
    { id: "s1", name: "Alice Johnson", submittedAt: "2025-10-28 14:30", status: "pending" },
    { id: "s2", name: "Bob Smith", submittedAt: "2025-10-28 15:45", status: "graded" },
    { id: "s3", name: "Charlie Brown", submittedAt: "2025-10-29 09:20", status: "pending" },
    { id: "s4", name: "Diana Prince", submittedAt: "2025-10-29 11:15", status: "pending" },
  ],
  "a2": [
    { id: "s5", name: "Eve Wilson", submittedAt: "2025-10-27 16:00", status: "graded" },
    { id: "s6", name: "Frank Miller", submittedAt: "2025-10-28 10:30", status: "pending" },
  ],
  "a3": [
    { id: "s7", name: "Grace Lee", submittedAt: "2025-10-29 13:45", status: "pending" },
    { id: "s8", name: "Henry Ford", submittedAt: "2025-10-29 14:20", status: "graded" },
  ],
  "a4": [
    { id: "s9", name: "Ivy Chen", submittedAt: "2025-10-30 08:00", status: "pending" },
  ],
};

const Grading = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");

  const assignments = selectedCourse ? dummyAssignments[selectedCourse] || [] : [];
  const students = selectedAssignment ? dummyStudents[selectedAssignment] || [] : [];

  const handleGradeStudent = (studentId: string, studentName: string) => {
    navigate(`/grade/${studentId}`, { state: { studentName, assignmentId: selectedAssignment } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Grading</h1>
          <p className="text-muted-foreground">Review and grade student submissions with AI assistance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Assignment</CardTitle>
            <CardDescription>Choose a course and assignment to view submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select value={selectedCourse} onValueChange={(value) => {
                  setSelectedCourse(value);
                  setSelectedAssignment("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment</label>
                <Select 
                  value={selectedAssignment} 
                  onValueChange={setSelectedAssignment}
                  disabled={!selectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.name} ({assignment.submissions} submissions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Student Submissions</h2>
              <Badge variant="outline">{students.length} total</Badge>
            </div>
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {student.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={student.status === "graded" ? "secondary" : "default"}>
                          {student.status}
                        </Badge>
                        <Button 
                          onClick={() => handleGradeStudent(student.id, student.name)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          {student.status === "graded" ? "View Grades" : "Grade Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : selectedAssignment ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground text-center">
                Students haven't submitted their work for this assignment.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default Grading;
