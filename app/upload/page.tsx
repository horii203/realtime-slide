"use client";

import { useState } from "react";

const EMOJIS = ["❤️", "🎉", "👏", "😊", "👍"];

export default function UploadPage() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [pending, setPending] = useState<{ file: File; previewUrl: string } | null>(null);

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
    const previewUrl = URL.createObjectURL(file);
    setPending({ file, previewUrl });
  }

  async function confirmUpload() {
    if (!pending) return;
    setStatus("uploading");
    setPending(null);
    URL.revokeObjectURL(pending.previewUrl);

    const formData = new FormData();
    formData.append("file", pending.file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setStatus(res.ok ? "done" : "error");
  }

  function cancelUpload() {
    if (!pending) return;
    URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 装飾フレーム */}
      <div className="absolute inset-4 border border-primary/20 pointer-events-none" />
      <div className="absolute inset-6 border border-primary/10 pointer-events-none" />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* タイトル */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl tracking-widest text-foreground">
            写真をシェアしよう
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-sm">
            写真をアップロードすると、
            <br />
            リアルタイムでスクリーンに表示されます。
          </p>
        </div>

        {/* シマーボタン */}
        <label className="group relative cursor-pointer mt-4">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="relative overflow-hidden px-10 py-4 bg-primary/90 hover:bg-primary transition-colors duration-300 rounded-sm">
            {/* シマーエフェクト */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative text-primary-foreground tracking-widest text-sm">
              写真を選ぶ
            </span>
          </div>
        </label>

        {/* ステータス */}
        <div className="min-h-5 text-sm">
          {status === "uploading" && (
            <p className="text-muted-foreground animate-pulse tracking-wider">
              アップロード中...
            </p>
          )}
          {status === "done" && (
            <p className="text-foreground tracking-wider">✨ 送信しました</p>
          )}
          {status === "error" && (
            <p className="text-red-500">エラーが発生しました</p>
          )}
        </div>

        {/* リアクション */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <p className="text-muted-foreground text-xs tracking-widest">
            リアクションを送る
          </p>
          <div className="flex gap-5">
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

        {/* デコレーションライン */}
        <div className="flex items-center gap-4 mt-6">
          <div className="w-12 h-px bg-primary/30" />
          <div className="w-1.5 h-1.5 rotate-45 bg-primary/50" />
          <div className="w-12 h-px bg-primary/30" />
        </div>
      </div>

      {/* 確認モーダル */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-background w-full max-w-sm flex flex-col items-center gap-6 p-6">
            <p className="tracking-widest text-sm text-foreground">この写真をアップロードしますか？</p>
            <img
              src={pending.previewUrl}
              alt="preview"
              className="w-full max-h-64 object-contain"
            />
            <div className="flex gap-4 w-full">
              <button
                onClick={cancelUpload}
                className="flex-1 py-3 border border-primary/40 text-muted-foreground text-sm tracking-widest hover:bg-primary/5 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmUpload}
                className="flex-1 py-3 bg-primary/90 hover:bg-primary text-primary-foreground text-sm tracking-widest transition-colors"
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
