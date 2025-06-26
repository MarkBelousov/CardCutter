import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DocumentPreviewProps {
  content: string;
  title?: string;
}

export function DocumentPreview({ content, title }: DocumentPreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h3 className="font-semibold text-slate-900">Document Preview</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">100%</span>
          <Button variant="ghost" size="sm" title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="h-96 overflow-y-auto">
        {content ? (
          <div className="debate-card">
            {title && (
              <h4 className="text-lg font-semibold text-slate-900 mb-4">{title}</h4>
            )}
            <div 
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No document uploaded</p>
              <p className="text-sm">Upload a document to see the preview here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
