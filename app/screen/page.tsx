"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function ScreenPage() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("wedding");
    channel.bind("new-photo", (data: { url: string }) => {
      setPhotos((prev) => [...prev, data.url]);
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  if (photos.length === 0) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white text-2xl">写真が届くのを待っています...</p>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black">
      <img
        src={photos[photos.length - 1]}
        alt="wedding photo"
        className="max-h-screen max-w-screen object-contain"
      />
    </main>
  );
}
