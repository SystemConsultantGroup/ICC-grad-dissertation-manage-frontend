import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  switch (type) {
    case "bulk_delete":
      return await logBulkDelete(request);
    default:
      return NextResponse.json({ error: "Invalid log type" }, { status: 400 });
  }
}

async function logBulkDelete(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("representative" in body) ||
    typeof body.representative !== "string" ||
    body.representative.length < 3 ||
    !("target" in body) ||
    (body.target !== "students" && body.target !== "professors")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  console.info("Bulk deletion attempt", {
    timestamp: new Date().toISOString(),
    target: body.target,
    representative: body.representative,
  });
  return NextResponse.json({ success: true });
}
