import { badRequest, ok, requireAdmin } from "@/lib/api";
import { generateElectionAnalysis } from "@/services/geminiService";
import type { AnalyticsData, Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as {
    analytics?: AnalyticsData;
    candidates?: Candidate[];
  };

  if (!body.analytics || !body.candidates) {
    return badRequest("analytics dan candidates wajib diisi.");
  }

  const analysis = await generateElectionAnalysis(body.analytics, body.candidates);
  return ok({ analysis });
}
