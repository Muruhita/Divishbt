import React from "react";
import { Flame, BookOpen } from "lucide-react";

interface LoginBookProps {
  isBookOpening: boolean;
  isBookClosing: boolean;
  startBookCloseAnim: boolean;
  loginUser: string;
  setLoginUser: (v: string) => void;
  loginPass: string;
  setLoginPass: (v: string) => void;
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
  isVisible: boolean;
}

export const LoginBook = ({
  isBookOpening, isBookClosing, startBookCloseAnim,
  loginUser, setLoginUser, loginPass, setLoginPass, loginError, handleLogin, isVisible
}: LoginBookProps) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden book-container ${(isBookOpening || (isBookClosing && !startBookCloseAnim)) ? 'book-open' : ''}`}>
      <div className="absolute inset-0 bg-[#0a0705]"></div>
      <div className="book-cover-left flex items-center justify-end pr-4"><div className="w-1/2 h-full border-r border-[#5c3a21]"></div><div className="book-corner book-corner-tl"></div><div className="book-corner book-corner-bl"></div></div>
      <div className="book-cover-right flex items-center justify-start pl-4"><div className="w-1/2 h-full border-l border-[#5c3a21]"></div><div className="book-corner book-corner-tr"></div><div className="book-corner book-corner-br"></div></div>
      <div className="book-spine"></div>
      <div className="login-content">
        <div className="bg-[#2e1b13]/95 border-4 border-[#a37c49] p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] relative z-50">
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-[#a37c49] blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <img src="/logo.png" alt="Сытый Лис" loading="lazy" draggable={false} className="w-32 h-32 object-cover rounded-full border-4 border-[#5c3a21] relative z-10 animate-float bg-[#1c110b] no-select" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <h1 className="text-3xl font-bold font-pixeloid-mono text-center mb-2 text-[#E5B85C] uppercase flex justify-center items-center gap-2 drop-shadow-md"><Flame /> Сытый Лис</h1>
          <p className="text-center text-[#8c6e52] mb-8 font-pixeloid-mono">Открыть древний фолиант</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Логин</label><input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" /></div>
            <div><label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Пароль</label><input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" /></div>
            {loginError && <p className="text-red-400 text-sm text-center animate-shake">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono text-lg rounded hover:bg-[#7a4f2e] active:scale-95 transition-all shadow-[0_4px_0_#1c110b] hover:shadow-none hover:translate-y-1 flex items-center justify-center gap-2"><BookOpen size={20} /> Открыть</button>
          </form>
        </div>
      </div>
    </div>
  );
};
