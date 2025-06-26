import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocumentUpload } from "@/components/document-upload";
import { AIPrompt, type AnalysisSettings } from "@/components/ai-prompt";
import { DocumentPreview } from "@/components/document-preview";
import { ResultsSection } from "@/components/results-section";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocument, getDocuments } from "@/lib/api";

interface Document {
  id: number;
  title: string;
  originalText: string;
  processedText?: string;
  fileType: string;
  createdAt: string;
}

interface DebateCard {
  title: string;
  content: string;
  relevanceScore: string;
  category: string;
}

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<{
    cards: DebateCard[];
    summary: string;
    processedText: string;
  } | null>(null);
  const { toast } = useToast();

  const { data: documents } = useQuery({
    queryKey: ['/api/documents'],
    enabled: false, // Only fetch when needed
  });

  const handleDocumentUpload = (document: Document) => {
    setCurrentDocument(document);
    setAnalysisResults(null);
    toast({
      title: "Document uploaded",
      description: `${document.title} is ready for analysis.`,
    });
  };

  const handleAnalyze = async (prompt: string, settings: AnalysisSettings) => {
    if (!currentDocument) {
      toast({
        title: "No document",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setAnalysisResults(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await analyzeDocument(currentDocument.id, {
        prompt,
        settings,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      setAnalysisResults({
        cards: result.cards || [],
        summary: result.summary || "",
        processedText: result.processedText || "",
      });

      // Update current document with processed text
      setCurrentDocument(prev => prev ? {
        ...prev,
        processedText: result.processedText || prev.originalText
      } : null);

      toast({
        title: "Analysis complete",
        description: `Generated ${result.cards?.length || 0} debate cards.`,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Document Upload & AI Prompt */}
          <div className="space-y-6">
            <DocumentUpload onUploadSuccess={handleDocumentUpload} />
            
            <AIPrompt 
              onAnalyze={handleAnalyze}
              isProcessing={isProcessing}
              disabled={!currentDocument}
            />

            {/* Processing Status */}
            {isProcessing && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <div>
                      <p className="font-medium text-slate-900">Processing Document...</p>
                      <p className="text-sm text-slate-500">AI is analyzing your document and applying highlights</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">
                      Step {Math.floor(processingProgress / 33) + 1} of 3: 
                      {processingProgress < 33 ? " Parsing document..." : 
                       processingProgress < 66 ? " Applying AI analysis..." : 
                       " Generating debate cards..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: Document Preview */}
          <div className="space-y-6">
            <DocumentPreview 
              content={analysisResults?.processedText || currentDocument?.originalText || ""}
              title={currentDocument?.title}
            />
          </div>
        </div>

        {/* Results Section */}
        <ResultsSection 
          cards={analysisResults?.cards || []}
          summary={analysisResults?.summary}
          isVisible={!!analysisResults}
        />

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Analyses</h3>
              <div className="space-y-3">
                {currentDocument ? (
                  <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-blue-600 w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{currentDocument.title}</p>
                      <p className="text-slate-500 text-xs">
                        {analysisResults ? `${analysisResults.cards.length} cards generated` : "Ready for analysis"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Session Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Documents Processed</span>
                  <span className="font-semibold text-slate-900">{currentDocument ? 1 : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Cards Generated</span>
                  <span className="font-semibold text-slate-900">{analysisResults?.cards.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Analysis Status</span>
                  <span className="font-semibold text-emerald-600">
                    {isProcessing ? "Processing..." : analysisResults ? "Complete" : "Ready"}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-slate-600">
                      AI-powered analysis ready
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
