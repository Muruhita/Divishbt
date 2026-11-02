"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  symbol?: string; 
  dangerLevel?: string;
};

// Тип для сырых данных из БД (Turso)
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

const CATEGORIES = ["Все", "Символы", "Термины", "Высказывания", "Комбинации", "Опасные артефакты"];

const ROLES_MAP: Record<string, { name: string, level: number, color: string }> = {
  owner: { name: "Овнер (Dev)", level: 4, color: "text-red-500 border-red-500" },
  creator: { name: "Создатель Сервера", level: 3, color: "text-purple-500 border-purple-500" },
  guardian: { name: "Хранитель", level: 2, color: "text-blue-500 border-blue-500" },
  high: { name: "Хай Стафф", level: 1, color: "text-green-500 border-green-500" },
  low: { name: "Лоу Стафф", level: 0, color: "text-gray-400 border-gray-400" },
};

export default function TavernArchive() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Admin State
  const [newItem, setNewItem] = useState({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" });
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  const [adminTab, setAdminTab] = useState<"archive" | "users">("archive");

  // Загрузка архива из БД
  const fetchArchive = async () => {
    const res = await fetch("/api/archive");
    const dbData = await res.json();
    
    // Мапим поля, используя строгий тип DbArchiveItem
    const formatted = (dbData as DbArchiveItem[]).map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      symbol: item.symbol || undefined,
      dangerLevel: item.danger_level || undefined
    }));
    setData(formatted);
  };

  useEffect(() => {
    fetchArchive();
  }, []);

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
        setShowLogin(false);
        setLoginUser("");
        setLoginPass("");
      } else {
        setLoginError(data.error);
      }
    } catch {
      // Убрали переменную err, чтобы не было ошибки линтера
      setLoginError("Ошибка соединения с сервером");
    }
  };

  const generateRandom = (length = 15) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
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
      body: JSON.stringify({
        ...newAcc,
        username: finalUsername,
        password: finalPassword,
        requesterRole: user.role
      })
    });

    if (res.ok) {
      alert(`Аккаунт создан!\nЛогин: ${finalUsername}\nПароль: ${finalPassword}`);
      setNewAcc({ account_name: "", username: "", password: "", role: "low" });
      setAutoUser(false);
      setAutoPass(false);
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      fetchArchive(); 
      setNewItem({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await fetch(`/api/archive?id=${id}`, { method: "DELETE" });
    fetchArchive();
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ArchiveCard = ({ item }: { item: ArchiveItem }) => (
    <div className="bg-[#2A1B14]/90 backdrop-blur-sm border-2 border-[#5C4033] p-6 rounded-2xl shadow-lg hover:border-[#E5B85C] hover:shadow-[0_0_20px_rgba(229,184,92,0.15)] transition-all duration-300 group flex flex-col relative overflow-hidden animate-fade-in z-10">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="text-xl font-bold text-[#E5B85C]">{item.title}</h3>
        {item.symbol && <span className="text-2xl font-bold text-[#E5B85C] bg-[#1a1512] px-2 py-1 rounded border border-[#5C4033]">{item.symbol}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1F1510] text-[#A89B8F] rounded-md border border-[#5C4033]">{item.category}</span>
        {item.dangerLevel && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md border text-orange-500 border-orange-500/30 bg-orange-500/10">{item.dangerLevel}</span>}
        {user && ROLES_MAP[user.role].level >= 1 && (
          <button onClick={() => handleDeleteItem(item.id)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
        )}
      </div>
      <p className="text-[#C7B8A9] leading-relaxed flex-grow relative z-10">{item.description}</p>
    </div>
  );

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1f1814] text-[#F3E8D6] font-sans">
      
      {/* Анимации фона */}
      <div className="magic-particles">
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none animate-bg-pulse" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #E5B85C 0%, transparent 70%)" }}></div>

      {/* ШАПКА ПРОФИЛЯ / ВХОД */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-[#2A1B14] border border-[#E5B85C] px-4 py-2 rounded-xl shadow-lg">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-[#F3E8D6]">{user.account_name}</span>
              <span className={`text-xs font-bold ${ROLES_MAP[user.role].color.split(' ')[0]}`}>{ROLES_MAP[user.role].name}</span>
            </div>
            {ROLES_MAP[user.role].level >= 1 && (
              <button onClick={() => setView("admin")} className="p-2 bg-[#3A271E] rounded hover:bg-[#E5B85C] hover:text-black transition-colors" title="Админ-панель">
                <Settings size={18} />
              </button>
            )}
            <button onClick={() => setUser(null)} className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="px-6 py-2 bg-[#2A1B14] border-2 border-[#E5B85C] text-[#E5B85C] font-bold rounded-xl hover:bg-[#E5B85C] hover:text-[#1a1512] transition-colors">
            Войти
          </button>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВХОДА */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#2A1B14] border-2 border-[#E5B85C] p-8 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-[#A89B8F] hover:text-white"><X size={24} /></button>
            <div className="flex justify-center mb-6 text-[#E5B85C]"><LockKeyhole size={48} /></div>
            <h2 className="text-2xl font-bold text-center mb-6 text-[#E5B85C]">Авторизация</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Логин" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
              <input type="password" placeholder="Пароль" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#E5B85C] text-[#1a1512] font-bold rounded-lg hover:bg-[#F2D18B]">Войти</button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        {/* Логотип */}
        <header className="flex justify-center mb-10 cursor-pointer" onClick={() => setView("home")}>
           <h1 className="text-4xl font-bold text-[#E5B85C] tracking-widest uppercase flex items-center gap-2">
             <Flame /> Сытый Лис
           </h1>
        </header>

        {/* ГЛАВНАЯ */}
        {view === "home" && (
          <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
            <h2 className="text-4xl font-bold mb-4">Запретный Архив</h2>
            <div className="relative w-full max-w-2xl mb-8">
              <input type="text" placeholder="Поиск..." value={searchQuery} onChange={handleSearchChange} className="w-full p-4 pl-12 bg-[#2A1B14] border-2 border-[#5C4033] rounded-xl text-white focus:border-[#E5B85C]" />
              <Search className="absolute left-4 top-4 text-gray-500" size={24} />
            </div>
            
            {searchQuery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
              </div>
            ) : (
              <button onClick={() => setView("archive")} className="px-10 py-4 bg-[#E5B85C] text-[#1a1512] font-bold rounded-xl shadow-[0_6px_0_#9C7330] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
                <ScrollText size={20} /> Открыть архив
              </button>
            )}
          </div>
        )}

        {/* АРХИВ */}
        {view === "archive" && (
          <div className="animate-fade-in w-full">
             <button onClick={() => setView("home")} className="mb-6 flex items-center gap-2 text-[#A89B8F] hover:text-white"><ChevronLeft size={20}/> Назад</button>
             <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(c => <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-lg border-2 ${selectedCategory === c ? 'bg-[#E5B85C] text-black border-[#E5B85C]' : 'border-[#5C4033] text-[#A89B8F]'}`}>{c}</button>)}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
             </div>
          </div>
        )}

        {/* АДМИН-ПАНЕЛЬ */}
        {view === "admin" && user && ROLES_MAP[user.role].level >= 1 && (
          <div className="animate-fade-in w-full bg-[#2A1B14] p-8 rounded-2xl border border-[#5C4033]">
            <div className="flex justify-between items-center mb-8 border-b border-[#4a3424] pb-4">
               <h2 className="text-2xl font-bold text-[#E5B85C]">Панель Управления</h2>
               <button onClick={() => setView("home")} className="text-sm text-gray-400 hover:text-white">Выйти на главную</button>
            </div>

            <div className="flex gap-4 mb-6">
              <button onClick={() => setAdminTab("archive")} className={`px-4 py-2 rounded ${adminTab === 'archive' ? 'bg-[#5C4033]' : 'bg-transparent text-gray-500'}`}>Управление Архивом</button>
              <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded ${adminTab === 'users' ? 'bg-[#5C4033]' : 'bg-transparent text-gray-500'}`}>Генератор Аккаунтов</button>
            </div>

            {/* УПРАВЛЕНИЕ АРХИВОМ */}
            {adminTab === "archive" && (
              <form onSubmit={handleAddItem} className="space-y-4 max-w-xl">
                <h3 className="text-lg font-bold text-[#E5B85C]">Добавить запись</h3>
                <input required placeholder="Название" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                <input placeholder="Символ (текст)" value={newItem.symbol} onChange={e => setNewItem({...newItem, symbol: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white">
                   {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea required placeholder="Описание" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white h-24" />
                <button type="submit" className="px-6 py-2 bg-[#E5B85C] text-black font-bold rounded">Сохранить в БД</button>
              </form>
            )}

            {/* ГЕНЕРАТОР АККАУНТОВ */}
            {adminTab === "users" && (
              <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl">
                <h3 className="text-lg font-bold text-[#E5B85C] flex items-center gap-2"><Users size={18}/> Создать новый аккаунт</h3>
                
                <input required placeholder="Название аккаунта (Никнейм)" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                
                <div className="flex items-center gap-2">
                  <input required={!autoUser} placeholder="Логин (до 30 символов)" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white disabled:opacity-50" />
                  <label className="flex items-center gap-1 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label>
                </div>

                <div className="flex items-center gap-2">
                  <input required={!autoPass} placeholder="Пароль (до 30 символов)" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white disabled:opacity-50" />
                  <label className="flex items-center gap-1 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label>
                </div>

                <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white">
                   <option value="low">Лоу Стафф</option>
                   <option value="high">Хай Стафф</option>
                   <option value="guardian">Хранитель</option>
                   <option value="creator">Создатель Сервера</option>
                </select>

                <button type="submit" className="px-6 py-2 bg-[#E5B85C] text-black font-bold rounded">Сгенерировать аккаунт</button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
