"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings, Database, Activity, ShieldAlert, Download, Upload } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  symbol?: string; 
  dangerLevel?: string;
};

type DbArchiveItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  symbol: string | null;
  danger_level: string | null;
};

type User = {
  id: number;
  username: string;
  account_name: string;
  role: "owner" | "creator" | "guardian" | "high" | "low";
};

type DbUser = {
  id: number;
  username: string;
  account_name: string;
  role: string;
  plain_password: string | null;
};

type NewArchiveItem = Omit<ArchiveItem, "id">;

const CATEGORIES = ["Все", "Комбинации Цифр", "Слова", "Термины", "Комбинации Букв", "Другое"];

const ROLES_MAP: Record<string, { name: string, level: number, color: string }> = {
  owner: { name: "Овнер (Dev)", level: 4, color: "text-red-500 border-red-500" },
  creator: { name: "Создатель Сервера", level: 3, color: "text-purple-500 border-purple-500" },
  guardian: { name: "Хранитель", level: 2, color: "text-blue-500 border-blue-500" },
  high: { name: "Хай Стафф", level: 1, color: "text-green-500 border-green-500" },
  low: { name: "Лоу Стафф", level: 0, color: "text-gray-400 border-gray-400" },
};

const INITIAL_NEW_ITEM: NewArchiveItem = { title: "", category: "Комбинации Цифр", description: "", symbol: "", dangerLevel: "Низкий" };

export default function TavernArchive() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Admin State
  const [newItems, setNewItems] = useState<NewArchiveItem[]>([{ ...INITIAL_NEW_ITEM }]); // МАССИВ ЗАПИСЕЙ
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  
  const [bulkJson, setBulkJson] = useState(""); 
  
  const [adminTab, setAdminTab] = useState<"archive" | "bulk" | "users" | "diag">("archive");
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [diagResult, setDiagResult] = useState<{ status: string, latency?: number, message: string } | null>(null);

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

  const fetchArchive = async () => {
    try {
      const res = await fetch("/api/archive");
      const dbData = await res.json();
      const formatted = (dbData as DbArchiveItem[]).map((item) => ({
        id: item.id, title: item.title, category: item.category, description: item.description,
        symbol: item.symbol || undefined, dangerLevel: item.danger_level || undefined
      }));
      setData(formatted);
    } catch (error) {
      console.error("Ошибка загрузки архива", error);
    }
  };

  useEffect(() => {
    if (user) fetchArchive();
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data);
        setLoginUser(""); 
        setLoginPass("");
        const expiresAt = Date.now() + (5 * 60 * 60 * 1000); 
        localStorage.setItem("tavern_session", JSON.stringify({ userData: data, expiresAt }));
      } else {
        setLoginError(data.error || "Ошибка входа");
      }
    } catch { 
      setLoginError("Ошибка соединения с сервером"); 
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tavern_session");
    setView("home");
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
    const finalUsername = autoUser ? generateRandom(15) : newAcc.username;
    const finalPassword = autoPass ? generateRandom(15) : newAcc.password;

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAcc, username: finalUsername, password: finalPassword, requesterRole: user.role })
    });

    if (res.ok) {
      alert(`Аккаунт создан!\nЛогин: ${finalUsername}\nПароль: ${finalPassword}`);
      setNewAcc({ account_name: "", username: "", password: "", role: "low" });
      setAutoUser(false); setAutoPass(false);
      fetchUsers();
    } else { 
      const err = await res.json(); 
      alert(err.error); 
    }
  };

  const handleDeleteUser = async (id: number, targetName: string) => {
    if (!user) return;
    if (!confirm(`Вы уверены, что хотите удалить аккаунт "${targetName}"?`)) return;
    
    const res = await fetch(`/api/admin/users?id=${id}&requesterRole=${user.role}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  // === МУЛЬТИ-ДОБАВЛЕНИЕ ===
  const handleAddMultipleItems = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Фильтруем пустые формы (если пользователь добавил поле, но ничего не написал)
    const validItems = newItems.filter(item => item.title.trim() !== "" && item.description.trim() !== "");
    
    if (validItems.length === 0) {
      return alert("Заполните хотя бы одну запись (Название и Описание)");
    }

    const res = await fetch("/api/archive", {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(validItems)
    });
    
    if (res.ok) { 
      const result = await res.json();
      alert(`Успешно добавлено ${result.count} записей!`);
      fetchArchive(); 
      setNewItems([{ ...INITIAL_NEW_ITEM }]); // Очищаем форму
    } else {
      alert("Ошибка при сохранении");
    }
  };

  const handleNewItemChange = (index: number, field: keyof NewArchiveItem, value: string) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  const addNewItemField = () => {
    setNewItems([...newItems, { ...INITIAL_NEW_ITEM }]);
  };

  const removeNewItemField = (index: number) => {
    if (newItems.length === 1) return; // Не даем удалить последнее поле
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  // === ИМПОРТ ИЗ JSON ===
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON должен быть массивом");
      
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(`Успешно добавлено ${result.count} записей!`);
        setBulkJson("");
        fetchArchive();
      } else {
        alert("Ошибка при импорте данных");
      }
    } catch (error) {
      alert("Ошибка формата JSON. Проверьте синтаксис.");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/archive");
      const dbData = await res.json();
      
      const exportData = dbData.map((item: DbArchiveItem) => ({
        title: item.title,
        category: item.category,
        description: item.description,
        symbol: item.symbol,
        dangerLevel: item.danger_level
      }));

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tavern_archive_export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при экспорте");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await fetch(`/api/archive?id=${id}`, { method: "DELETE" });
    fetchArchive();
  };

  const fetchUsers = async () => {
    if (!user) return;
    const res = await fetch(`/api/admin/users?role=${user.role}`);
    if (res.ok) setUsersList(await res.json());
  };

  const runDiagnostics = async () => {
    setDiagResult(null);
    const res = await fetch("/api/admin/diagnostics");
    setDiagResult(await res.json());
  };

  useEffect(() => {
    if (view === "admin" && adminTab === "users") fetchUsers();
  }, [view, adminTab]);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ArchiveCard = ({ item }: { item: ArchiveItem }) => (
    <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:border-[#a37c49] hover:shadow-[0_4px_25px_rgba(163,124,73,0.2)] transition-all duration-300 group flex flex-col relative z-10">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] tracking-wide">{item.title}</h3>
        {item.symbol && <span className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] bg-[#1c110b] px-3 py-1 rounded border border-[#5c3a21] shadow-inner">{item.symbol}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
        <span className="inline-block px-3 py-1 text-xs font-bold font-pixeloid-mono bg-[#1c110b] text-[#a37c49] rounded border border-[#5c3a21] uppercase tracking-wider">{item.category}</span>
        {item.dangerLevel && (
           <span className="inline-block px-2 py-1 text-xs font-bold font-pixeloid-mono rounded border border-red-900/50 bg-red-900/20 text-red-400 uppercase tracking-wider">
             {item.dangerLevel}
           </span>
        )}
        {user && ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
          <button onClick={() => handleDeleteItem(item.id)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors"><Trash2 size={16} /></button>
        )}
      </div>
      <p className="text-[#c4b5a5] font-sans leading-relaxed flex-grow relative z-10">{item.description}</p>
    </div>
  );

  if (isCheckingAuth) {
    return <main className="min-h-screen bg-[#160d08]"></main>;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#160d08] text-[#e6d5b8] font-sans">
      
      <div className="magic-particles">
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none animate-bg-pulse" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #a37c49 0%, transparent 70%)" }}></div>

      {!user && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-8 pt-0 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-full max-w-md animate-fade-in relative mt-16">
            
            <div className="flex justify-center -mt-16 mb-4 relative">
              <div className="absolute inset-0 bg-[#a37c49] blur-2xl opacity-20 rounded-full"></div>
              <img 
                src="/logo.png" 
                alt="Сытый Лис" 
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-[#5c3a21] shadow-2xl relative z-10 animate-float bg-[#1c110b]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-[#1c110b] rounded-full border-4 border-[#5c3a21] text-[#a37c49] shadow-2xl relative z-10 animate-float"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-keyhole"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg></div>';
                }}
              />
            </div>

            <h1 className="text-3xl font-bold font-pixeloid-mono text-center mb-2 text-[#a37c49] tracking-widest uppercase flex justify-center items-center gap-2">
               <Flame /> Сытый Лис
            </h1>
            <p className="text-center text-[#8c6e52] mb-8 font-sans">Вход в закрытый архив</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Логин</label>
                <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Пароль</label>
                <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" />
              </div>
              
              {loginError && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{loginError}</p>}
              
              <button type="submit" className="w-full py-3 bg-[#5c3a21] hover:bg-[#7a4f2e] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono text-lg rounded shadow-lg transition-all">
                Войти
              </button>
            </form>
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#2e1b13]/90 backdrop-blur-sm border border-[#5c3a21] px-4 py-2 rounded-lg shadow-lg">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold font-pixeloid-mono text-[#e6d5b8]">{user.account_name}</span>
                <span className={`text-xs font-bold font-pixeloid-mono ${ROLES_MAP[user.role]?.color.split(' ')[0] || "text-white"}`}>
                  {ROLES_MAP[user.role]?.name || user.role}
                </span>
              </div>
              {ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
                <button onClick={() => setView("admin")} className="p-2 bg-[#1c110b] border border-[#5c3a21] rounded hover:bg-[#a37c49] hover:text-[#160d08] transition-colors" title="Админ-панель">
                  <Settings size={18} />
                </button>
              )}
              <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Выйти">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
            
            <header className="flex justify-center items-center mb-12 cursor-pointer group" onClick={() => setView("home")}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#a37c49] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                <img 
                  src="/logo.png" 
                  alt="Сытый Лис" 
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-[#5c3a21] group-hover:border-[#a37c49] transition-colors duration-300 shadow-2xl relative z-10 animate-float bg-[#1c110b]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<h1 class="text-4xl font-bold font-pixeloid-mono text-[#a37c49] animate-float flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Сытый Лис</h1>';
                  }}
                />
              </div>
            </header>

            {view === "home" && (
              <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
                <h2 className="text-4xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 drop-shadow-lg">Запретный Архив</h2>
                <div className="relative w-full max-w-2xl mb-8 group">
                  <input type="text" placeholder="Искать в свитках..." value={searchQuery} onChange={handleSearchChange} className="w-full p-4 pl-12 bg-[#2e1b13]/90 backdrop-blur-sm border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono focus:border-[#a37c49] transition-colors shadow-xl placeholder-[#6b513b]" />
                  <Search className="absolute left-4 top-4 text-[#6b513b] group-focus-within:text-[#a37c49] transition-colors" size={24} />
                </div>
                
                {searchQuery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in text-left">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                  </div>
                ) : (
                  <button onClick={() => setView("archive")} className="mt-8 px-10 py-4 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono text-xl rounded-lg shadow-[0_4px_0_#2e1b13] hover:shadow-[0_0_20px_rgba(163,124,73,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group tracking-widest uppercase">
                    <ScrollText size={24} className="group-hover:rotate-12 transition-transform duration-300" /> Открыть все свитки
                  </button>
                )}
              </div>
            )}

            {view === "archive" && (
              <div className="animate-fade-in w-full text-left">
                 <button onClick={() => setView("home")} className="mb-6 flex items-center gap-2 text-[#8c6e52] hover:text-[#a37c49] transition-colors font-pixeloid-mono"><ChevronLeft size={20}/> На главную</button>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map(c => <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 ${selectedCategory === c ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>{c}</button>)}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                 </div>
              </div>
            )}

            {view === "admin" && ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
              <div className="animate-fade-in w-full bg-[#2e1b13] p-8 rounded-xl border-double border-4 border-[#5c3a21] shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-[#5c3a21] pb-4">
                   <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] drop-shadow-md">Панель Управления</h2>
                   <button onClick={() => setView("home")} className="text-sm font-pixeloid-mono text-[#8c6e52] hover:text-[#e6d5b8] transition-colors">На главную</button>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 font-pixeloid-mono">
                  <button onClick={() => setAdminTab("archive")} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'archive' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><ScrollText size={18}/> Добавить</button>
                  <button onClick={() => setAdminTab("bulk")} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'bulk' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Upload size={18}/> Импорт/Экспорт</button>
                  <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'users' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Users size={18}/> Аккаунты</button>
                  <button onClick={() => setAdminTab("diag")} className={`px-4 py-2 rounded flex items-center gap-2 transition-all ${adminTab === 'diag' ? 'bg-[#5c3a21] text-[#e6d5b8] shadow-lg border border-[#a37c49]' : 'bg-transparent text-[#8c6e52] border border-transparent hover:text-[#e6d5b8]'}`}><Activity size={18}/> Диагностика</button>
                </div>

                {adminTab === "archive" && (
                  <form onSubmit={handleAddMultipleItems} className="space-y-6 max-w-xl font-sans">
                    {newItems.map((item, index) => (
                      <div key={index} className="p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg relative shadow-inner">
                        <h3 className="text-sm font-bold font-pixeloid-mono text-[#a37c49] mb-3 flex justify-between items-center">
                          Запись #{index + 1}
                          {newItems.length > 1 && (
                            <button type="button" onClick={() => removeNewItemField(index)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1 rounded transition-colors" title="Удалить эту форму">
                              <X size={16} />
                            </button>
                          )}
                        </h3>

                        <div className="space-y-3">
                          <input required placeholder="Название" value={item.title} onChange={e => handleNewItemChange(index, "title", e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                          <input placeholder="Символ (текст)" value={item.symbol || ""} onChange={e => handleNewItemChange(index, "symbol", e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                          
                          <select value={item.category} onChange={e => handleNewItemChange(index, "category", e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                             {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                          </select>

                          <select value={item.dangerLevel || "Низкий"} onChange={e => handleNewItemChange(index, "dangerLevel", e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                             <option value="Низкий">Уровень: Низкий</option>
                             <option value="Средний">Уровень: Средний</option>
                             <option value="Высокий">Уровень: Высокий</option>
                             <option value="Смертельный">Уровень: Смертельный</option>
                          </select>

                          <textarea required placeholder="Описание" value={item.description} onChange={e => handleNewItemChange(index, "description", e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none h-20" />
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-4">
                      <button type="button" onClick={addNewItemField} className="px-4 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#5c3a21] transition-colors shadow-lg flex items-center gap-2">
                        <Plus size={18}/> Добавить ещё
                      </button>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">
                        Сохранить всё
                      </button>
                    </div>
                  </form>
                )}

                {adminTab === "bulk" && (
                  <div className="space-y-8 max-w-2xl">
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Upload size={18}/> Массовый импорт (JSON)</h3>
                      <p className="text-[#8c6e52] mb-4 text-sm font-sans">Вставьте JSON массив записей в формате:</p>
                      <pre className="text-xs text-[#a37c49] bg-[#160d08] p-3 rounded mb-4 overflow-x-auto font-mono">
{`[
  {
    "title": "Название",
    "category": "Комбинации Цифр",
    "description": "Описание",
    "symbol": "1/11",
    "dangerLevel": "Высокий"
  }
]`}
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

                {adminTab === "users" && (
                  <div className="space-y-10 font-sans">
                    <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
                      <input required placeholder="Название аккаунта (Никнейм)" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                      <div className="flex items-center gap-2">
                        <input required={!autoUser} placeholder="Логин" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" />
                        <label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input required={!autoPass} placeholder="Пароль" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" />
                        <label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label>
                      </div>
                      <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none cursor-pointer">
                         <option value="low">Лоу Стафф</option>
                         <option value="high">Хай Стафф</option>
                         <option value="guardian">Хранитель</option>
                         <option value="creator">Создатель Сервера</option>
                      </select>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] transition-colors shadow-lg">Сгенерировать</button>
                    </form>

                    <div>
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Users size={18}/> Список доступных аккаунтов</h3>
                      <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#1c110b]">
                            <tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono text-sm">
                              <th className="p-3">Имя</th>
                              <th className="p-3">Роль</th>
                              <th className="p-3">Логин</th>
                              <th className="p-3">Пароль</th>
                              <th className="p-3">Действие</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersList.map(u => (
                              <tr key={u.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                                <td className="p-3 font-medium">{u.account_name}</td>
                                <td className={`p-3 text-sm font-bold font-pixeloid-mono ${ROLES_MAP[u.role]?.color.split(' ')[0] || "text-white"}`}>{ROLES_MAP[u.role]?.name || u.role}</td>
                                <td className="p-3 font-mono text-[#c4b5a5]">{u.username}</td>
                                <td className="p-3 font-mono text-red-400 bg-red-500/5">{u.plain_password || "********"}</td>
                                <td className="p-3">
                                  {(user.role === "owner" || user.role === "creator") && u.id !== user.id && (
                                    <button onClick={() => handleDeleteUser(u.id, u.account_name)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors" title="Удалить аккаунт">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {usersList.length === 0 && (
                              <tr><td colSpan={5} className="text-center p-6 text-[#8c6e52]">Нет доступных аккаунтов</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === "diag" && (
                  <div className="max-w-xl font-sans">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Database size={18}/> Проверка системы</h3>
                    <p className="text-[#8c6e52] mb-6">Нажмите кнопку ниже, чтобы проверить подключение к базе данных Turso и замерить пинг.</p>
                    
                    <button onClick={runDiagnostics} className="px-6 py-3 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded-lg hover:bg-[#7a4f2e] flex items-center gap-2 mb-6 shadow-lg transition-colors">
                      <Activity size={18}/> Запустить тест
                    </button>

                    {diagResult && (
                      <div className={`p-6 rounded-xl border ${diagResult.status === 'ok' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          {diagResult.status === 'ok' ? <ShieldAlert className="text-green-500" /> : <Skull className="text-red-500" />}
                          <h4 className={`text-xl font-bold font-pixeloid-mono ${diagResult.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {diagResult.status === 'ok' ? 'Система в норме' : 'Ошибка подключения'}
                          </h4>
                        </div>
                        <p className="text-[#e6d5b8] mb-2">{diagResult.message}</p>
                        {diagResult.latency !== undefined && (
                          <p className="text-sm text-[#8c6e52] font-mono">Пинг до базы: {diagResult.latency} мс</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
