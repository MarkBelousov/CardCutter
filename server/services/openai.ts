// @ts-check
// This file runs in a Node.js environment, so 'process' is available globally.

// Using Hugging Face API for text analysis instead of OpenAI
const BART_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const BIGBIRD_API_URL = "https://api-inference.huggingface.co/models/google/bigbird-pegasus-large-bigpatent";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export interface AnalysisSettings {
  boldKeyArguments: boolean;
  highlightStatistics: boolean;
  includeCitations: boolean;
}

export interface ProcessedText {
  content: string;
  cards: Array<{
    title: string;
    content: string;
    relevanceScore: string;
    category: string;
  }>;
  summary: string;
}

async function queryHuggingFaceModel(modelUrl: string, payload: any): Promise<any> {
  const response = await fetch(modelUrl, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeDocumentForDebate(
  text: string,
  prompt: string,
  settings: AnalysisSettings
): Promise<ProcessedText> {
  try {
    // Choose model based on text length
    const modelUrl = text.length > 3500 ? BIGBIRD_API_URL : BART_API_URL;

    // Craft a detailed prompt for the model
    const analysisPrompt = `You are an expert debate assistant. Analyze the following document and extract:
- The main arguments and claims, each with a short explanation.
- Supporting evidence for each argument, including statistics, but only if they are relevant and explained in context.
- For each highlight, provide a brief explanation of its importance.

Document:
${text}

Task: ${prompt}
`;

    // Send to Hugging Face summarization endpoint
    const response = await queryHuggingFaceModel(modelUrl, {
      inputs: analysisPrompt,
      parameters: {
        max_length: 1024,
        min_length: 200,
        do_sample: false
      }
    });

    // Parse the response into structured highlights and explanations
    // For now, just return the summary as content and a single card
    const summaryText = response[0]?.summary_text || "";
    const cards = [
      {
        title: "Key Information",
        content: summaryText,
        relevanceScore: "High",
        category: "Summary"
      }
    ];

    return {
      content: summaryText,
      cards: cards,
      summary: summaryText
    };
  } catch (error) {
    console.error("Hugging Face analysis error:", error);
    throw new Error("Failed to analyze document: " + (error as Error).message);
  }
}

function processTextBasedOnSettings(text: string, settings: AnalysisSettings): string {
  let processed = text;

  if (settings.boldKeyArguments) {
    // Bold words that indicate strong arguments
    processed = processed.replace(/\b(proves|demonstrates|shows|indicates|confirms|establishes|evidence|data|research|study|findings)\b/gi, '<strong>$1</strong>');
  }

  if (settings.highlightStatistics) {
    // Highlight numbers and percentages
    processed = processed.replace(/\b\d+\.?\d*%?\b/g, '<mark>$&</mark>');
  }

  return processed;
}

function extractDebateCards(text: string, prompt: string): Array<{
  title: string;
  content: string;
  relevanceScore: string;
  category: string;
}> {
  // Split text into sentences and create cards from relevant portions
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const cards = [];

  // Look for sentences that might be relevant to the prompt
  const keywords = prompt.toLowerCase().split(' ').filter(word => word.length > 3);
  
  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 50) continue;

    const relevanceScore = keywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    ) ? "High" : "Medium";

    const category = determineCategory(sentence, prompt);

    cards.push({
      title: `Evidence ${i + 1}: ${sentence.substring(0, 50)}...`,
      content: sentence,
      relevanceScore,
      category
    });
  }

  return cards.slice(0, 3); // Return top 3 cards
}

function determineCategory(text: string, prompt: string): string {
  const lower = (text + ' ' + prompt).toLowerCase();
  
  if (lower.includes('economic') || lower.includes('money') || lower.includes('cost') || lower.includes('financial')) {
    return 'Economic Impact';
  } else if (lower.includes('policy') || lower.includes('government') || lower.includes('law') || lower.includes('regulation')) {
    return 'Policy Solutions';
  } else if (lower.includes('study') || lower.includes('research') || lower.includes('data') || lower.includes('statistics')) {
    return 'Statistical Evidence';
  } else {
    return 'General Evidence';
  }
}
