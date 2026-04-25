import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 装飾フレーム */}
      <div className="absolute inset-4 border border-primary/20 pointer-events-none" />
      <div className="absolute inset-6 border border-primary/10 pointer-events-none" />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* タイトル */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl tracking-widest text-foreground">
            リアルタイムスライドショー
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest">
            写真をリアルタイムでスクリーンに映し出します
          </p>
        </div>

        {/* デコレーションライン */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-primary/30" />
          <div className="w-1.5 h-1.5 rotate-45 bg-primary/50" />
          <div className="w-12 h-px bg-primary/30" />
        </div>

        {/* ナビゲーション */}
        <div className="flex flex-col gap-4 w-64">
          <Link
            href="/upload"
            className="group relative overflow-hidden px-10 py-4 bg-primary/90 hover:bg-primary transition-colors duration-300 text-primary-foreground tracking-widest text-sm text-center"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative">写真をアップロード</span>
          </Link>
          <Link
            href="/screen"
            className="px-10 py-4 border border-primary/30 text-muted-foreground tracking-widest text-sm text-center hover:border-primary/60 hover:text-foreground transition-colors duration-300"
          >
            スクリーン表示
          </Link>
        </div>
      </div>
    </main>
  );
}
