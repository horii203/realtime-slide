"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Camera, Heart } from "lucide-react";

const EMOJIS = ["❤️", "🎉", "👏", "😊", "👍"];

const HELP_STEPS = [
  { step: 1, text: "「写真を選ぶ」ボタンでスマホから写真を選んでください" },
  {
    step: 2,
    text: "確認後「送信する」を押すと、会場内のスクリーンに表示されます",
  },
  { step: 3, text: "「リアクションを送る」から絵文字をスクリーンに流せます" },
];

function useModal(initialOpen = false) {
  const [show, setShow] = useState(initialOpen);
  const [closing, setClosing] = useState(false);

  function open() {
    setShow(true);
  }
  function close() {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setClosing(false);
    }, 200);
  }

  return { show, closing, open, close };
}

export default function UploadPage() {
  type UploadModal =
    | { phase: "confirm"; file: File; previewUrl: string }
    | { phase: "uploading"; previewUrl: string }
    | { phase: "done"; previewUrl: string }
    | { phase: "error"; previewUrl: string }
    | null;
  const [uploadModal, setUploadModal] = useState<UploadModal>(null);
  const [displayedPhoto, setDisplayedPhoto] = useState<string | null>(null);
  const [photoVisible, setPhotoVisible] = useState(false);

  const help = useModal(true);
  const reaction = useModal();

  const photosRef = useRef<string[]>([]);
  const photoIndexRef = useRef(0);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updatePhoto(url: string) {
    setPhotoVisible(false);
    setTimeout(() => {
      setDisplayedPhoto(url);
      setPhotoVisible(true);
    }, 300);
  }

  useEffect(() => {
    function scheduleSlide() {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      slideTimerRef.current = setTimeout(() => {
        const photos = photosRef.current;
        if (photos.length <= 1) {
          scheduleSlide();
          return;
        }
        photoIndexRef.current = (photoIndexRef.current + 1) % photos.length;
        updatePhoto(photos[photoIndexRef.current]);
        scheduleSlide();
      }, 5000);
    }

    fetch("/api/photos")
      .then((res) => res.json())
      .then(({ urls }: { urls: string[] }) => {
        if (urls.length === 0) return;
        photosRef.current = urls;
        photoIndexRef.current = 0;
        updatePhoto(urls[0]);
        scheduleSlide();
      });

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("wedding");

    channel.bind("now-showing", (data: { url: string }) => {
      const idx = photosRef.current.indexOf(data.url);
      if (idx !== -1) photoIndexRef.current = idx;
      updatePhoto(data.url);
      scheduleSlide();
    });

    channel.bind("new-photo", (data: { url: string }) => {
      if (!photosRef.current.includes(data.url)) {
        photosRef.current = [...photosRef.current, data.url];
      }
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, []);

  async function sendReaction(emoji: string) {
    await fetch("/api/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadModal({
      phase: "confirm",
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }

  async function confirmUpload() {
    if (uploadModal?.phase !== "confirm") return;
    const { file, previewUrl } = uploadModal;
    setUploadModal({ phase: "uploading", previewUrl });

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploadModal({ phase: res.ok ? "done" : "error", previewUrl });
  }

  function closeUploadModal() {
    if (uploadModal) URL.revokeObjectURL(uploadModal.previewUrl);
    setUploadModal(null);
  }

  const overlayClass = (closing: boolean) =>
    `${closing ? "animate-fade-out" : "animate-fade-in"} fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6`;

  return (
    <main className="relative min-h-svh flex items-center justify-center overflow-hidden bg-background">
      {/* 装飾フレーム */}
      <div className="absolute inset-4 border border-primary/20 pointer-events-none" />
      <div className="absolute inset-6 border border-primary/10 pointer-events-none" />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl tracking-widest text-foreground">
            写真をシェアしよう
          </h1>
          <p className="text-muted-foreground leading-relaxed text-base max-w-sm">
            写真をアップロードすると、
            <br />
            スクリーンに表示されます。
          </p>
        </div>

        {/* 写真を選ぶ */}
        <label className="group relative cursor-pointer mt-4 w-56 block">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="relative overflow-hidden w-full py-4 text-center bg-primary/90 hover:bg-primary transition-colors duration-300 rounded-sm">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative text-primary-foreground tracking-widest text-base flex items-center justify-center gap-2">
              <Camera size={18} strokeWidth={1.5} />
              写真を選ぶ
            </span>
          </div>
        </label>

        {/* リアクションボタン */}
        <button
          onClick={reaction.open}
          className="group relative overflow-hidden w-56 py-4 bg-primary/90 hover:bg-primary transition-colors duration-300 rounded-sm"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <span className="relative text-primary-foreground tracking-widest text-base flex items-center justify-center gap-2">
            <Heart size={18} strokeWidth={1.5} />
            リアクションを送る
          </span>
        </button>

        {/* デコレーションライン */}
        <div className="flex items-center gap-4 mt-4">
          <div className="w-12 h-px bg-primary/30" />
          <div className="w-1.5 h-1.5 rotate-45 bg-primary/50" />
          <div className="w-12 h-px bg-primary/30" />
        </div>

        {/* 使い方ボタン */}
        <button
          onClick={help.open}
          className="px-5 py-2 border border-primary/30 text-muted-foreground text-base tracking-widest hover:border-primary/60 hover:text-foreground transition-colors mt-2"
        >
          使い方
        </button>
      </div>

      {/* リアクションモーダル */}
      {reaction.show && (
        <div className={overlayClass(reaction.closing)} onClick={reaction.close}>
          <div className="relative bg-background w-full max-w-sm flex flex-col items-center gap-6 py-10 px-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={reaction.close}
              className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground transition-colors text-xl leading-none"
            >
              ×
            </button>
            <div className="w-full flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-xs tracking-widest">
                会場スクリーンの表示
              </p>
              <div className="w-full h-60">
                {displayedPhoto && (
                  <img
                    src={displayedPhoto}
                    alt="現在のスクリーン"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ opacity: photoVisible ? 1 : 0 }}
                  />
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm tracking-widest text-center">
              タップした絵文字が
              <br />
              スクリーン上に流れます
            </p>
            <div className="flex gap-6">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="text-3xl hover:scale-125 active:scale-95 transition-transform duration-150"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 使い方モーダル */}
      {help.show && (
        <div className={overlayClass(help.closing)} onClick={help.close}>
          <div className="bg-background w-full max-w-sm flex flex-col items-center gap-6 p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="tracking-widest text-foreground text-base">
              使い方
            </h2>
            <ul className="flex flex-col gap-4 w-full">
              {HELP_STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5"
                    style={{ backgroundColor: "#8c7b5a", color: "#f5ecd7" }}
                  >
                    {step.step}
                  </span>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {step.text}
                  </p>
                </li>
              ))}
            </ul>
            <button
              onClick={help.close}
              className="w-full py-3 bg-primary/90 hover:bg-primary text-primary-foreground text-base tracking-widest transition-colors"
            >
              はじめる
            </button>
          </div>
        </div>
      )}

      {/* アップロードモーダル */}
      {uploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          onClick={uploadModal.phase !== "uploading" ? closeUploadModal : undefined}
        >
          <div className="bg-background w-full max-w-sm flex flex-col items-center gap-6 p-6" onClick={(e) => e.stopPropagation()}>
            <img
              src={uploadModal.previewUrl}
              alt="preview"
              className="w-full max-h-64 object-contain"
            />
            {uploadModal.phase === "confirm" && (
              <>
                <p className="tracking-widest text-base text-foreground">
                  この写真をアップロードしますか？
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={closeUploadModal}
                    className="flex-1 py-3 border border-primary/40 text-muted-foreground text-base tracking-widest hover:bg-primary/5 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={confirmUpload}
                    className="flex-1 py-3 bg-primary/90 hover:bg-primary text-primary-foreground text-base tracking-widest transition-colors"
                  >
                    送信する
                  </button>
                </div>
              </>
            )}
            {uploadModal.phase === "uploading" && (
              <p className="text-muted-foreground animate-pulse tracking-wider text-base">
                アップロード中...
              </p>
            )}
            {uploadModal.phase === "done" && (
              <>
                <p className="text-foreground tracking-wider text-base">
                  送信しました
                </p>
                <button
                  onClick={closeUploadModal}
                  className="w-full py-3 border border-primary/30 text-muted-foreground text-base tracking-widest hover:border-primary/60 hover:text-foreground transition-colors"
                >
                  閉じる
                </button>
              </>
            )}
            {uploadModal.phase === "error" && (
              <>
                <p className="text-red-500 text-base">エラーが発生しました</p>
                <button
                  onClick={closeUploadModal}
                  className="w-full py-3 border border-primary/30 text-muted-foreground text-base tracking-widest hover:border-primary/60 hover:text-foreground transition-colors"
                >
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
