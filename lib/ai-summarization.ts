// AI Call Summarization using Azure OpenAI
// Automatically generates summaries and tags for calls

import { AzureOpenAI } from 'openai';

// Initialize Azure OpenAI client
function getAzureClient() {
  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-08-01-preview',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini'
  });
}

// Generate call summary from transcript
export async function generateCallSummary(transcript: {
  speaker: string;
  text: string;
  timestamp?: string;
}[]): Promise<{
  summary: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyPoints: string[];
}> {
  try {
    const client = getAzureClient();

    // Format transcript for AI
    const formattedTranscript = transcript
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const systemPrompt = `Du bist ein AI-Assistent, der Anruf-Transkripte analysiert und zusammenfasst.

Deine Aufgabe:
1. Erstelle eine prägnante Zusammenfassung (2-3 Sätze) auf Deutsch
2. Identifiziere 3-5 relevante Tags/Themen
3. Bewerte die Stimmung des Anrufs (positiv/neutral/negativ)
4. Liste 2-4 Kernpunkte auf

Antworte im JSON-Format:
{
  "summary": "Kurze Zusammenfassung hier...",
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive|neutral|negative",
  "keyPoints": ["Punkt 1", "Punkt 2"]
}`;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analysiere dieses Anruf-Transkript:\n\n${formattedTranscript}` }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || 'Keine Zusammenfassung verfügbar',
      tags: result.tags || [],
      sentiment: result.sentiment || 'neutral',
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    console.error('Error generating call summary:', error);
    return {
      summary: 'Zusammenfassung konnte nicht erstellt werden',
      tags: [],
      sentiment: 'neutral',
      keyPoints: []
    };
  }
}

// Generate tags from transcript (faster, cheaper alternative)
export async function generateCallTags(transcript: {
  speaker: string;
  text: string;
}[]): Promise<string[]> {
  try {
    const client = getAzureClient();

    const formattedTranscript = transcript
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Generiere 3-5 relevante Tags (auf Deutsch) für dieses Anruf-Transkript. Antwort nur mit JSON array: ["tag1", "tag2", "tag3"]'
        },
        { role: 'user', content: formattedTranscript }
      ],
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tags":[]}');
    return result.tags || [];
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

// Analyze call sentiment
export async function analyzeCallSentiment(transcript: {
  speaker: string;
  text: string;
}[]): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  reason: string;
}> {
  try {
    const client = getAzureClient();

    const formattedTranscript = transcript
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Analysiere die Stimmung dieses Anrufs. Antworte im JSON-Format:
{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.0-1.0,
  "reason": "Kurze Begründung auf Deutsch"
}`
        },
        { role: 'user', content: formattedTranscript }
      ],
      temperature: 0.2,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      sentiment: result.sentiment || 'neutral',
      confidence: result.confidence || 0.5,
      reason: result.reason || 'Keine Analyse verfügbar'
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.0,
      reason: 'Fehler bei der Analyse'
    };
  }
}

// Quick summary for dashboard (one-liner)
export async function generateQuickSummary(transcript: {
  speaker: string;
  text: string;
}[]): Promise<string> {
  try {
    const client = getAzureClient();

    const formattedTranscript = transcript
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n')
      .substring(0, 1000); // Limit to first 1000 chars for speed

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Fasse diesen Anruf in EINEM kurzen Satz auf Deutsch zusammen (max 15 Wörter).'
        },
        { role: 'user', content: formattedTranscript }
      ],
      temperature: 0.3,
      max_tokens: 50
    });

    return response.choices[0].message.content?.trim() || 'Anruf-Zusammenfassung nicht verfügbar';
  } catch (error) {
    console.error('Error generating quick summary:', error);
    return 'Zusammenfassung nicht verfügbar';
  }
}

// Extract action items from call
export async function extractActionItems(transcript: {
  speaker: string;
  text: string;
}[]): Promise<string[]> {
  try {
    const client = getAzureClient();

    const formattedTranscript = transcript
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Extrahiere alle To-Do-Punkte und Handlungsaufforderungen aus diesem Anruf. Antwort als JSON array auf Deutsch: {"actions":["Aktion 1", "Aktion 2"]}'
        },
        { role: 'user', content: formattedTranscript }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"actions":[]}');
    return result.actions || [];
  } catch (error) {
    console.error('Error extracting action items:', error);
    return [];
  }
}
