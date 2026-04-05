import { AppShell } from "@/features/app-shell";
import { getBootstrapData } from "@/lib/bootstrap";

export async function AppShellPage() {
  const initialData = await getBootstrapData();
  return <AppShell initialData={initialData} />;
}
