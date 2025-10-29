import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";

interface Question {
  id?: number;
  question: string;
  question_weight: number;
  min_words: number;
  response?: string | null;
  received_weight?: number;
  feedback?: string | null;
  is_graded?: boolean;
}

interface ExamData {
  id: number;
  exam_name: string;
  rubrics: string;
  overall_score: number;
  received_score: number;
  overall_feedback: string | null;
  assessment_questions: Question[];
}

const ViewExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, examId } = useParams();
  const course = location.state?.course;
  
  const [examName, setExamName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rubric, setRubric] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getExams(courseId!), {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch exam");
        }

        const data: ExamData[] = await response.json();
        const exam = data.find(e => e.id === parseInt(examId!));

        if (exam) {
          setExamName(exam.exam_name);
          setRubric(exam.rubrics);
          setQuestions(exam.assessment_questions.map(q => ({
            id: q.id,
            question: q.question,
            question_weight: q.question_weight,
            min_words: q.min_words,
          })));
        } else {
          toast.error("Exam not found");
          navigate(`/course/${courseId}/assignments`, { state: { course } });
        }
      } catch (error) {
        console.error("Fetch exam error:", error);
        toast.error("Failed to load exam");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && examId) {
      fetchExam();
    }
  }, [courseId, examId, navigate, course]);

  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      question_weight: 10,
      min_words: 50,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    setQuestions(questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
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

    setIsSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.updateExam(courseId!, examId!), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          exam_name: examName,
          rubrics: rubric,
          overall_score,
          course: courseId,
          assessment_questions: questions.map(({ id, response, received_weight, feedback, is_graded, ...rest }) => rest),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update exam");
      }

      toast.success("Exam updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      console.error("Update exam error:", error);
      toast.error("Failed to update exam");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${courseId}/assignments`, { state: { course } })} 
            className="mb-4"
          >
            ← Back to Exams
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{isEditMode ? "Edit Exam" : "View Exam"}</h1>
              <p className="text-muted-foreground">{course?.course_name}</p>
            </div>
            <div className="flex gap-3">
              {!isEditMode ? (
                <Button onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Exam
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={saveExam} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>
              {isEditMode ? "Edit the exam name and grading criteria" : "View exam information"}
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
                disabled={!isEditMode}
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
                disabled={!isEditMode}
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
                  {isEditMode ? "Add or edit questions for this exam" : "View exam questions"}
                </CardDescription>
              </div>
              {isEditMode && (
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                {isEditMode && (
                  <Button onClick={addQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                )}
              </div>
            ) : (
              questions.map((question, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      {isEditMode && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${index}`}>Question Text</Label>
                        <Textarea
                          id={`question-${index}`}
                          placeholder="Enter the question..."
                          value={question.question}
                          onChange={(e) => updateQuestion(index, "question", e.target.value)}
                          rows={3}
                          disabled={!isEditMode}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`weight-${index}`}>Question Weight (Points)</Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            min="0"
                            placeholder="10"
                            value={question.question_weight}
                            onChange={(e) => updateQuestion(index, "question_weight", parseInt(e.target.value) || 0)}
                            disabled={!isEditMode}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`minWords-${index}`}>Minimum Words</Label>
                          <Input
                            id={`minWords-${index}`}
                            type="number"
                            min="0"
                            placeholder="50"
                            value={question.min_words}
                            onChange={(e) => updateQuestion(index, "min_words", parseInt(e.target.value) || 0)}
                            disabled={!isEditMode}
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
                {isEditMode && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={saveExam} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewExam;
