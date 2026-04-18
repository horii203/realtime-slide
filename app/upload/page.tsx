"use client";

import { useState } from "react";

export default function UploadPage() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });

    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">写真をシェアしよう</h1>

      <label className="cursor-pointer bg-pink-500 text-white text-lg font-semibold px-8 py-4 rounded-full">
        写真を選ぶ
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {status === "uploading" && (
        <p className="text-gray-500">アップロード中...</p>
      )}
      {status === "done" && <p className="text-green-600">送信しました！</p>}
      {status === "error" && (
        <p className="text-red-500">エラーが発生しました</p>
      )}
    </main>
  );
}
