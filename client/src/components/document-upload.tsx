import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUploadSuccess: (document: any) => void;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'text'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setUploadMode('file');
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setUploadMode('file');
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      let uploadData;
      
      if (uploadMode === 'file' && uploadedFile) {
        uploadData = {
          title: uploadedFile.name,
          fileType: 'pdf' as const,
          file: uploadedFile,
        };
      } else if (uploadMode === 'url' && googleDocsUrl) {
        uploadData = {
          title: "Google Docs Import",
          fileType: 'google_docs' as const,
          sourceUrl: googleDocsUrl,
        };
      } else if (uploadMode === 'text' && textContent) {
        uploadData = {
          title: "Text Import",
          fileType: 'text' as const,
          text: textContent,
        };
      } else {
        throw new Error("Please provide content to upload");
      }

      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('fileType', uploadData.fileType);
      
      if ('file' in uploadData && uploadData.file) {
        formData.append('file', uploadData.file);
      }
      if ('text' in uploadData && uploadData.text) {
        formData.append('text', uploadData.text);
      }
      if ('sourceUrl' in uploadData && uploadData.sourceUrl) {
        formData.append('sourceUrl', uploadData.sourceUrl);
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const document = await response.json();
      onUploadSuccess(document);
      
      toast({
        title: "Upload successful",
        description: "Document has been uploaded and is ready for analysis.",
      });

      // Reset form
      setUploadedFile(null);
      setGoogleDocsUrl("");
      setTextContent("");

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Import Document</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <FileText className="w-4 h-4 text-red-500" />
            <span>PDF</span>
            <span>•</span>
            <span>Google Docs</span>
            <span>•</span>
            <span>Text</span>
          </div>
        </div>

        {/* Upload mode tabs */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={uploadMode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('file')}
          >
            File Upload
          </Button>
          <Button
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
          >
            Google Docs
          </Button>
          <Button
            variant={uploadMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('text')}
          >
            Paste Text
          </Button>
        </div>

        {uploadMode === 'file' && (
          <>
            {!uploadedFile ? (
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-2">Drop your PDF here or click to browse</p>
                <p className="text-sm text-slate-500 mb-4">Supports PDF files up to 10MB</p>
                <Button>Choose File</Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-800">{uploadedFile.name}</p>
                  <p className="text-sm text-emerald-600">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {uploadMode === 'url' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Input
                  type="url"
                  placeholder="Paste Google Docs link here..."
                  value={googleDocsUrl}
                  onChange={(e) => setGoogleDocsUrl(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Note: Google Docs integration is not yet implemented. Please use the "Paste Text" option instead.
            </p>
          </div>
        )}

        {uploadMode === 'text' && (
          <div className="space-y-4">
            <textarea
              placeholder="Paste your document text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full h-48 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        )}

        {((uploadMode === 'file' && uploadedFile) || 
          (uploadMode === 'url' && googleDocsUrl) || 
          (uploadMode === 'text' && textContent)) && (
          <div className="mt-4">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
