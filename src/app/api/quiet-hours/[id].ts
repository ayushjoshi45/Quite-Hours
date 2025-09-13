import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server actions
);

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  const body = await req.json();
  const { start_time, end_time } = body;
  const { data, error } = await supabase
    .from("quiet_hours")
    .update({ start_time, end_time, email_sent: false })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
  const { data, error } = await supabase
    .from("quiet_hours")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
