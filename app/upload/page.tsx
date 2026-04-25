"use client";

import { useState } from "react";

const EMOJIS = ["❤️", "🎉", "👏", "😊", "👍"];

const HELP_STEPS = [
  { step: 1, text: "「写真を選ぶ」ボタンでスマホから写真を選んでください" },
  {
    step: 2,
    text: "確認後「送信する」を押すと、会場内のスクリーンに表示されます",
  },
  { step: 3, text: "絵文字ボタンでリアクションをスクリーンに流せます" },
];

export default function UploadPage() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const [pending, setPending] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [closingHelp, setClosingHelp] = useState(false);

  function closeHelp() {
    setClosingHelp(true);
    setTimeout(() => {
      setShowHelp(false);
      setClosingHelp(false);
    }, 200);
  }

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
          <p className="text-muted-foreground leading-relaxed text-base max-w-sm">
            写真をアップロードすると、
            <br />
            スクリーンに表示されます。
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
            <span className="relative text-primary-foreground tracking-widest text-base">
              写真を選ぶ
            </span>
          </div>
        </label>

        {/* ステータス */}
        <div className="min-h-5 text-base">
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
          <p className="text-muted-foreground text-base tracking-widest">
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

        {/* 使い方ボタン */}
        <button
          onClick={() => setShowHelp(true)}
          className="px-5 py-2 border border-primary/30 text-muted-foreground text-base tracking-widest hover:border-primary/60 hover:text-foreground transition-colors mt-2"
        >
          使い方
        </button>
      </div>

      {/* 使い方モーダル */}
      {showHelp && (
        <div
          className={`${closingHelp ? "animate-fade-out" : "animate-fade-in"} fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6`}
        >
          <div className="bg-background w-full max-w-sm flex flex-col items-center gap-6 p-8">
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
              onClick={closeHelp}
              className="w-full py-3 bg-primary/90 hover:bg-primary text-primary-foreground text-base tracking-widest transition-colors"
            >
              はじめる
            </button>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-background w-full max-w-sm flex flex-col items-center gap-6 p-6">
            <p className="tracking-widest text-base text-foreground">
              この写真をアップロードしますか？
            </p>
            <img
              src={pending.previewUrl}
              alt="preview"
              className="w-full max-h-64 object-contain"
            />
            <div className="flex gap-4 w-full">
              <button
                onClick={cancelUpload}
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
          </div>
        </div>
      )}
    </main>
  );
}
