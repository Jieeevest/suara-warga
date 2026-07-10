import { ok, requireAdmin } from "@/lib/api";
import { listVotingSessions } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  return ok({ sessions: listVotingSessions() });
}
