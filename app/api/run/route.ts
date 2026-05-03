import { NextRequest, NextResponse } from "next/server";
import ts from "typescript";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (typeof code !== "string") {
    return NextResponse.json(
      { error: "code must be a string" },
      { status: 400 },
    );
  }

  try {
    const result = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.None },
    });
    return NextResponse.json({ js: result.outputText });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 422 },
    );
  }
}
