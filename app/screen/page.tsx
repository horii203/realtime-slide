"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

const SLIDE_DURATION = 5000;

export default function ScreenPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef<string[]>([]);
  const photosRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNext(allPhotos: string[]) {
    const next =
      queueRef.current.length > 0
        ? queueRef.current.shift()!
        : allPhotos[Math.floor(Math.random() * allPhotos.length)];

    setVisible(false);
    setTimeout(() => {
      setCurrentUrl(next);
      setVisible(true);
    }, 500);

    timerRef.current = setTimeout(() => showNext(photosRef.current), SLIDE_DURATION);
  }

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then(({ urls }: { urls: string[] }) => {
        if (urls.length > 0) {
          setPhotos(urls);
          photosRef.current = urls;
        }
      });
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("wedding");
    channel.bind("new-photo", (data: { url: string }) => {
      setPhotos((prev) => {
        const next = [...prev, data.url];
        photosRef.current = next;
        return next;
      });
      queueRef.current.push(data.url);
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    photosRef.current = photos;
    if (photos.length > 0 && !currentUrl) {
      showNext(photos);
    }
  }, [photos]);

  if (!currentUrl) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white text-2xl">写真が届くのを待っています...</p>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <img
        src={currentUrl}
        alt="wedding photo"
        className="max-h-screen max-w-full object-contain transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      />
    </main>
  );
}
