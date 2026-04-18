import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const result = await cloudinary.search
    .expression("folder:wedding")
    .sort_by("created_at", "desc")
    .max_results(100)
    .execute();

  const urls = result.resources.map((r: { secure_url: string }) => r.secure_url);

  return NextResponse.json({ urls });
}
