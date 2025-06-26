import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AIPromptProps {
  onAnalyze: (prompt: string, settings: AnalysisSettings) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export interface AnalysisSettings {
  boldKeyArguments: boolean;
  highlightStatistics: boolean;
  includeCitations: boolean;
}

export function AIPrompt({ onAnalyze, isProcessing, disabled }: AIPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState<AnalysisSettings>({
    boldKeyArguments: true,
    highlightStatistics: true,
    includeCitations: false,
  });

  const quickTemplates = [
    "Economic impacts",
    "Statistical evidence", 
    "Policy recommendations",
    "Expert opinions"
  ];

  const handleTemplateClick = (template: string) => {
    setPrompt(`Find evidence related to ${template.toLowerCase()} that supports arguments about policy effectiveness and implementation challenges.`);
  };

  const handleAnalyze = () => {
    if (prompt.trim()) {
      onAnalyze(prompt, settings);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Wand2 className="text-white w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">AI Analysis Prompt</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2">
              What information are you looking for?
            </Label>
            <Textarea 
              placeholder="Example: Find evidence about the economic impacts of climate change on developing countries, particularly data about GDP losses and policy recommendations..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-24 resize-none"
              disabled={disabled}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateClick(template)}
                  disabled={disabled}
                  className="text-sm"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Analysis Settings:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="boldKeyArguments"
                  checked={settings.boldKeyArguments}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, boldKeyArguments: checked === true }))
                  }
                  disabled={disabled}
                />
                <Label htmlFor="boldKeyArguments" className="text-sm text-slate-600">
                  Bold key arguments
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="highlightStatistics"
                  checked={settings.highlightStatistics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, highlightStatistics: checked === true }))
                  }
                  disabled={disabled}
                />
                <Label htmlFor="highlightStatistics" className="text-sm text-slate-600">
                  Highlight statistics and data
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeCitations"
                  checked={settings.includeCitations}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, includeCitations: checked === true }))
                  }
                  disabled={disabled}
                />
                <Label htmlFor="includeCitations" className="text-sm text-slate-600">
                  Include source citations
                </Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isProcessing || disabled}
            className="w-full bg-primary text-white hover:bg-blue-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isProcessing ? "Analyzing Document..." : "Analyze Document"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
