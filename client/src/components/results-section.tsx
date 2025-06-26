import { CheckCircle, Download, Copy, Save, Edit3, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface DebateCard {
  title: string;
  content: string;
  relevanceScore: string;
  category: string;
}

interface ResultsSectionProps {
  cards: DebateCard[];
  summary?: string;
  isVisible: boolean;
}

export function ResultsSection({ cards, summary, isVisible }: ResultsSectionProps) {
  const { toast } = useToast();

  if (!isVisible || cards.length === 0) {
    return null;
  }

  const handleExportPDF = () => {
    toast({
      title: "Export functionality",
      description: "PDF export feature would be implemented here.",
    });
  };

  const handleCopyText = () => {
    const textContent = cards.map(card => 
      `${card.title}\n${card.content.replace(/<[^>]*>/g, '')}\n\n`
    ).join('');
    
    navigator.clipboard.writeText(textContent).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "All debate cards have been copied to your clipboard.",
      });
    });
  };

  const handleSaveCard = () => {
    toast({
      title: "Save functionality",
      description: "Card saving feature would be implemented here.",
    });
  };

  const getRelevanceColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'high':
        return 'bg-accent bg-opacity-20 text-amber-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'economic impact':
        return 'bg-emerald-100 text-emerald-600';
      case 'policy solutions':
        return 'bg-blue-100 text-blue-600';
      case 'statistical evidence':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Generated Debate Cards</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyText}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
            <Button size="sm" onClick={handleSaveCard}>
              <Save className="w-4 h-4 mr-2" />
              Save Cards
            </Button>
          </div>
        </div>

        {summary && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-emerald-800">AI Analysis Summary</p>
                <p className="text-sm text-emerald-700 mt-1">{summary}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {cards.map((card, index) => (
            <Card key={index} className="border border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{card.title}</h4>
                    <p className="text-sm text-slate-500">AI Generated Evidence</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRelevanceColor(card.relevanceScore)}>
                      {card.relevanceScore} Relevance
                    </Badge>
                    {card.category && (
                      <Badge className={getCategoryColor(card.category)}>
                        {card.category}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div 
                  className="debate-card prose prose-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: card.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
