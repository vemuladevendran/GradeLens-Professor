import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Upload, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "@/config/api";

interface Note {
  id: number;
  note_name: string;
  file: string;
  uploaded_at: string;
}

const CourseNotes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noteName, setNoteName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (course) {
      fetchNotes();
    }
  }, [course]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.getNotes(course.id.toString()), {
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Fetch notes error:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadNote = async () => {
    if (!noteName.trim()) {
      toast.error("Please enter a note name");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("note_name", noteName);
      formData.append("file", selectedFile);

      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.uploadNote(course.id.toString()), {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload note");
      }

      const data = await response.json();
      toast.success("Note uploaded successfully");
      
      // Refresh the notes list
      await fetchNotes();
      
      // Reset form
      setNoteName("");
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Upload note error:", error);
      toast.error("Failed to upload note");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/course/${course.id}`, { state: { course } })} className="mb-4">
            ← Back to Course
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Course Notes</h1>
              <p className="text-muted-foreground">{course.course_name}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Note</DialogTitle>
                  <DialogDescription>
                    Add course materials, lecture notes, or resources
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="noteName">Note Name</Label>
                    <Input
                      id="noteName"
                      placeholder="e.g., Lecture 1 - Introduction"
                      value={noteName}
                      onChange={(e) => setNoteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Label htmlFor="file" className="cursor-pointer">
                        <span className="text-sm text-primary hover:underline">
                          {selectedFile ? selectedFile.name : "Click to select file"}
                        </span>
                        <Input
                          id="file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDFs, DOCs, TXTs, PPTs supported
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadNote} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Note"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-10 w-10 bg-muted rounded-lg animate-pulse mb-2" />
                  <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your first course note to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{note.note_name}</CardTitle>
                  <CardDescription>
                    Uploaded {new Date(note.uploaded_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`${API_BASE_URL}${note.file}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE_URL}${note.file}`;
                        link.download = note.note_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseNotes;
