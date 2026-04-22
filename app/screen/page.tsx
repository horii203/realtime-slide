"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

const SLIDE_DURATION = 5000;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ScreenPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const photosRef = useRef<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const currentUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  function getNext(): string {
    if (queueRef.current.length > 0) {
      return queueRef.current.shift()!;
    }
    const shuffled = shuffle(photosRef.current).filter(
      (url) => url !== currentUrlRef.current,
    );
    queueRef.current = shuffled;
    return queueRef.current.shift() ?? currentUrlRef.current!;
  }

  function showNext() {
    const next = getNext();

    // 次が現在と同じ URL（写真が1枚のみ等）の場合はフェードせず再スケジュールのみ
    if (next === currentUrlRef.current) {
      timerRef.current = setTimeout(showNext, SLIDE_DURATION);
      return;
    }

    currentUrlRef.current = next;
    setVisible(false);
    setTimeout(() => {
      setCurrentUrl(next);
      // setVisible(true) は onLoad で呼ぶ（読み込み完了後にフェードイン）
    }, 500);

    timerRef.current = setTimeout(showNext, SLIDE_DURATION);
  }

  function start() {
    if (runningRef.current) return;
    runningRef.current = true;
    showNext();
  }

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then(({ urls }: { urls: string[] }) => {
        if (urls.length > 0) {
          photosRef.current = urls;
          queueRef.current = shuffle(urls);
          start();
        }
      });
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("wedding");
    channel.bind("new-photo", (data: { url: string }) => {
      photosRef.current = [...photosRef.current, data.url];
      queueRef.current.unshift(data.url);
      if (!runningRef.current) start();
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
        key={currentUrl}
        src={currentUrl}
        alt="wedding photo"
        className="max-h-screen max-w-full object-contain transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
        onLoad={() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
          });
        }}
      />
    </main>
  );
}
