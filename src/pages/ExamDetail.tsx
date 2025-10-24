import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
}

const ExamDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const course = location.state?.course;
  const assignment = location.state?.assignment;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rubric, setRubric] = useState("");

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question: value } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveExam = () => {
    const examData = {
      rubric,
      questions,
    };
    toast.success("Exam saved successfully!");
    console.log("Saving exam:", examData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${courseId}/assignments`, { state: { course } })} 
            className="mb-4"
          >
            ← Back to Assignments
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{assignment?.name || "Exam Questions"}</h1>
              <p className="text-muted-foreground">{course?.name}</p>
            </div>
            <Button onClick={saveExam}>
              <Save className="h-4 w-4 mr-2" />
              Save Exam
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grading Rubric</CardTitle>
            <CardDescription>
              Define the grading criteria for all questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="exam-rubric">Rubric</Label>
              <Textarea
                id="exam-rubric"
                placeholder="Enter the grading criteria and point distribution for this exam..."
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define clear criteria for AI grading (e.g., "Each question worth 10 points: 5 points for accuracy, 3 points for explanation, 2 points for examples")
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Exam Questions</CardTitle>
                <CardDescription>
                  Add questions for this exam
                </CardDescription>
              </div>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <Button onClick={addQuestion} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        placeholder="Enter the question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/course/${courseId}/assignments`, { state: { course } })}>
              Cancel
            </Button>
            <Button onClick={saveExam}>
              <Save className="h-4 w-4 mr-2" />
              Save Exam
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamDetail;
