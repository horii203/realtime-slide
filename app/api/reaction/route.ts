import Pusher from "pusher";
import { NextRequest, NextResponse } from "next/server";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { emoji } = await req.json();
  if (!emoji) {
    return NextResponse.json({ error: "emoji required" }, { status: 400 });
  }

  await pusher.trigger("wedding", "reaction", { emoji });
  return NextResponse.json({ ok: true });
}
