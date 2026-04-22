import { v2 as cloudinary } from "cloudinary";
import Pusher from "pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "wedding",
  });

  const optimizedUrl = result.secure_url.replace("/upload/", "/upload/q_auto:good,f_auto,w_1920/");

  await pusher.trigger("wedding", "new-photo", {
    url: optimizedUrl,
  });

  return NextResponse.json({ url: optimizedUrl });
}
