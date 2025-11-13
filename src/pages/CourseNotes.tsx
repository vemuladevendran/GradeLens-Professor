import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Upload, Download, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error(`File size exceeds 50MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ""; // Reset file input
      return;
    }

    // Some browsers mark PDFs as application/octet-stream; verify by magic header
    const verifyPdfHeader = async () => {
      if (file.type === 'application/pdf') return true;
      try {
        const header = await file.slice(0, 5).text();
        return header.startsWith('%PDF-');
      } catch (err) {
        console.warn('Unable to read file header for type verification', err);
        return false;
      }
    };

    (async () => {
      const isPdf = await verifyPdfHeader();
      if (!isPdf) {
        toast.error(`Only PDF files are supported. Selected file type: ${file.type || 'unknown'}`);
        e.target.value = ""; // Reset file input
        return;
      }

      console.log("File selected:", {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        type: file.type || 'detected by header'
      });

      setSelectedFile(file);
    })();
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
    setUploadProgress(0);

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("note_name", noteName);
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();

      // Debug ready state changes
      xhr.addEventListener("readystatechange", () => {
        console.log("XHR state:", xhr.readyState, "status:", xhr.status);
      });

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success("Note uploaded successfully");
          
          // Refresh the notes list
          await fetchNotes();
          
          // Reset form
          setNoteName("");
          setSelectedFile(null);
          setUploadProgress(0);
          setIsDialogOpen(false);
          setIsUploading(false);
          resolve(xhr.response);
        } else {
          let errorMessage = "Failed to upload note";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = xhr.statusText || errorMessage;
          }
          
          console.error("Upload failed:", {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
          
          toast.error(`${errorMessage} (Status: ${xhr.status})`);
          setIsUploading(false);
          setUploadProgress(0);
          reject(new Error(`Upload failed: ${errorMessage}`));
        }
      });

      // Handle errors
      xhr.addEventListener("error", async (e) => {
        console.error("Upload network error:", {
          error: e,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          readyState: xhr.readyState
        });

        // Fallback: try fetch-based upload once
        try {
          toast("Network issue detected. Retrying upload...");
          setUploadProgress(0);
          const token = localStorage.getItem("authToken");
          const uploadUrl = API_ENDPOINTS.uploadNote(course.id.toString());
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              ...(token ? { Authorization: `Token ${token}` } : {}),
              // Let the browser set proper multipart boundary (do not set Content-Type)
            } as any,
            body: formData,
          });

          if (res.ok) {
            toast.success("Note uploaded successfully");
            await fetchNotes();
            setNoteName("");
            setSelectedFile(null);
            setUploadProgress(0);
            setIsDialogOpen(false);
            setIsUploading(false);
            const text = await res.text();
            return resolve(text);
          } else {
            let msg = `Upload failed (Status: ${res.status})`;
            try {
              const data = await res.json();
              msg = data.message || data.error || msg;
            } catch {}
            console.error("Fallback upload failed:", res.status, await res.text().catch(() => ""));
            toast.error(msg);
            setIsUploading(false);
            setUploadProgress(0);
            return reject(new Error(msg));
          }
        } catch (fallbackErr) {
          console.error("Fallback upload error:", fallbackErr);
          toast.error("Network error occurred during upload. Please try again.");
          setIsUploading(false);
          setUploadProgress(0);
          return reject(new Error(`Upload failed: ${xhr.statusText || 'Network error'}`));
        }
      });

      // Handle abort
      xhr.addEventListener("abort", () => {
        console.error("Upload aborted");
        toast.error("Upload was cancelled");
        setIsUploading(false);
        setUploadProgress(0);
        reject(new Error("Upload aborted"));
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        console.error("Upload timeout");
        toast.error("Upload timed out. The file may be too large or connection too slow.");
        setIsUploading(false);
        setUploadProgress(0);
        reject(new Error("Upload timeout"));
      });

      // Set up request
      const token = localStorage.getItem("authToken");
      const uploadUrl = API_ENDPOINTS.uploadNote(course.id.toString());
      
      console.log("Starting upload:", {
        url: uploadUrl,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`,
        fileType: selectedFile.type
      });
      
      xhr.open("POST", uploadUrl);
      xhr.timeout = 300000; // 5 minutes timeout
      
      if (token) {
        xhr.setRequestHeader("Authorization", `Token ${token}`);
      }
      // Note: Don't set Content-Type header, browser will set it with boundary for FormData

      // Send request
      try {
        xhr.send(formData);
      } catch (error) {
        console.error("Error sending request:", error);
        toast.error("Failed to initiate upload. Please try again.");
        setIsUploading(false);
        setUploadProgress(0);
        reject(error);
      }
    });
  };

  const handleDeleteNote = async (noteId: number, noteName: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.deleteNote(noteId.toString()), {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      const data = await response.json();
      toast.success(data.message || `${noteName} deleted successfully`);
      
      // Refresh the notes list
      await fetchNotes();
    } catch (error) {
      console.error("Delete note error:", error);
      toast.error("Failed to delete note");
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
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
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
                  <div className="flex gap-2 mb-2">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Note
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{note.note_name}"? This action cannot be undone and will remove all associated chunks.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNote(note.id, note.note_name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
