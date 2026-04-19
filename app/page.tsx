import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-black">
      <h1 className="text-white text-3xl font-bold">
        リアルタイムスライドショー
      </h1>
      <div className="flex flex-col gap-4 w-64">
        <Link
          href="/upload"
          className="flex items-center justify-center h-14 rounded-full bg-pink-500 text-white text-lg font-semibold"
        >
          写真をアップロード
        </Link>
        <Link
          href="/screen"
          className="flex items-center justify-center h-14 rounded-full bg-zinc-700 text-white text-lg font-semibold"
        >
          スクリーン表示
        </Link>
      </div>
    </main>
  );
}
