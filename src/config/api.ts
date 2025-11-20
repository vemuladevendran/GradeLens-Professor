export const API_BASE_URL = "https://5k8sc5cn-8000.usw3.devtunnels.ms/";
// export const API_BASE_URL = "http://127.0.0.1:8000/";

export const API_ENDPOINTS = {
  professors: `${API_BASE_URL}/api/professors/`,
  login: `${API_BASE_URL}/api/login/`,
  createCourse: `${API_BASE_URL}/api/create-course/`,
  getCourses: `${API_BASE_URL}/api/get-courses/`,
  createExam: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/create-exam/`,
  getExams: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/exams/`,
  updateExam: (courseId: string, examId: string) => `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/edit/`,
  deleteExam: (courseId: string, examId: string) => `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/delete/`,
  getAllExams: `${API_BASE_URL}/api/professor/exams/`,
  getExamSubmissions: (examId: string) => `${API_BASE_URL}/api/professor/exams/${examId}/submissions/`,
  uploadNote: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/upload-note/`,
  getNotes: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/notes/`,
  deleteNote: (noteId: string) => `${API_BASE_URL}/api/notes/${noteId}/delete/`,
  autoGrade: (courseId: string, examId: string, studentId: string) =>
    `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/students/${studentId}/grade/`,
  saveGrades: (courseId: string, examId: string, studentId: string) =>
    `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/students/${studentId}/save-grades/`,
  updateGrades: (courseId: string, examId: string, studentId: string) =>
    `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/students/${studentId}/update-grades/`,
  deleteCourse: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/delete-course/`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
  };
};
