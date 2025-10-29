export const API_BASE_URL = "https://5k8sc5cn-8000.usw3.devtunnels.ms";

export const API_ENDPOINTS = {
  professors: `${API_BASE_URL}/api/professors/`,
  login: `${API_BASE_URL}/api/login/`,
  createCourse: `${API_BASE_URL}/api/create-course/`,
  getCourses: `${API_BASE_URL}/api/get-courses/`,
  createExam: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/create-exam/`,
  getExams: (courseId: string) => `${API_BASE_URL}/api/courses/${courseId}/exams/`,
  updateExam: (courseId: string, examId: string) => `${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
  };
};
