export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-24 font-sans">
      <h1 className="text-[80px] md:text-[120px] font-black leading-[0.85] tracking-tighter mb-4 opacity-90 uppercase text-center">
        ARENA<span className="text-red-500">.</span>
      </h1>
      <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8 text-center mt-4 border border-zinc-800 px-4 py-2 rounded-full bg-zinc-900/50">
        University E-Sports
      </p>
      <div className="flex items-center gap-3">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase">Status</span>
        <span className="text-zinc-400 text-sm font-medium">Setup complete. Awaiting Feature 1.</span>
      </div>
    </main>
  );
}
