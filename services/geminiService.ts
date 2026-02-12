import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

// Helper to ensure we have a key (though in this environment we assume it's there or user provides it)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const searchYoutubeVideos = async (query: string): Promise<SearchResult[]> => {
  try {
    const ai = getAiClient();
    
    // We use Gemini to "simulate" a YouTube search by leveraging its knowledge base.
    // In a real production app, you would use the YouTube Data API.
    // Here, we ask Gemini to return valid video IDs and metadata for the query.
    
    const prompt = `
      You are a YouTube video search assistant. 
      The user wants to find videos about: "${query}".
      
      Please return a JSON array of 5 popular or relevant YouTube videos matching this query.
      For each video, provide:
      1. youtubeId (The 11-character video ID, e.g., dQw4w9WgXcQ. MUST BE REAL IDs if known, or plausible ones)
      2. title
      3. channelTitle
      4. description (short summary)
      
      Ensure the video IDs are actual YouTube video IDs corresponding to the titles if possible.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              youtubeId: { type: Type.STRING },
              title: { type: Type.STRING },
              channelTitle: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["youtubeId", "title", "channelTitle", "description"],
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const results = JSON.parse(text) as SearchResult[];
    
    // Add thumbnails manually since Gemini doesn't generate image URLs reliably
    return results.map(video => ({
      ...video,
      thumbnail: `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`
    }));

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback or empty on error
    return [];
  }
};
