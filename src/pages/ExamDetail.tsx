import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";

interface Question {
  id: string;
  question: string;
  question_weight: number;
  min_words: number;
}

const ExamDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const course = location.state?.course;
  const assignment = location.state?.assignment;
  
  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rubric, setRubric] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      question_weight: 10,
      min_words: 50,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setIsUploadingPdf(true);
    try {
      // Create a temporary file path for parsing
      const formData = new FormData();
      formData.append("file", file);

      // Read file as text to parse questions
      const text = await file.text();
      
      // Simple regex pattern to extract questions
      // Matches "Question X :" followed by the question text until the next "Question" or end
      const questionPattern = /Question\s+\d+\s*:\s*\n(.+?)(?=Question\s+\d+\s*:|$)/gs;
      const matches = [...text.matchAll(questionPattern)];

      if (matches.length === 0) {
        toast.error("No questions found in the PDF. Please check the format.");
        return;
      }

      const extractedQuestions: Question[] = matches.map((match, index) => ({
        id: Date.now().toString() + index,
        question: match[1].trim(),
        question_weight: 10,
        min_words: 50,
      }));

      setQuestions([...questions, ...extractedQuestions]);
      toast.success(`Successfully extracted ${extractedQuestions.length} questions from PDF`);
      
      // Reset the file input
      event.target.value = "";
    } catch (error) {
      console.error("PDF parsing error:", error);
      toast.error("Failed to parse PDF. Please check the file format.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const saveExam = async () => {
    if (!examName.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    if (!rubric.trim()) {
      toast.error("Please enter a grading rubric");
      return;
    }

    const overall_score = questions.reduce((sum, q) => sum + q.question_weight, 0);

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.createExam(courseId!), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          exam_name: examName,
          rubrics: rubric,
          overall_score,
          course: courseId,
          assessment_questions: questions.map(({ id, ...rest }) => rest),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create exam");
      }

      const data = await response.json();
      toast.success("Exam created successfully!");
      navigate(`/course/${courseId}/assignments`, { state: { course } });
    } catch (error) {
      console.error("Create exam error:", error);
      toast.error("Failed to create exam");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold">Create New Exam</h1>
            <p className="text-muted-foreground">{course?.course_name}</p>
          </div>
          <Button onClick={saveExam} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Exam"}
          </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>
              Enter the exam name and grading criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Exam Name</Label>
              <Input
                id="exam-name"
                placeholder="e.g., Final Exam"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-rubric">Grading Rubric</Label>
              <Textarea
                id="exam-rubric"
                placeholder="Enter the grading criteria and point distribution for this exam..."
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define clear criteria for AI grading (e.g., "Grading based on clarity, correctness, and completeness")
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
              <div className="flex gap-2">
                <Button onClick={addQuestion} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button 
                  variant="outline"
                  disabled={isUploadingPdf}
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingPdf ? "Uploading..." : "Upload from PDF"}
                </Button>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                        <Textarea
                          id={`question-${question.id}`}
                          placeholder="Enter the question..."
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`weight-${question.id}`}>Question Weight (Points)</Label>
                          <Input
                            id={`weight-${question.id}`}
                            type="number"
                            min="0"
                            placeholder="10"
                            value={question.question_weight}
                            onChange={(e) => updateQuestion(question.id, "question_weight", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`minWords-${question.id}`}>Minimum Words</Label>
                          <Input
                            id={`minWords-${question.id}`}
                            type="number"
                            min="0"
                            placeholder="50"
                            value={question.min_words}
                            onChange={(e) => updateQuestion(question.id, "min_words", parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">
                    {questions.reduce((sum, q) => sum + q.question_weight, 0)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate(`/course/${courseId}/assignments`, { state: { course } })} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={saveExam} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Exam"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamDetail;
