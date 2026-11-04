"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Search, ChevronLeft, ChevronRight, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings, Database, Activity, ShieldAlert, Download, Upload, Image as ImageIcon, Maximize2, Pencil, Volume2, VolumeX, User as UserIcon, History, AlertTriangle } from "lucide-react";

type ArchiveItem = { id: number; title: string; category: string; description: string; symbol?: string; dangerLevel?: string; image?: string; };
type DbArchiveItem = { id: number; title: string; category: string; description: string; symbol: string | null; danger_level: string | null; image: string | null; };
type User = { id: number; username: string; account_name: string; role: "owner" | "creator" | "guardian" | "high" | "low"; avatar?: string; };
type DbUser = { id: number; username: string; account_name: string; role: string; plain_password: string | null; avatar: string | null; };
type LogItem = { id: number; action: string; item_title: string; user_name: string; user_role: string; timestamp: string; };
type NewArchiveItem = Omit<ArchiveItem, "id">;

const CATEGORIES = ["Все", "Комбинации Цифр", "Слова", "Термины", "Комбинации Букв", "Символика", "Картинки", "Другое"];

const ROLES_MAP: Record<string, { name: string, level: number, color: string }> = {
  owner: { name: "Овнер (Dev)", level: 4, color: "text-red-500 border-red-500" },
  creator: { name: "Создатель Сервера", level: 3, color: "text-purple-500 border-purple-500" },
  guardian: { name: "Хранитель", level: 2, color: "text-blue-500 border-blue-500" },
  high: { name: "Хай Стафф", level: 1, color: "text-green-500 border-green-500" },
  low: { name: "Лоу Стафф", level: 0, color: "text-gray-400 border-gray-400" },
};

const INITIAL_NEW_ITEM: NewArchiveItem = { title: "", category: "Комбинации Цифр", description: "", symbol: "", dangerLevel: "Низкий", image: "" };
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

export default function TavernArchive() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [newPass, setNewPass] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const [newItems, setNewItems] = useState<NewArchiveItem[]>([{ ...INITIAL_NEW_ITEM }]);
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  
  const [bulkJson, setBulkJson] = useState(""); 
  const [adminTab, setAdminTab] = useState<"archive" | "bulk" | "users" | "diag" | "logs">("archive");
  
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [diagResult, setDiagResult] = useState<{ status: string, latency?: number, message: string } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = (type: "click" | "save" | "delete" | "success") => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "click") {
      osc.type = "triangle"; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === "save" || type === "success") {
      osc.type = "sine"; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === "delete") {
      osc.type = "sawtooth"; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    }
  };

  const fetchArchive = async (page = 1) => {
    try {
      const res = await fetch(`/api/archive?page=${page}&limit=${LIMIT}`);
      const result = await res.json();
      const items = result.items || [];
      
      const formatted = (items as DbArchiveItem[]).map((item) => ({
        id: item.id, title: item.title, category: item.category, description: item.description,
        symbol: item.symbol || undefined, dangerLevel: item.danger_level || undefined,
        image: item.image || undefined
      }));
      
      setData(formatted);
      setTotalPages(Math.ceil((result.total || 0) / LIMIT));
      setCurrentPage(page);
    } catch (error) {
      console.error("Ошибка загрузки", error);
      setData([]);
    }
  };

  useEffect(() => {
    const checkSession = () => {
      try {
        const savedSession = localStorage.getItem("tavern_session");
        if (savedSession) {
          const { userData, expiresAt } = JSON.parse(savedSession);
          if (Date.now() < expiresAt) setUser(userData); 
          else localStorage.removeItem("tavern_session"); 
        }
      } catch (e) { localStorage.removeItem("tavern_session"); } 
      finally { setIsCheckingAuth(false); }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (user) fetchArchive(currentPage);
  }, [user, currentPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    playSound("click");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser({ ...data }); 
        setLoginUser(""); setLoginPass("");
        const expiresAt = Date.now() + (5 * 60 * 60 * 1000); 
        localStorage.setItem("tavern_session", JSON.stringify({ userData: { ...data }, expiresAt }));
        playSound("success");
      } else { setLoginError(data.error || "Ошибка входа"); }
    } catch { setLoginError("Ошибка соединения"); }
  };

  const handleLogout = () => {
    playSound("click");
    setUser(null);
    localStorage.removeItem("tavern_session");
    setView("home");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    playSound("save");
    setProfileMsg("");

    const res = await fetch("/api/user/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, oldPassword: oldPass, newPassword: newPass, avatar: user.avatar })
    });

    if (res.ok) {
      setProfileMsg("Профиль обновлен!");
      setOldPass(""); setNewPass("");
      const saved = JSON.parse(localStorage.getItem("tavern_session")!);
      saved.userData = { ...user };
      localStorage.setItem("tavern_session", JSON.stringify(saved));
    } else { const err = await res.json(); setProfileMsg(`Ошибка: ${err.error}`); }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) return alert("Аватарка должна быть меньше 500КБ!");
    const reader = new FileReader();
    reader.onloadend = () => setUser(prev => prev ? { ...prev, avatar: reader.result as string } : null);
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = async (id: number, title: string) => {
    if (!user || !confirm("Удалить запись?")) return;
    playSound("delete");
    await fetch(`/api/archive?id=${id}&title=${encodeURIComponent(title)}&authorName=${encodeURIComponent(user.account_name)}&authorRole=${user.role}`, { method: "DELETE" });
    fetchArchive(currentPage);
  };

  const handleClearDatabase = async () => {
    if (!user) return;
    const confirmText = prompt("ВНИМАНИЕ! Это удалит ВСЕ записи навсегда. Введите слово 'УДАЛИТЬ' для подтверждения:");
    if (confirmText !== "УДАЛИТЬ") return alert("Отменено.");
    
    playSound("delete");
    const res = await fetch(`/api/archive?clear=true&authorName=${encodeURIComponent(user.account_name)}&authorRole=${user.role}`, { method: "DELETE" });
    if (res.ok) {
      alert("База данных полностью очищена!");
      fetchArchive(1);
    } else {
      alert("Ошибка при очистке базы.");
    }
  };

  const handleAddMultipleItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const validItems = newItems.filter(item => item.title.trim() !== "" && item.description.trim() !== "");
    if (validItems.length === 0) return alert("Заполните хотя бы одну запись");
    playSound("save");

    const itemsWithAuthor = validItems.map(item => ({ ...item, authorName: user.account_name, authorRole: user.role }));

    const res = await fetch("/api/archive", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemsWithAuthor)
    });
    
    if (res.ok) { 
      const result = await res.json();
      alert(`Успешно добавлено ${result.count} записей!`);
      fetchArchive(1); 
      setNewItems([{ ...INITIAL_NEW_ITEM }]); 
    } else { alert("Ошибка при сохранении"); }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !user) return;
    playSound("save");

    const res = await fetch("/api/archive", {
      method: "PUT", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ ...editingItem, authorName: user.account_name, authorRole: user.role })
    });
    
    if (res.ok) { 
      alert("Запись обновлена!"); setEditingItem(null); fetchArchive(currentPage); 
    } else { alert("Ошибка при обновлении"); }
  };

  const generateRandom = (length = 15) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    playSound("save");
    const finalUsername = autoUser ? generateRandom(15) : newAcc.username;
    const finalPassword = autoPass ? generateRandom(15) : newAcc.password;

    const res = await fetch("/api/admin/create-user", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAcc, username: finalUsername, password: finalPassword, requesterRole: user.role })
    });

    if (res.ok) {
      alert(`Аккаунт создан!\nЛогин: ${finalUsername}\nПароль: ${finalPassword}`);
      setNewAcc({ account_name: "", username: "", password: "", role: "low" });
      setAutoUser(false); setAutoPass(false); fetchUsers();
    } else { const err = await res.json(); alert(err.error); }
  };

  const handleDeleteUser = async (id: number, targetName: string) => {
    if (!user || !confirm(`Удалить "${targetName}"?`)) return;
    playSound("delete");
    const res = await fetch(`/api/admin/users?id=${id}&requesterRole=${user.role}`, { method: "DELETE" });
    if (res.ok) fetchUsers(); else { const err = await res.json(); alert(err.error); }
  };

  const fetchUsers = async () => {
    if (!user) return;
    const res = await fetch(`/api/admin/users?role=${user.role}`);
    if (res.ok) setUsersList(await res.json());
  };

  const fetchLogs = async () => {
    const res = await fetch("/api/admin/logs");
    if (res.ok) setLogsList(await res.json());
  };

  const handleExport = async () => {
    playSound("click");
    try {
      const res = await fetch("/api/archive?limit=9999");
      const result = await res.json();
      const exportData = (result.items || []).map((item: DbArchiveItem) => ({
        title: item.title, category: item.category, description: item.description,
        symbol: item.symbol, dangerLevel: item.danger_level, image: item.image 
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "tavern_archive_export.json"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Ошибка при экспорте"); }
  };

  const handleBulkImport = async () => {
    if (!user) return;
    playSound("save");
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON должен быть массивом");
      
      const itemsWithAuthor = parsed.map((item: any) => ({ 
        ...item, 
        authorName: user.account_name, 
        authorRole: user.role 
      }));

      const res = await fetch("/api/archive", {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(itemsWithAuthor)
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(`Успешно добавлено ${result.count} записей!`);
        setBulkJson(""); fetchArchive(1);
      } else { alert("Ошибка при импорте"); }
    } catch (e) { alert("Ошибка формата JSON. Проверьте синтаксис."); }
  };

  useEffect(() => {
    if (view === "admin" && adminTab === "users") fetchUsers();
    if (view === "admin" && adminTab === "logs") fetchLogs();
  }, [view, adminTab]);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ArchiveCard = ({ item }: { item: ArchiveItem }) => (
    <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:border-[#a37c49] transition-all duration-300 group flex flex-col relative z-10 overflow-hidden">
      {item.image && (
        <div className="w-full h-56 overflow-hidden border-b-2 border-[#5c3a21] cursor-pointer relative group/img flex items-center justify-center"
          style={{ backgroundColor: '#d6c5b3', backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          onClick={() => { playSound("click"); setSelectedImage(item.image!); }}>
          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-110 drop-shadow-md" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 size={32} className="text-[#e6d5b8]" />
          </div>
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8]">{item.title}</h3>
          {item.symbol && <span className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] bg-[#1c110b] px-3 py-1 rounded border border-[#5c3a21]">{item.symbol}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold font-pixeloid-mono bg-[#1c110b] text-[#a37c49] rounded border border-[#5c3a21] uppercase">{item.category}</span>
          {item.dangerLevel && <span className="inline-block px-2 py-1 text-xs font-bold font-pixeloid-mono rounded border border-red-900/50 bg-red-900/20 text-red-400 uppercase">{item.dangerLevel}</span>}
          
          {user && (user.role === "owner" || user.role === "creator") && (
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setEditingItem(item)} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded"><Pencil size={16} /></button>
              <button onClick={() => handleDeleteItem(item.id, item.title)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
            </div>
          )}
          {user && user.role === "high" && (
            <button onClick={() => handleDeleteItem(item.id, item.title)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
          )}
        </div>
        <div className="text-[#c4b5a5] font-sans leading-relaxed flex-grow relative z-10 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </div>
      </div>
    </div>
  );

  if (isCheckingAuth) return <main className="min-h-screen bg-[#160d08]"></main>;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#160d08] text-[#e6d5b8] font-sans flex flex-col">
      
      {/* ТУМАН И РУНЫ НА ФОНЕ */}
      <div className="fog-container"><div className="fog-layer"></div><div className="fog-layer"></div></div>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {RUNES.slice(0, 10).map((rune, i) => (
          <div key={i} className="rune">{rune}</div>
        ))}
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #a37c49 0%, transparent 70%)" }}></div>

      <button onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playSound("success"); }}
        className="absolute top-4 left-4 z-[100] p-2 bg-[#1c110b]/80 border border-[#5c3a21] rounded hover:bg-[#a37c49] text-[#8c6e52]">
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* МОДАЛКИ */}
      {selectedImage && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#d6c5b3', backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-2xl relative">
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Редактировать</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <input required placeholder="Название" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
              <textarea required placeholder="Описание (Markdown)" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-32 font-mono text-sm" />
              <button type="submit" className="px-6 py-2 bg-[#5c3a21] text-white font-bold rounded">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {showProfile && user && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-md relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 text-center">Профиль</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#5c3a21] overflow-hidden bg-[#1c110b] mb-2 flex items-center justify-center relative">
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-[#5c3a21]" />}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <input type="password" placeholder="Старый пароль" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
              <input type="password" placeholder="Новый пароль" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
              {profileMsg && <p className="text-center text-sm text-green-400">{profileMsg}</p>}
              <button type="submit" className="w-full py-2 bg-[#5c3a21] text-white font-bold rounded">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {/* ЭКРАН ВХОДА */}
      {!user && (
        <div className="flex-grow flex items-center justify-center p-4 relative z-10">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-8 pt-0 rounded-xl shadow-2xl w-full max-w-md relative mt-16">
            <div className="flex justify-center -mt-16 mb-4 relative">
              <div className="absolute inset-0 bg-[#a37c49] blur-2xl opacity-20 rounded-full"></div>
              <img src="/logo.png" alt="Сытый Лис" className="w-32 h-32 object-cover rounded-full border-4 border-[#5c3a21] relative z-10 animate-float bg-[#1c110b]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <h1 className="text-3xl font-bold font-pixeloid-mono text-center mb-2 text-[#a37c49] uppercase flex justify-center items-center gap-2"><Flame /> Сытый Лис</h1>
            <p className="text-center text-[#8c6e52] mb-8">Вход в закрытый архив</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <input type="text" required placeholder="Логин" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8]" />
              <input type="password" required placeholder="Пароль" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8]" />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded">Войти</button>
            </form>
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ САЙТ */}
      {user && (
        <div className="flex-grow flex flex-col relative z-10">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#2e1b13]/90 border border-[#5c3a21] p-1.5 rounded-lg cursor-pointer hover:border-[#a37c49]" onClick={() => setShowProfile(true)}>
              <div className="w-10 h-10 rounded bg-[#1c110b] overflow-hidden flex items-center justify-center">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-[#5c3a21]" />}
              </div>
              <div className="flex flex-col text-right pr-2">
                <span className="text-sm font-bold font-pixeloid-mono">{user.account_name}</span>
                <span className={`text-xs font-bold font-pixeloid-mono ${ROLES_MAP[user.role]?.color.split(' ')[0]}`}>{ROLES_MAP[user.role]?.name}</span>
              </div>
              {ROLES_MAP[user.role]?.level >= 1 && (
                <button onClick={(e) => { e.stopPropagation(); setView("admin"); }} className="p-2 bg-[#1c110b] rounded hover:bg-[#a37c49]"><Settings size={18} /></button>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded"><LogOut size={18} /></button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 w-full flex flex-col flex-grow">
            <header className="flex justify-center mb-12 cursor-pointer" onClick={() => setView("home")}>
              <img src="/logo.png" alt="Сытый Лис" className="w-24 h-24 object-cover rounded-full border-4 border-[#5c3a21] animate-float bg-[#1c110b]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </header>

            {view === "home" && (
              <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
                <h2 className="text-4xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Запретный Архив</h2>
                <div className="relative w-full max-w-2xl mb-8">
                  <input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-12 bg-[#2e1b13] border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono" />
                  <Search className="absolute left-4 top-4 text-[#6b513b]" size={24} />
                </div>
                {searchQuery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                  </div>
                ) : (
                  <button onClick={() => setView("archive")} className="mt-8 px-10 py-4 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono text-xl rounded-lg shadow-lg">
                    Открыть все свитки
                  </button>
                )}
              </div>
            )}

            {view === "archive" && (
              <div className="animate-fade-in w-full text-left">
                 <button onClick={() => setView("home")} className="mb-6 flex items-center gap-2 text-[#8c6e52] hover:text-[#a37c49]"><ChevronLeft size={20}/> На главную</button>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map(c => <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded border ${selectedCategory === c ? 'bg-[#a37c49] text-[#160d08]' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52]'}`}>{c}</button>)}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                 </div>
                 
                 <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                   <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded disabled:opacity-30"><ChevronLeft size={24}/></button>
                   <span className="font-pixeloid-mono text-lg text-[#a37c49]">Стр. {currentPage} из {totalPages}</span>
                   <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded disabled:opacity-30"><ChevronRight size={24}/></button>
                 </div>
              </div>
            )}

            {view === "admin" && ROLES_MAP[user.role]?.level >= 1 && (
              <div className="animate-fade-in w-full bg-[#2e1b13] p-8 rounded-xl border-double border-4 border-[#5c3a21]">
                <div className="flex justify-between items-center mb-8 border-b border-[#5c3a21] pb-4">
                   <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49]">Панель Управления</h2>
                   <button onClick={() => setView("home")} className="text-sm font-pixeloid-mono text-[#8c6e52] hover:text-white">На главную</button>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 font-pixeloid-mono">
                  <button onClick={() => setAdminTab("archive")} className={`px-4 py-2 rounded ${adminTab === 'archive' ? 'bg-[#5c3a21] text-white' : 'text-gray-500'}`}>Добавить</button>
                  <button onClick={() => setAdminTab("bulk")} className={`px-4 py-2 rounded ${adminTab === 'bulk' ? 'bg-[#5c3a21] text-white' : 'text-gray-500'}`}>Импорт/Экспорт</button>
                  <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded ${adminTab === 'users' ? 'bg-[#5c3a21] text-white' : 'text-gray-500'}`}>Аккаунты</button>
                  {(user.role === "owner" || user.role === "creator") && (
                    <button onClick={() => setAdminTab("logs")} className={`px-4 py-2 rounded ${adminTab === 'logs' ? 'bg-[#5c3a21] text-white' : 'text-gray-500'}`}>Логи</button>
                  )}
                  <button onClick={() => setAdminTab("diag")} className={`px-4 py-2 rounded ${adminTab === 'diag' ? 'bg-[#5c3a21] text-white' : 'text-gray-500'}`}>Диагностика</button>
                </div>

                {/* ВКЛАДКА: ДОБАВИТЬ */}
                {adminTab === "archive" && (
                  <div>
                    <form onSubmit={handleAddMultipleItems} className="space-y-6 max-w-xl">
                      {newItems.map((item, index) => (
                        <div key={index} className="p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg">
                          <div className="space-y-3">
                            <input required placeholder="Название" value={item.title} onChange={e => { const upd = [...newItems]; upd[index].title = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
                            <textarea required placeholder="Описание (Markdown)" value={item.description} onChange={e => { const upd = [...newItems]; upd[index].description = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-20" />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-4">
                        <button type="button" onClick={() => setNewItems([...newItems, { ...INITIAL_NEW_ITEM }])} className="px-4 py-2 bg-[#3d2617] border border-[#5c3a21] text-white rounded">Добавить ещё</button>
                        <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded">Сохранить</button>
                      </div>
                    </form>

                    {/* КНОПКА ОЧИСТКИ БАЗЫ (ТОЛЬКО ДЛЯ ОВНЕРА) */}
                    {user.role === "owner" && (
                      <div className="mt-12 pt-6 border-t border-red-900/50 max-w-xl">
                        <h3 className="text-red-500 font-bold font-pixeloid-mono mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Опасная зона</h3>
                        <p className="text-sm text-gray-500 mb-4">Эта кнопка безвозвратно удалит ВСЕ записи из архива.</p>
                        <button onClick={handleClearDatabase} className="px-6 py-2 bg-red-900/20 border border-red-500 text-red-400 font-bold rounded hover:bg-red-900/40 transition-colors">
                          Очистить базу данных
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ВКЛАДКА: ИМПОРТ/ЭКСПОРТ */}
                {adminTab === "bulk" && (
                  <div className="space-y-8 max-w-2xl animate-fade-in">
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Upload size={18}/> Массовый импорт (JSON)</h3>
                      <p className="text-[#8c6e52] mb-4 text-sm font-sans">Вставьте JSON массив записей в формате:</p>
                      <pre className="text-xs text-[#a37c49] bg-[#160d08] p-3 rounded mb-4 overflow-x-auto font-mono">
{`[{"title": "Название", "category": "Символика", "description": "Описание", "symbol": "1/11", "dangerLevel": "Высокий", "image": "data:image..."}]`}
                      </pre>
                      <textarea 
                        placeholder="Вставьте JSON сюда..." 
                        value={bulkJson} 
                        onChange={e => setBulkJson(e.target.value)} 
                        className="w-full p-3 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] font-mono text-sm focus:border-[#a37c49] outline-none h-48" 
                      />
                      <button onClick={handleBulkImport} className="mt-4 px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Импортировать данные</button>
                    </div>

                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Download size={18}/> Экспорт</h3>
                      <p className="text-[#8c6e52] mb-4 text-sm font-sans">Скачать весь текущий архив в формате JSON.</p>
                      <button onClick={handleExport} className="px-6 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#5c3a21] transition-colors shadow-lg">Скачать файл</button>
                    </div>
                  </div>
                )}

                {/* ВКЛАДКА: АККАУНТЫ */}
                {adminTab === "users" && (
                  <div className="space-y-10 font-sans animate-fade-in">
                    <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
                      <input required placeholder="Название аккаунта (Никнейм)" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8]" />
                      <div className="flex items-center gap-2"><input required={!autoUser} placeholder="Логин" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label></div>
                      <div className="flex items-center gap-2"><input required={!autoPass} placeholder="Пароль" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label></div>
                      <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8]">
                         <option value="low">Лоу Стафф</option><option value="high">Хай Стафф</option><option value="guardian">Хранитель</option><option value="creator">Создатель Сервера</option>
                      </select>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e]">Сгенерировать</button>
                    </form>
                    
                    <div>
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Users size={18}/> Список аккаунтов</h3>
                      <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono text-sm"><th className="p-3">Имя</th><th className="p-3">Роль</th><th className="p-3">Логин</th><th className="p-3">Пароль</th><th className="p-3">Действие</th></tr></thead>
                          <tbody>
                            {usersList.map(u => (
                              <tr key={u.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                                <td className="p-3 font-medium">{u.account_name}</td>
                                <td className={`p-3 text-sm font-bold font-pixeloid-mono ${ROLES_MAP[u.role]?.color.split(' ')[0] || "text-white"}`}>{ROLES_MAP[u.role]?.name || u.role}</td>
                                <td className="p-3 font-mono text-[#c4b5a5]">{u.username}</td>
                                <td className="p-3 font-mono text-red-400 bg-red-500/5">{u.plain_password || "********"}</td>
                                <td className="p-3">{(user.role === "owner" || user.role === "creator") && u.id !== user.id && (<button onClick={() => handleDeleteUser(u.id, u.account_name)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ВКЛАДКА: ЛОГИ */}
                {adminTab === "logs" && (user.role === "owner" || user.role === "creator") && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><History size={18}/> История действий (Последние 100)</h3>
                    <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono text-sm"><th className="p-3">Время</th><th className="p-3">Действие</th><th className="p-3">Запись</th><th className="p-3">Кто сделал</th></tr></thead>
                        <tbody>
                          {logsList.map(log => (
                            <tr key={log.id} className="border-b border-[#3d2617] hover:bg-[#1c110b]">
                              <td className="p-3 text-xs text-[#8c6e52]">{new Date(log.timestamp).toLocaleString('ru-RU')}</td>
                              <td className={`p-3 font-bold font-pixeloid-mono ${log.action === 'УДАЛЕНИЕ' ? 'text-red-400' : log.action === 'СОЗДАНИЕ' ? 'text-green-400' : 'text-blue-400'}`}>{log.action}</td>
                              <td className="p-3 text-sm">{log.item_title}</td>
                              <td className="p-3 text-sm">{log.user_name} <span className="text-xs text-[#8c6e52]">({log.user_role})</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ВКЛАДКА: ДИАГНОСТИКА */}
                {adminTab === "diag" && (
                  <div className="max-w-xl font-sans animate-fade-in">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Database size={18}/> Проверка системы</h3>
                    <button onClick={async () => {
                      setDiagResult(null);
                      const res = await fetch("/api/admin/diagnostics");
                      setDiagResult(await res.json());
                    }} className="px-6 py-3 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded-lg hover:bg-[#7a4f2e] flex items-center gap-2 mb-6 shadow-lg"><Activity size={18}/> Запустить тест</button>
                    
                    {diagResult && (
                      <div className={`p-6 rounded-xl border ${diagResult.status === 'ok' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <p className="text-[#e6d5b8] mb-2">{diagResult.message}</p>
                        {diagResult.latency !== undefined && (<p className="text-sm text-[#8c6e52] font-mono">Пинг до базы: {diagResult.latency} мс</p>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-[100] bg-[#1c110b]/70 border border-[#5c3a21]/40 px-3 py-1.5 rounded-md text-[11px] text-[#8c6e52]/70 font-pixeloid-mono">Автор: muruh1ta</div>
    </main>
  );
}
