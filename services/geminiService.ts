import { GoogleGenAI } from "@google/genai";
import { Candidate, AnalyticsData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateElectionAnalysis = async (
  analytics: AnalyticsData,
  candidates: Candidate[]
): Promise<string> => {
  try {
    const candidatesData = candidates.map(c => 
      `Kandidat No ${c.number} (${c.name}): ${c.voteCount} suara`
    ).join(", ");

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI.";
  }
};
