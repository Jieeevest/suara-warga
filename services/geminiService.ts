import { GoogleGenAI } from "@google/genai";
import { Candidate, AnalyticsData } from "../types";

// Initialize AI client lazily to avoid errors before env vars are available
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found in environment variables");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateElectionAnalysis = async (
  analytics: AnalyticsData,
  candidates: Candidate[],
): Promise<string> => {
  try {
    const candidatesData = candidates
      .map((c) => `Kandidat No ${c.number} (${c.name}): ${c.voteCount} suara`)
      .join(", ");

    const prompt = `
      Bertindaklah sebagai analis politik untuk pemilihan tingkat RT/RW lokal.
      
      Data Pemilihan Saat Ini:
      - Total Pemilih Terdaftar: ${analytics.totalResidents}
      - Total Suara Masuk: ${analytics.totalVotes}
      - Persentase Partisipasi: ${analytics.turnoutPercentage.toFixed(2)}%
      - Kehadiran Fisik: ${analytics.presentCount} orang
      - Perolehan Suara: ${candidatesData}

      Berikan analisis singkat (maksimal 2 paragraf) dalam Bahasa Indonesia yang profesional dan netral mengenai:
      1. Tingkat partisipasi warga.
      2. Siapa yang memimpin saat ini dan seberapa signifikan jaraknya.
      3. Saran singkat untuk panitia jika partisipasi masih rendah (di bawah 70%).
    `;

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text || "Tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI.";
  }
};
