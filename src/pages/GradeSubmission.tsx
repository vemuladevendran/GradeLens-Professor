import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Dummy AI grading response
const dummyGradingResult = {
  totalScore: 85,
  maxScore: 100,
  feedback: "Overall excellent work with strong understanding of core concepts.",
  questions: [
    {
      question: "Explain the difference between a stack and a queue",
      studentAnswer: "A stack follows LIFO (Last In First Out) principle while a queue follows FIFO (First In First Out). Stacks are used in function calls and undo operations, while queues are used in scheduling and breadth-first search.",
      score: 9,
      maxScore: 10,
      feedback: "Excellent explanation with practical examples. Minor deduction for not mentioning time complexity.",
    },
    {
      question: "What is Big O notation and why is it important?",
      studentAnswer: "Big O notation describes the worst-case time complexity of algorithms. It helps us understand how algorithms scale with input size.",
      score: 7,
      maxScore: 10,
      feedback: "Good basic understanding but could expand on space complexity and provide more concrete examples.",
    },
    {
      question: "Implement a function to reverse a linked list",
      studentAnswer: "```python\ndef reverse(head):\n    prev = None\n    current = head\n    while current:\n        next = current.next\n        current.next = prev\n        prev = current\n        current = next\n    return prev\n```",
      score: 10,
      maxScore: 10,
      feedback: "Perfect implementation with correct logic and variable naming.",
    },
  ],
};

const GradeSubmission = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const studentName = location.state?.studentName || "Student";
  
  const [gradingResult, setGradingResult] = useState(dummyGradingResult);
  const [isRegrading, setIsRegrading] = useState(false);

  const handleRegrade = () => {
    setIsRegrading(true);
    // Simulate AI regrading
    setTimeout(() => {
      setIsRegrading(false);
      toast.success("Submission regraded successfully!");
    }, 2000);
  };

  const handleSaveGrades = () => {
    toast.success("Grades saved successfully!");
    navigate("/grading");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate("/grading")} className="mb-4">
            ← Back to Grading
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{studentName}'s Submission</h1>
              <p className="text-muted-foreground">AI-Generated Grading Results</p>
            </div>
            <Button onClick={handleRegrade} disabled={isRegrading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegrading ? "animate-spin" : ""}`} />
              Regrade with AI
            </Button>
          </div>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Score</CardTitle>
                <CardDescription>AI-calculated final grade</CardDescription>
              </div>
              <Badge variant="default" className="text-2xl px-6 py-2">
                {gradingResult.totalScore}/{gradingResult.maxScore}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{gradingResult.feedback}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="detailed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
            <TabsTrigger value="json">JSON Output</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed" className="space-y-4">
            {gradingResult.questions.map((q, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">Question {index + 1}</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">{q.question}</p>
                    </div>
                    <Badge variant={q.score >= q.maxScore * 0.8 ? "default" : q.score >= q.maxScore * 0.6 ? "secondary" : "destructive"}>
                      {q.score}/{q.maxScore}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Student Answer:</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{q.studentAnswer}</pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI Feedback:
                    </h4>
                    <p className="text-sm text-muted-foreground">{q.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>Raw AI Response</CardTitle>
                <CardDescription>Complete JSON output from the AI grading system</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(gradingResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/grading")}>
            Cancel
          </Button>
          <Button onClick={handleSaveGrades}>
            Save Grades
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GradeSubmission;
