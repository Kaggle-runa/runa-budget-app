import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api/http";
import { listProjects } from "@/lib/queries";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  });
}
