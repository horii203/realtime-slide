import Pusher from "pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  await pusher.trigger("wedding", "now-showing", { url });
  return NextResponse.json({ ok: true });
}
