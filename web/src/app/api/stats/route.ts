import { loadQAData } from "@/lib/qaData";

export async function GET() {
  const data = loadQAData();
  return Response.json({ count: data.length });
}
