# 🧠 GradeLens – Professor Portal  
### AI-Powered Auto-Grading & Rubric Feedback System  
*Frontend built with React.js*

GradeLens is an AI-powered grading platform designed to help professors evaluate student submissions faster, more consistently, and with rubric-based feedback.  
This portal provides course management, assignment uploads, auto-grading using LLM + RAG, and detailed feedback visualization.

---

## 🚀 Features

### ✅ **Professor Dashboard**
- Overview of all courses, assignments, and grading progress  
- Stats for pending, completed, and in-progress submissions  
- Clean and intuitive UI for seamless navigation  

### 📚 **Course & Assignment Management**
- Create, edit, and delete courses  
- Add assignments with descriptions and rubrics  
- Upload sample/reference solutions used by backend RAG  
- Track assignment states (active, closed, graded)

### 📤 **Upload Student Submissions**
- Support for text and PDF uploads  
- Bulk upload for multiple student files  
- Automatic preprocessing & cleaning of submissions

### 🤖 **AI-Powered Auto-Grading (LLM + RAG)**
When grading is initiated:
- Student answer is embedded and stored  
- Relevant context is retrieved from vector DB (pgvector)  
- LLM evaluates using:
  - Rubric criteria  
  - Reference solution  
  - PiScore scoring mechanism  
- Generates rubric-based scores, strengths, and feedback  

### 📝 **Detailed Feedback Viewer**
- Point-wise rubric scoring  
- Strengths and improvement suggestions  
- Similarity scoring vs. reference answer  
- Allows manual override/adjustment of grades

### 📊 **Analytics & Insights**
- Score distribution charts  
- Topic and rubric-level performance  
- Class average and individual breakdown  
- Export analytics as CSV/PDF

### 🔐 **Authentication & Security**
- JWT-based login system  
- Protected routes using React Router  
- Axios interceptors for secure API calls

### 🎨 **Modern UI/UX**
- Responsive dashboard layout  
- Reusable, modular React components  
- Toast notifications, loading states, progress bars  
- Optimized for desktop and tablet use  

---

## 🛠️ Tech Stack (Frontend – React.js)

### **Core Framework**
- React.js (v18+)  
- Functional components with Hooks (useState, useEffect, useContext)

### **State Management**
- Zustand (lightweight global store)

### **Routing**
- React Router DOM

### **Networking**
- Axios (with interceptors for JWT)

### **UI & Utilities**
- React Icons  
- Custom CSS & utility classes  
- Optional charting libraries (for analytics)  

### **Build & Tooling**
- Node.js  
- NPM  
- Environment variables via `.env`

---


---

## 🔧 How It Works (High-Level Flow)

### **1. Professor Login**
- Authenticates using JWT  
- Token stored in Zustand state  

### **2. Create Course or Assignment**
- Metadata sent to backend  
- Rubric + reference solution saved  

### **3. Upload Student Submissions**
- Files sent to backend  
- Extracted into clean text for grading  

### **4. Auto-Grading Process**
- Text is chunked and embedded  
- pgvector retrieves relevant solution context  
- LLM evaluates response using:
  - Rubric criteria
  - Similarity scoring
  - PiScore structured evaluation  

### **5. Review & Finalize Grades**
- Professor reviews scores  
- Approves or adjusts grade  
- Analytics automatically update  

---




