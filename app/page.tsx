"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Search, ChevronLeft, ChevronRight, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings, Database, Activity, ShieldAlert, Download, Upload, Image as ImageIcon, Maximize2, Pencil, Volume2, VolumeX, User as UserIcon, History } from "lucide-react";

// ... (ваши типы ArchiveItem, DbArchiveItem, User, DbUser, NewArchiveItem оставляем без изменений)
type ArchiveItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  symbol?: string; 
  dangerLevel?: string;
  image?: string; 
};

type DbArchiveItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  symbol: string | null;
  danger_level: string | null;
  image: string | null;
};

type User = {
  id: number;
  username: string;
  account_name: string;
  role: "owner" | "creator" | "guardian" | "high" | "low";
  avatar?: string;
};

type DbUser = {
  id: number;
  username: string;
  account_name: string;
  role: string;
  plain_password: string | null;
  avatar: string | null;
};

type LogItem = {
  id: number;
  action: string;
  item_title: string;
  user_name: string;
  user_role: string;
  timestamp: string;
};

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

export default function TavernArchive() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  // Модалки
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Profile State
  const [newPass, setNewPass] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Admin State
  const [newItems, setNewItems] = useState<NewArchiveItem[]>([{ ...INITIAL_NEW_ITEM }]);
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  const [bulkJson, setBulkJson] = useState(""); 
  const [adminTab, setAdminTab] = useState<"archive" | "bulk" | "users" | "diag" | "logs">("archive");
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [diagResult, setDiagResult] = useState<{ status: string, latency?: number, message: string } | null>(null);

  // --- ЗВУКИ ---
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
    osc.connect(gain);
    gain.connect(ctx.destination);
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

  // --- ЗАГРУЗКА ---
  const fetchArchive = async (page = 1) => {
    try {
      const res = await fetch(`/api/archive?page=${page}&limit=${LIMIT}`);
      const result = await res.json();
      
      const formatted = (result.items as DbArchiveItem[]).map((item) => ({
        id: item.id, title: item.title, category: item.category, description: item.description,
        symbol: item.symbol || undefined, dangerLevel: item.danger_level || undefined,
        image: item.image || undefined
      }));
      
      setData(formatted);
      setTotalPages(Math.ceil(result.total / LIMIT));
      setCurrentPage(page);
    } catch (error) {
      console.error("Ошибка загрузки архива", error);
    }
  };

  useEffect(() => {
    const checkSession = () => {
      try {
        const savedSession = localStorage.getItem("tavern_session");
        if (savedSession) {
          const { userData, expiresAt } = JSON.parse(savedSession);
          if (Date.now() < expiresAt) {
            setUser(userData); 
          } else {
            localStorage.removeItem("tavern_session"); 
          }
        }
      } catch (e) {
        localStorage.removeItem("tavern_session"); 
      } finally {
        setIsCheckingAuth(false); 
      }
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Дополнительно запрашиваем аватарку (в API логина можно добавить, но пока просто обновим стейт)
        setUser({ ...data, avatar: data.avatar }); 
        setLoginUser(""); setLoginPass("");
        const expiresAt = Date.now() + (5 * 60 * 60 * 1000); 
        localStorage.setItem("tavern_session", JSON.stringify({ userData: { ...data }, expiresAt }));
        playSound("success");
      } else {
        setLoginError(data.error || "Ошибка входа");
      }
    } catch { 
      setLoginError("Ошибка соединения с сервером"); 
    }
  };

  const handleLogout = () => {
    playSound("click");
    setUser(null);
    localStorage.removeItem("tavern_session");
    setView("home");
  };

  // --- ОБНОВЛЕНИЕ ПРОФИЛЯ ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    playSound("save");
    setProfileMsg("");

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        oldPassword: oldPass,
        newPassword: newPass,
        avatar: user.avatar // отправляем текущую (возможно новую) аватарку
      })
    });

    if (res.ok) {
      setProfileMsg("Профиль успешно обновлен!");
      setOldPass("");
      setNewPass("");
      // Обновляем локальную сессию
      const saved = JSON.parse(localStorage.getItem("tavern_session")!);
      saved.userData = { ...user };
      localStorage.setItem("tavern_session", JSON.stringify(saved));
    } else {
      const err = await res.json();
      setProfileMsg(`Ошибка: ${err.error}`);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) return alert("Аватарка должна быть меньше 500КБ!");

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser(prev => prev ? { ...prev, avatar: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  // --- ДЕЙСТВИЯ С АРХИВОМ ---
  const handleDeleteItem = async (id: number, title: string) => {
    if (!user) return;
    if (!confirm("Удалить запись?")) return;
    playSound("delete");
    await fetch(`/api/archive?id=${id}&title=${encodeURIComponent(title)}&authorName=${encodeURIComponent(user.account_name)}&authorRole=${user.role}`, { method: "DELETE" });
    fetchArchive(currentPage);
  };

  const handleAddMultipleItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const validItems = newItems.filter(item => item.title.trim() !== "" && item.description.trim() !== "");
    if (validItems.length === 0) return alert("Заполните хотя бы одну запись");
    playSound("save");

    const itemsWithAuthor = validItems.map(item => ({
      ...item,
      authorName: user.account_name,
      authorRole: user.role
    }));

    const res = await fetch("/api/archive", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemsWithAuthor)
    });
    
    if (res.ok) { 
      const result = await res.json();
      alert(`Успешно добавлено ${result.count} записей!`);
      fetchArchive(1); // Возвращаемся на 1 страницу
      setNewItems([{ ...INITIAL_NEW_ITEM }]); 
    } else {
      alert("Ошибка при сохранении");
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !user) return;
    playSound("save");

    const payload = {
      ...editingItem,
      authorName: user.account_name,
      authorRole: user.role
    };

    const res = await fetch("/api/archive", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    
    if (res.ok) { 
      alert("Запись успешно обновлена!");
      setEditingItem(null);
      fetchArchive(currentPage); 
    } else {
      alert("Ошибка при обновлении");
    }
  };

  // ... (Остальные функции: создание юзера, удаление юзера, импорт/экспорт оставляем из прошлого кода)
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
      setAutoUser(false); setAutoPass(false);
      fetchUsers();
    } else { const err = await res.json(); alert(err.error); }
  };

  const handleDeleteUser = async (id: number, targetName: string) => {
    if (!user) return;
    if (!confirm(`Удалить "${targetName}"?`)) return;
    playSound("delete");
    const res = await fetch(`/api/admin/users?id=${id}&requesterRole=${user.role}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else { const err = await res.json(); alert(err.error); }
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
      const res = await fetch("/api/archive?limit=9999"); // Грузим всё для экспорта
      const result = await res.json();
      const exportData = (result.items as DbArchiveItem[]).map(item => ({
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

  useEffect(() => {
    if (view === "admin" && adminTab === "users") fetchUsers();
    if (view === "admin" && adminTab === "logs") fetchLogs();
  }, [view, adminTab]);

  // Локальная фильтрация (только текущей страницы)
  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- КАРТОЧКА ЗАПИСИ С MARKDOWN ---
  const ArchiveCard = ({ item }: { item: ArchiveItem }) => (
    <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:border-[#a37c49] hover:shadow-[0_4px_25px_rgba(163,124,73,0.2)] transition-all duration-300 group flex flex-col relative z-10 overflow-hidden">
      
      {item.image && (
        <div className="w-full h-56 overflow-hidden border-b-2 border-[#5c3a21] cursor-pointer relative group/img flex items-center justify-center"
          style={{ backgroundColor: '#d6c5b3', backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          onClick={() => { playSound("click"); setSelectedImage(item.image!); }}>
          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-110 drop-shadow-md" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Maximize2 size={32} className="text-[#e6d5b8] drop-shadow-lg" />
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] tracking-wide">{item.title}</h3>
          {item.symbol && <span className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] bg-[#1c110b] px-3 py-1 rounded border border-[#5c3a21] shadow-inner">{item.symbol}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold font-pixeloid-mono bg-[#1c110b] text-[#a37c49] rounded border border-[#5c3a21] uppercase tracking-wider">{item.category}</span>
          {item.dangerLevel && (
             <span className="inline-block px-2 py-1 text-xs font-bold font-pixeloid-mono rounded border border-red-900/50 bg-red-900/20 text-red-400 uppercase tracking-wider">{item.dangerLevel}</span>
          )}
          
          {user && (user.role === "owner" || user.role === "creator") && (
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => { playSound("click"); setEditingItem(item); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded transition-colors" title="Редактировать"><Pencil size={16} /></button>
              <button onClick={() => handleDeleteItem(item.id, item.title)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors" title="Удалить"><Trash2 size={16} /></button>
            </div>
          )}
          {user && user.role === "high" && (
            <button onClick={() => handleDeleteItem(item.id, item.title)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors" title="Удалить"><Trash2 size={16} /></button>
          )}
        </div>
        
        {/* MARKDOWN ВЫВОД */}
        <div className="text-[#c4b5a5] font-sans leading-relaxed flex-grow relative z-10 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>
            {item.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );

  if (isCheckingAuth) return <main className="min-h-screen bg-[#160d08]"></main>;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#160d08] text-[#e6d5b8] font-sans flex flex-col">
      
      <div className="fog-container"><div className="fog-layer"></div><div className="fog-layer"></div></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #a37c49 0%, transparent 70%)" }}></div>

      <button onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playSound("success"); }}
        className="absolute top-4 left-4 z-[100] p-2 bg-[#1c110b]/80 border border-[#5c3a21] rounded hover:bg-[#a37c49] hover:text-[#160d08] text-[#8c6e52] transition-colors"
        title={soundEnabled ? "Выключить звук" : "Включить звук"}>
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* МОДАЛКИ ПРОСМОТРА КАРТИНКИ И РЕДАКТИРОВАНИЯ */}
      {selectedImage && (
        <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-gray-400 hover:text-red-500 bg-black/50 p-2 rounded-full z-10" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}><X size={32} /></button>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#d6c5b3', backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl shadow-2xl w-full max-w-2xl my-8 relative">
            <button onClick={() => { playSound("click"); setEditingItem(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Редактировать запись</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              {/* Форма редактирования (без изменений) */}
              <input required placeholder="Название" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                   {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={editingItem.dangerLevel || "Низкий"} onChange={e => setEditingItem({...editingItem, dangerLevel: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                   <option value="Низкий">Уровень: Низкий</option><option value="Средний">Уровень: Средний</option><option value="Высокий">Уровень: Высокий</option><option value="Смертельный">Уровень: Смертельный</option>
                </select>
              </div>
              <textarea required placeholder="Описание (поддерживает Markdown)" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none h-32 font-mono text-sm" />
              <div className="mt-4 border-t border-[#5c3a21] pt-4">
                <label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-2"><ImageIcon size={16}/> Картинка</label>
                {!editingItem.image ? (
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]; if(!file) return;
                    const reader = new FileReader(); reader.onloadend = () => setEditingItem({...editingItem, image: reader.result as string}); reader.readAsDataURL(file);
                  }} className="w-full text-sm text-[#8c6e52] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#3d2617] file:text-[#e6d5b8] hover:file:bg-[#5c3a21] file:cursor-pointer" />
                ) : (
                  <div className="relative inline-block border-2 border-[#5c3a21] rounded-lg overflow-hidden" style={{ backgroundColor: '#d6c5b3' }}>
                    <img src={editingItem.image} alt="Preview" className="h-32 object-contain p-2" />
                    <button type="button" onClick={() => setEditingItem({...editingItem, image: ""})} className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full"><X size={14} /></button>
                  </div>
                )}
              </div>
              <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Сохранить изменения</button>
            </form>
          </div>
        </div>
      )}

      {/* ЛИЧНЫЙ КАБИНЕТ */}
      {showProfile && user && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => { playSound("click"); setShowProfile(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 text-center">Личный кабинет</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#5c3a21] overflow-hidden bg-[#1c110b] mb-2 flex items-center justify-center relative">
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-[#5c3a21]" />}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Загрузить аватарку" />
                </div>
                <span className="text-xs text-[#8c6e52]">Нажмите на круг, чтобы сменить фото</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Смена пароля</label>
                <input type="password" placeholder="Старый пароль" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
                <input type="password" placeholder="Новый пароль" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white" />
              </div>
              {profileMsg && <p className="text-center text-sm text-green-400 bg-green-900/20 p-2 rounded">{profileMsg}</p>}
              <button type="submit" className="w-full py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] shadow-lg">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {/* ЭКРАН ВХОДА */}
      {!user && (
        <div className="flex-grow flex items-center justify-center p-4 relative z-10">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-8 pt-0 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full max-w-md animate-fade-in relative mt-16">
            <div className="flex justify-center -mt-16 mb-4 relative">
              <div className="absolute inset-0 bg-[#a37c49] blur-2xl opacity-20 rounded-full"></div>
              <img src="/logo.png" alt="Сытый Лис" className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-[#5c3a21] shadow-2xl relative z-10 animate-float bg-[#1c110b]"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<div class="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-[#1c110b] rounded-full border-4 border-[#5c3a21] text-[#a37c49] shadow-2xl relative z-10 animate-float"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-keyhole"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg></div>'; }}
              />
            </div>
            <h1 className="text-3xl font-bold font-pixeloid-mono text-center mb-2 text-[#a37c49] tracking-widest uppercase flex justify-center items-center gap-2"><Flame /> Сытый Лис</h1>
            <p className="text-center text-[#8c6e52] mb-8 font-sans">Вход в закрытый архив</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <div><label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Логин</label><input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" /></div>
              <div><label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Пароль</label><input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" /></div>
              {loginError && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#5c3a21] hover:bg-[#7a4f2e] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono text-lg rounded shadow-lg transition-all">Войти</button>
            </form>
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ САЙТ */}
      {user && (
        <div className="flex-grow flex flex-col relative z-10">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#2e1b13]/90 backdrop-blur-sm border border-[#5c3a21] p-1.5 rounded-lg shadow-lg cursor-pointer hover:border-[#a37c49] transition-colors" onClick={() => { playSound("click"); setShowProfile(true); }}>
              <div className="w-10 h-10 rounded bg-[#1c110b] border border-[#5c3a21] overflow-hidden flex items-center justify-center">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-[#5c3a21]" />}
              </div>
              <div className="flex flex-col text-right pr-2">
                <span className="text-sm font-bold font-pixeloid-mono text-[#e6d5b8]">{user.account_name}</span>
                <span className={`text-xs font-bold font-pixeloid-mono ${ROLES_MAP[user.role]?.color.split(' ')[0] || "text-white"}`}>{ROLES_MAP[user.role]?.name || user.role}</span>
              </div>
              {ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
                <button onClick={(e) => { e.stopPropagation(); playSound("click"); setView("admin"); }} className="p-2 bg-[#1c110b] border border-[#5c3a21] rounded hover:bg-[#a37c49] hover:text-[#160d08] transition-colors" title="Админ-панель"><Settings size={18} /></button>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Выйти"><LogOut size={18} /></button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 w-full flex flex-col flex-grow">
            <header className="flex justify-center items-center mb-12 cursor-pointer group" onClick={() => { playSound("click"); setView("home"); }}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#a37c49] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                <img src="/logo.png" alt="Сытый Лис" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-[#5c3a21] group-hover:border-[#a37c49] transition-colors duration-300 shadow-2xl relative z-10 animate-float bg-[#1c110b]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<h1 class="text-4xl font-bold font-pixeloid-mono text-[#a37c49] animate-float flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Сытый Лис</h1>'; }}
                />
              </div>
            </header>

            {view === "home" && (
              <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
                <h2 className="text-4xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 drop-shadow-lg">Запретный Архив</h2>
                <div className="relative w-full max-w-2xl mb-8 group">
                  <input type="text" placeholder="Искать в свитках (на текущей странице)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-12 bg-[#2e1b13]/90 backdrop-blur-sm border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono focus:border-[#a37c49] transition-colors shadow-xl placeholder-[#6b513b]" />
                  <Search className="absolute left-4 top-4 text-[#6b513b] group-focus-within:text-[#a37c49] transition-colors" size={24} />
                </div>
                {searchQuery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in text-left">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                  </div>
                ) : (
                  <button onClick={() => { playSound("click"); setView("archive"); }} className="mt-8 px-10 py-4 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono text-xl rounded-lg shadow-[0_4px_0_#2e1b13] hover:shadow-[0_0_20px_rgba(163,124,73,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group tracking-widest uppercase">
                    <ScrollText size={24} className="group-hover:rotate-12 transition-transform duration-300" /> Открыть все свитки
                  </button>
                )}
              </div>
            )}

            {view === "archive" && (
              <div className="animate-fade-in w-full text-left">
                 <button onClick={() => { playSound("click"); setView("home"); }} className="mb-6 flex items-center gap-2 text-[#8c6e52] hover:text-[#a37c49] transition-colors font-pixeloid-mono"><ChevronLeft size={20}/> На главную</button>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map(c => <button key={c} onClick={() => { playSound("click"); setSelectedCategory(c); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 ${selectedCategory === c ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>{c}</button>)}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                 </div>

                 {/* ПАГИНАЦИЯ */}
                 <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                   <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded-lg text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] transition-colors"><ChevronLeft size={24}/></button>
                   <span className="font-pixeloid-mono text-lg text-[#a37c49]">Страница {currentPage} из {totalPages}</span>
                   <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded-lg text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] transition-colors"><ChevronRight size={24}/></button>
                 </div>
              </div>
            )}

            {view === "admin" && ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
              <div className="animate-fade-in w-full bg-[#2e1b13] p-8 rounded-xl border-double border-4 border-[#5c3a21] shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-[#5c3a21] pb-4">
                   <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] drop-shadow-md">Панель Управления</h2>
                   <button onClick={() => { playSound("click"); setView("home"); }} className="text-sm font-pixeloid-mono text-[#8c6e52] hover:text-[#e6d5b8] transition-colors">На главную</button>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 font-pixeloid-mono">
                  <button onClick={() => { playSound("click"); setAdminTab("archive"); }} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'archive' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><ScrollText size={18}/> Добавить</button>
                  <button onClick={() => { playSound("click"); setAdminTab("bulk"); }} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'bulk' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Upload size={18}/> Импорт/Экспорт</button>
                  <button onClick={() => { playSound("click"); setAdminTab("users"); }} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'users' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Users size={18}/> Аккаунты</button>
                  {(user.role === "owner" || user.role === "creator") && (
                    <button onClick={() => { playSound("click"); setAdminTab("logs"); }} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'logs' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><History size={18}/> Логи</button>
                  )}
                  <button onClick={() => { playSound("click"); setAdminTab("diag"); }} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'diag' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Activity size={18}/> Диагностика</button>
                </div>

                {/* ФОРМА ДОБАВЛЕНИЯ (Архив) */}
                {adminTab === "archive" && (
                  <form onSubmit={handleAddMultipleItems} className="space-y-6 max-w-xl font-sans">
                    {newItems.map((item, index) => (
                      <div key={index} className="p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg relative shadow-inner">
                        <h3 className="text-sm font-bold font-pixeloid-mono text-[#a37c49] mb-3 flex justify-between items-center">
                          Запись #{index + 1}
                          {newItems.length > 1 && (
                            <button type="button" onClick={() => { playSound("delete"); if (newItems.length > 1) setNewItems(newItems.filter((_, i) => i !== index)); }} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1 rounded transition-colors" title="Удалить"><X size={16} /></button>
                          )}
                        </h3>
                        <div className="space-y-3">
                          <input required placeholder="Название" value={item.title} onChange={e => { const upd = [...newItems]; upd[index].title = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                          <input placeholder="Символ (текст)" value={item.symbol || ""} onChange={e => { const upd = [...newItems]; upd[index].symbol = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                          <select value={item.category} onChange={e => { const upd = [...newItems]; upd[index].category = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                             {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                          </select>
                          <select value={item.dangerLevel || "Низкий"} onChange={e => { const upd = [...newItems]; upd[index].dangerLevel = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                             <option value="Низкий">Уровень: Низкий</option><option value="Средний">Уровень: Средний</option><option value="Высокий">Уровень: Высокий</option><option value="Смертельный">Уровень: Смертельный</option>
                          </select>
                          <textarea required placeholder="Описание (Markdown)" value={item.description} onChange={e => { const upd = [...newItems]; upd[index].description = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none h-20 font-mono text-sm" />
                          <div className="mt-2 border-t border-[#5c3a21] pt-3">
                            <label className="block text-xs font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-1"><ImageIcon size={14}/> Картинка (до 2МБ)</label>
                            {!item.image ? (
                              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if(!file) return; const reader = new FileReader(); reader.onloadend = () => { const upd = [...newItems]; upd[index].image = reader.result as string; setNewItems(upd); }; reader.readAsDataURL(file); }} className="w-full text-sm text-[#8c6e52] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#3d2617] file:text-[#e6d5b8] hover:file:bg-[#5c3a21] file:cursor-pointer" />
                            ) : (
                              <div className="relative inline-block border-2 border-[#5c3a21] rounded-lg overflow-hidden" style={{ backgroundColor: '#d6c5b3' }}>
                                <img src={item.image} alt="Preview" className="h-32 object-contain p-2" />
                                <button type="button" onClick={() => { const upd = [...newItems]; upd[index].image = ""; setNewItems(upd); }} className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors"><X size={14} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button type="button" onClick={() => { playSound("click"); setNewItems([...newItems, { ...INITIAL_NEW_ITEM }]); }} className="px-4 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#5c3a21] transition-colors shadow-lg flex items-center gap-2"><Plus size={18}/> Добавить ещё</button>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Сохранить всё</button>
                    </div>
                  </form>
                )}

                {/* ИМПОРТ/ЭКСПОРТ */}
                {adminTab === "bulk" && (
                  <div className="space-y-8 max-w-2xl">
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Upload size={18}/> Массовый импорт (JSON)</h3>
                      <textarea placeholder="[ { ... } ]" value={bulkJson} onChange={e => setBulkJson(e.target.value)} className="w-full p-3 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] font-mono text-sm focus:border-[#a37c49] outline-none h-48" />
                      <button onClick={async () => {
                        if(!user) return;
                        playSound("save");
                        try {
                          const parsed = JSON.parse(bulkJson);
                          const itemsWithAuthor = parsed.map((i: any) => ({ ...i, authorName: user.account_name, authorRole: user.role }));
                          const res = await fetch("/api/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemsWithAuthor) });
                          if (res.ok) { const r = await res.json(); alert(`Добавлено ${r.count} записей!`); setBulkJson(""); fetchArchive(1); }
                        } catch(e) { alert("Ошибка JSON"); }
                      }} className="mt-4 px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Импортировать</button>
                    </div>
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Download size={18}/> Экспорт</h3>
                      <button onClick={handleExport} className="px-6 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#5c3a21] transition-colors shadow-lg">Скачать JSON</button>
                    </div>
                  </div>
                )}

                {/* АККАУНТЫ */}
                {adminTab === "users" && (
                  <div className="space-y-10 font-sans">
                    <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
                      <input required placeholder="Название аккаунта" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                      <div className="flex items-center gap-2"><input required={!autoUser} placeholder="Логин" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label></div>
                      <div className="flex items-center gap-2"><input required={!autoPass} placeholder="Пароль" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label></div>
                      <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                         <option value="low">Лоу Стафф</option><option value="high">Хай Стафф</option><option value="guardian">Хранитель</option><option value="creator">Создатель Сервера</option>
                      </select>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Сгенерировать</button>
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
                                <td className="p-3">{(user.role === "owner" || user.role === "creator") && u.id !== user.id && (<button onClick={() => handleDeleteUser(u.id, u.account_name)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors"><Trash2 size={16} /></button>)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ЛОГИ */}
                {adminTab === "logs" && (user.role === "owner" || user.role === "creator") && (
                  <div>
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

                {/* ДИАГНОСТИКА */}
                {adminTab === "diag" && (
                  <div className="max-w-xl font-sans">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Database size={18}/> Проверка</h3>
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

      <div className="fixed bottom-4 right-4 z-[100] bg-[#1c110b]/70 backdrop-blur-sm border border-[#5c3a21]/40 px-3 py-1.5 rounded-md text-[11px] text-[#8c6e52]/70 font-pixeloid-mono hover:text-[#a37c49] hover:bg-[#2e1b13] transition-all cursor-default select-none shadow-sm">
        Автор: muruh1ta
      </div>
    </main>
  );
}
