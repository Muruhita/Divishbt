import React from "react";
import { User as UserIcon, LogOut, Home, ScrollText, Settings } from "lucide-react";
import { User, RoleItem } from "@/types";

interface HeaderProps {
  user: User;
  userRole: RoleItem;
  view: "home" | "archive" | "admin";
  setView: (v: "home" | "archive" | "admin") => void;
  openProfile: () => void;
  handleLogout: () => void;
  playSound: (t: string) => void;
  getRoleColor: (level: number) => string;
}

export const Header = ({ user, userRole, view, setView, openProfile, handleLogout, playSound, getRoleColor }: HeaderProps) => {
  return (
    <div className="w-full flex justify-end p-4 relative z-[60] animate-menu-drop" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col items-end gap-2">
        <button type="button" className={`flex items-center gap-3 bg-[#2e1b13]/90 border ${userRole.id === 'owner' ? 'owner-border' : 'border-[#5c3a21]'} p-1.5 rounded-lg cursor-pointer hover:border-[#a37c49] transition-all group text-left`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); openProfile(); }}>
          <div className="w-10 h-10 rounded bg-[#1c110b] overflow-hidden flex items-center justify-center border border-[#5c3a21] group-hover:border-[#a37c49] transition-colors">
            {user.avatar ? <img src={user.avatar} alt="Avatar" loading="lazy" draggable={false} className="w-full h-full object-cover no-select" /> : <UserIcon size={20} className="text-[#5c3a21] group-hover:text-[#a37c49] transition-colors" />}
          </div>
          <div className="flex flex-col text-right pr-2">
            <span className="text-sm font-bold font-pixeloid-mono select-text">{user.account_name}</span>
            <span className={`text-xs font-bold font-pixeloid-mono ${getRoleColor(userRole.level)} select-text`}>{userRole.name}</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded active:scale-90 transition-all" title="Выйти"><LogOut size={18} /></button>
        </button>

        <div className="flex flex-col gap-1 items-end">
          {view !== "home" && <button onClick={() => { setView("home"); playSound("click"); }} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start"><Home size={14} /> На главную</button>}
          {view !== "archive" && <button onClick={() => { setView("archive"); playSound("click"); }} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start"><ScrollText size={14} /> Открыть свитки</button>}
          {view !== "admin" && userRole.level >= 1 && <button onClick={() => { setView("admin"); playSound("click"); }} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start"><Settings size={14} /> Админка</button>}
        </div>
      </div>
    </div>
  );
};
