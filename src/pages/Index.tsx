import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ClipboardCheck, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-semibold text-xl">Professor Portal</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Grading Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Grade Smarter, Not Harder
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your grading workflow with AI-powered assessment tools. 
              Manage courses, create assignments, and grade efficiently with RAG technology.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Course Management</h3>
              <p className="text-muted-foreground">
                Organize your courses, assignments, and notes in one intuitive platform.
              </p>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Grading</h3>
              <p className="text-muted-foreground">
                Leverage RAG technology to grade assignments consistently and efficiently.
              </p>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-muted-foreground">
                Track student progress and identify areas for improvement with detailed insights.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>© 2025 Professor Portal. AI-powered grading platform for educators.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
