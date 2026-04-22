import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.search
      .expression("folder:wedding")
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    const urls = result.resources.map((r: { secure_url: string }) => r.secure_url);
    return NextResponse.json({ urls });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
