import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, User, FileText, Download, BarChart3, BookOpen, TrendingUp, Award } from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExamData {
  id: number;
  course_id: number;
  exam_name: string;
  course_name: string;
  overall_score: number;
  num_questions: number;
  num_enrolled_students: number;
  num_students_submitted: number;
}

interface StudentSubmission {
  student_id: number;
  student_name: string;
  is_submitted: boolean;
  submission_timestamp: string | null;
  is_graded: boolean;
  answers: Array<{
    question_id: number;
    question: string;
    question_weight: number;
    answer_text: string;
    received_weight: number;
    feedback?: string;
  }>;
}

interface ExamSubmissionsData {
  exam_name: string;
  course_name: string;
  num_enrolled_students: number;
  num_students_submitted: number;
  questions: Array<{
    id: number;
    question: string;
    question_weight: number;
    min_words: number;
  }>;
  student_submissions: StudentSubmission[];
}

const Grading = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamData[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [submissionsData, setSubmissionsData] = useState<ExamSubmissionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchSubmissions(selectedExam);
    } else {
      setSubmissionsData(null);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getAllExams, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }

      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (examId: string) => {
    setIsLoadingSubmissions(true);
    try {
      const response = await fetch(API_ENDPOINTS.getExamSubmissions(examId), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      setSubmissionsData(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradeStudent = (studentId: number, studentName: string, courseId: number) => {
    navigate(`/grade-submission/${courseId}/${selectedExam}/${studentId}/${encodeURIComponent(studentName)}`);
  };

  const handleExportGrades = () => {
    if (!submissionsData || !submissionsData.student_submissions.length) {
      toast.error("No data to export");
      return;
    }

    const selectedExamData = exams.find(e => e.id.toString() === selectedExam);
    if (!selectedExamData) return;

    // Create CSV content
    let csvContent = "Student Name,Exam Name,Course Name,Total Score,Max Score,Percentage,Status\n";
    
    submissionsData.student_submissions.forEach((student) => {
      if (student.is_submitted) {
        const totalReceived = student.answers.reduce((sum, ans) => sum + ans.received_weight, 0);
        const percentage = ((totalReceived / selectedExamData.overall_score) * 100).toFixed(2);
        const status = student.is_graded ? "Graded" : "Pending";
        
        csvContent += `"${student.student_name}","${submissionsData.exam_name}","${submissionsData.course_name}",${totalReceived},${selectedExamData.overall_score},${percentage}%,${status}\n`;
      }
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${submissionsData.exam_name}_grades.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Grades exported successfully!");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const selectedExamData = exams.find(e => e.id.toString() === selectedExam);
  const gradedCount = submissionsData?.student_submissions.filter(s => s.is_graded).length || 0;
  const pendingCount = submissionsData ? submissionsData.num_students_submitted - gradedCount : 0;

  // Calculate analytics data
  const getAnalyticsData = () => {
    if (!submissionsData || !selectedExamData) return null;

    const gradedSubmissions = submissionsData.student_submissions.filter(s => s.is_submitted && s.is_graded);
    if (gradedSubmissions.length === 0) return null;

    const scores = gradedSubmissions.map(s => {
      const totalReceived = s.answers.reduce((sum, ans) => sum + ans.received_weight, 0);
      const percentage = (totalReceived / selectedExamData.overall_score) * 100;
      return { name: s.student_name, score: totalReceived, percentage: percentage };
    });

    const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const averagePercentage = (averageScore / selectedExamData.overall_score) * 100;

    // Score distribution
    const distribution = [
      { range: "0-20%", count: 0, fill: "var(--destructive)" },
      { range: "21-40%", count: 0, fill: "var(--orange)" },
      { range: "41-60%", count: 0, fill: "var(--yellow)" },
      { range: "61-80%", count: 0, fill: "var(--chart-2)" },
      { range: "81-100%", count: 0, fill: "var(--chart-1)" },
    ];

    // Score trend data - simulating trend by ranking
    const trendData = scores.map((s, idx) => ({
      student: `#${idx + 1}`,
      score: s.score,
      percentage: s.percentage,
    }));

    scores.forEach(s => {
      if (s.percentage <= 20) distribution[0].count++;
      else if (s.percentage <= 40) distribution[1].count++;
      else if (s.percentage <= 60) distribution[2].count++;
      else if (s.percentage <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // Question-wise analytics
    const questionAnalytics = submissionsData.questions.map(question => {
      const questionAnswers = gradedSubmissions
        .map(s => s.answers.find(a => a.question_id === question.id))
        .filter(a => a !== undefined);

      const totalStudents = questionAnswers.length;
      const totalPossibleScore = question.question_weight * totalStudents;
      const totalReceivedScore = questionAnswers.reduce((sum, a) => sum + a.received_weight, 0);
      const averageScore = totalStudents > 0 ? totalReceivedScore / totalStudents : 0;
      const averagePercentage = (averageScore / question.question_weight) * 100;

      return {
        question: question.question.length > 50 ? question.question.substring(0, 50) + '...' : question.question,
        fullQuestion: question.question,
        averageScore: averageScore.toFixed(2),
        maxScore: question.question_weight,
        averagePercentage: averagePercentage.toFixed(1),
        totalStudents,
        difficulty: averagePercentage >= 80 ? 'Easy' : averagePercentage >= 60 ? 'Medium' : 'Hard',
      };
    }).sort((a, b) => parseFloat(a.averagePercentage) - parseFloat(b.averagePercentage));

    return {
      averageScore: averageScore.toFixed(2),
      averagePercentage: averagePercentage.toFixed(1),
      maxScore: Math.max(...scores.map(s => s.score)).toFixed(2),
      minScore: Math.min(...scores.map(s => s.score)).toFixed(2),
      scores: scores.sort((a, b) => b.score - a.score),
      distribution: distribution.filter(d => d.count > 0),
      trendData,
      questionAnalytics,
    };
  };

  const analyticsData = getAnalyticsData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Assignments</h1>
          <p className="text-muted-foreground">Review and grade student submissions with AI assistance</p>
        </div>

        {exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
              <p className="text-muted-foreground text-center">
                Create an exam to start grading submissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{exams.length}</div>
                </CardContent>
              </Card>
              {selectedExamData && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedExamData.num_enrolled_students}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedExamData.num_students_submitted}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Graded</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{gradedCount}</div>
                      <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Exam</CardTitle>
                    <CardDescription>Choose an exam to view and grade submissions</CardDescription>
                  </div>
                  {submissionsData && submissionsData.student_submissions.length > 0 && (
                    <Button onClick={handleExportGrades} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Grades
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {exams.map((exam) => (
                    <Card 
                      key={exam.id} 
                      className={`cursor-pointer transition-all ${selectedExam === exam.id.toString() ? 'border-primary shadow-md' : 'hover:shadow-md'}`}
                      onClick={() => setSelectedExam(exam.id.toString())}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{exam.exam_name}</h3>
                            <p className="text-sm text-muted-foreground">{exam.course_name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">{exam.num_students_submitted}/{exam.num_enrolled_students}</p>
                              <p className="text-xs text-muted-foreground">Submitted</p>
                            </div>
                            <Badge variant="outline">{exam.num_questions} questions</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isLoadingSubmissions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : submissionsData && submissionsData.student_submissions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Student Submissions</h2>
                  <Badge variant="outline">{submissionsData.num_students_submitted} submitted</Badge>
                </div>
                <div className="grid gap-4">
                  {submissionsData.student_submissions.map((student) => {
                    if (!student.is_submitted) return null;
                    
                    const totalReceived = student.answers.reduce((sum, ans) => sum + ans.received_weight, 0);
                    const percentage = selectedExamData ? ((totalReceived / selectedExamData.overall_score) * 100).toFixed(1) : "0";
                    
                    return (
                      <Card key={student.student_id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{student.student_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {student.submission_timestamp && 
                                    `Submitted: ${new Date(student.submission_timestamp).toLocaleString()}`}
                                </p>
                                {student.is_graded && (
                                  <p className="text-sm font-medium mt-1">
                                    Score: {totalReceived.toFixed(2)}/{selectedExamData?.overall_score} ({percentage}%)
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={student.is_graded ? "secondary" : "default"}>
                                {student.is_graded ? "Graded" : "Pending"}
                              </Badge>
                              <Button 
                                onClick={() => {
                                  const exam = exams.find(e => e.id.toString() === selectedExam);
                                  if (exam) {
                                    handleGradeStudent(student.student_id, student.student_name, exam.course_id);
                                  }
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                {student.is_graded ? "View Grades" : "Grade Now"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : selectedExam ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground text-center">
                    Students haven't submitted their work for this exam.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {/* Analytics Section */}
            {analyticsData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Analytics & Performance</h2>
                </div>

                {/* Performance Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.averageScore}</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData.averagePercentage}% of total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.maxScore}</div>
                      <p className="text-xs text-muted-foreground">
                        {((parseFloat(analyticsData.maxScore) / selectedExamData!.overall_score) * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.minScore}</div>
                      <p className="text-xs text-muted-foreground">
                        {((parseFloat(analyticsData.minScore) / selectedExamData!.overall_score) * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{gradedCount}</div>
                      <p className="text-xs text-muted-foreground">
                        of {submissionsData?.num_students_submitted} submissions
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Score Trends</CardTitle>
                    <CardDescription>Score distribution from highest to lowest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        score: {
                          label: "Score",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="student" 
                            tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                          />
                          <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="hsl(var(--chart-1))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Score Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Score Distribution</CardTitle>
                      <CardDescription>Percentage ranges of student scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          count: {
                            label: "Students",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.distribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ range, count }) => `${range}: ${count}`}
                              outerRadius={80}
                              dataKey="count"
                            >
                              {analyticsData.distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${entry.fill})`} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Top Performers Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top 5 Performers</CardTitle>
                      <CardDescription>Highest scoring students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          score: {
                            label: "Score",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.scores.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              interval={0}
                              tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                            />
                            <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              {analyticsData.scores.slice(0, 5).map((_, index) => {
                                const colors = [
                                  "hsl(var(--chart-1))",
                                  "hsl(var(--chart-2))",
                                  "hsl(var(--chart-3))",
                                  "hsl(var(--chart-4))",
                                  "hsl(var(--chart-5))",
                                ];
                                return <Cell key={`cell-${index}`} fill={colors[index]} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Question-wise Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Question-wise Performance</CardTitle>
                    <CardDescription>Identify which questions students struggled with most</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        averagePercentage: {
                          label: "Average %",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.questionAnalytics} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--foreground))" }} />
                          <YAxis 
                            dataKey="question" 
                            type="category" 
                            width={200}
                            tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                          />
                          <ChartTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold mb-2">{data.fullQuestion}</p>
                                    <p className="text-sm">Average: {data.averageScore}/{data.maxScore}</p>
                                    <p className="text-sm">Percentage: {data.averagePercentage}%</p>
                                    <p className="text-sm">Students: {data.totalStudents}</p>
                                    <Badge className="mt-2" variant={
                                      data.difficulty === 'Easy' ? 'default' : 
                                      data.difficulty === 'Medium' ? 'secondary' : 
                                      'destructive'
                                    }>
                                      {data.difficulty}
                                    </Badge>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="averagePercentage" radius={[0, 4, 4, 0]}>
                            {analyticsData.questionAnalytics.map((entry, index) => {
                              let color = "hsl(var(--chart-1))";
                              if (parseFloat(entry.averagePercentage) < 60) {
                                color = "hsl(var(--destructive))";
                              } else if (parseFloat(entry.averagePercentage) < 80) {
                                color = "hsl(var(--yellow))";
                              }
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Question Analytics Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Question Difficulty Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of question performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead className="text-right">Avg Score</TableHead>
                          <TableHead className="text-right">Max Score</TableHead>
                          <TableHead className="text-right">Avg %</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                          <TableHead className="text-right">Difficulty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.questionAnalytics.map((question, index) => (
                          <TableRow key={index}>
                            <TableCell className="max-w-md">
                              <div className="truncate" title={question.fullQuestion}>
                                {question.question}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{question.averageScore}</TableCell>
                            <TableCell className="text-right">{question.maxScore}</TableCell>
                            <TableCell className="text-right">{question.averagePercentage}%</TableCell>
                            <TableCell className="text-right">{question.totalStudents}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={
                                question.difficulty === 'Easy' ? 'default' : 
                                question.difficulty === 'Medium' ? 'secondary' : 
                                'destructive'
                              }>
                                {question.difficulty}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student Performance Table</CardTitle>
                    <CardDescription>Complete overview of all graded submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Max Score</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.scores.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-right">{student.score.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{selectedExamData!.overall_score}</TableCell>
                            <TableCell className="text-right">{student.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grading;
