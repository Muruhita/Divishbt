"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings, Database, Activity, ShieldAlert } from "lucide-react";

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
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Admin State
  const [newItem, setNewItem] = useState({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" });
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  const [adminTab, setAdminTab] = useState<"archive" | "users" | "diag">("archive");
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [diagResult, setDiagResult] = useState<{ status: string, latency?: number, message: string } | null>(null);

  // Загрузка архива
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

  // ФУНКЦИЯ ПОИСКА (Которой не хватало)
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
        setLoginUser(""); setLoginPass("");
      } else {
        setLoginError(data.error || "Ошибка входа");
      }
    } catch { 
      setLoginError("Ошибка соединения с сервером"); 
    }
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
      fetchUsers(); // Обновляем список
    } else { 
      const err = await res.json(); 
      alert(err.error); 
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/archive", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem)
    });
    if (res.ok) { fetchArchive(); setNewItem({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" }); }
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
    <div className="bg-[#2A1B14]/90 backdrop-blur-sm border-2 border-[#5C4033] p-6 rounded-2xl shadow-lg hover:border-[#E5B85C] transition-all duration-300 group flex flex-col relative z-10">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="text-xl font-bold text-[#E5B85C]">{item.title}</h3>
        {item.symbol && <span className="text-2xl font-bold text-[#E5B85C] bg-[#1a1512] px-2 py-1 rounded border border-[#5C4033]">{item.symbol}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1F1510] text-[#A89B8F] rounded-md border border-[#5C4033]">{item.category}</span>
        {item.dangerLevel && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md border text-orange-500 border-orange-500/30 bg-orange-500/10">{item.dangerLevel}</span>}
        {user && ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
          <button onClick={() => handleDeleteItem(item.id)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
        )}
      </div>
      <p className="text-[#C7B8A9] leading-relaxed flex-grow relative z-10">{item.description}</p>
    </div>
  );

  // ==========================================
  // ЭКРАН АВТОРИЗАЦИИ
  // ==========================================
  if (!user) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-[#1f1814] text-[#F3E8D6] font-sans flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #E5B85C 0%, transparent 70%)" }}></div>
        
        <div className="bg-[#2A1B14] border-2 border-[#E5B85C] p-8 rounded-2xl shadow-[0_0_50px_rgba(229,184,92,0.1)] w-full max-w-md relative z-10 animate-fade-in">
          <div className="flex justify-center mb-6 text-[#E5B85C]"><LockKeyhole size={64} /></div>
          <h1 className="text-3xl font-bold text-center mb-2 text-[#E5B85C] tracking-widest uppercase">Сытый Лис</h1>
          <p className="text-center text-[#A89B8F] mb-8">Вход в закрытый архив</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#A89B8F] mb-1">Логин</label>
              <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A89B8F] mb-1">Пароль</label>
              <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none transition-colors" />
            </div>
            
            {loginError && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{loginError}</p>}
            
            <button type="submit" className="w-full py-4 bg-[#E5B85C] text-[#1a1512] font-bold text-lg rounded-lg shadow-[0_4px_0_#9C7330] hover:translate-y-1 hover:shadow-none transition-all">
              Войти
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ==========================================
  // ОСНОВНОЙ САЙТ
  // ==========================================
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1f1814] text-[#F3E8D6] font-sans">
      
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <div className="flex items-center gap-3 bg-[#2A1B14] border border-[#E5B85C] px-4 py-2 rounded-xl shadow-lg">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-[#F3E8D6]">{user.account_name}</span>
            <span className={`text-xs font-bold ${ROLES_MAP[user.role]?.color.split(' ')[0] || "text-white"}`}>
              {ROLES_MAP[user.role]?.name || user.role}
            </span>
          </div>
          {ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
            <button onClick={() => setView("admin")} className="p-2 bg-[#3A271E] rounded hover:bg-[#E5B85C] hover:text-black transition-colors" title="Админ-панель">
              <Settings size={18} />
            </button>
          )}
          <button onClick={() => setUser(null)} className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        <header className="flex justify-center mb-10 cursor-pointer" onClick={() => setView("home")}>
           <h1 className="text-4xl font-bold text-[#E5B85C] tracking-widest uppercase flex items-center gap-2">
             <Flame /> Сытый Лис
           </h1>
        </header>

        {view === "home" && (
          <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
            <h2 className="text-4xl font-bold mb-4">Запретный Архив</h2>
            <div className="relative w-full max-w-2xl mb-8">
              <input type="text" placeholder="Поиск..." value={searchQuery} onChange={handleSearchChange} className="w-full p-4 pl-12 bg-[#2A1B14] border-2 border-[#5C4033] rounded-xl text-white focus:border-[#E5B85C] transition-colors" />
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

        {view === "archive" && (
          <div className="animate-fade-in w-full">
             <button onClick={() => setView("home")} className="mb-6 flex items-center gap-2 text-[#A89B8F] hover:text-white"><ChevronLeft size={20}/> Назад</button>
             <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(c => <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedCategory === c ? 'bg-[#E5B85C] text-black border-[#E5B85C]' : 'border-[#5C4033] text-[#A89B8F] hover:border-[#E5B85C]'}`}>{c}</button>)}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
             </div>
          </div>
        )}

        {view === "admin" && ROLES_MAP[user.role] && ROLES_MAP[user.role].level >= 1 && (
          <div className="animate-fade-in w-full bg-[#2A1B14] p-8 rounded-2xl border border-[#5C4033] shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-[#4a3424] pb-4">
               <h2 className="text-2xl font-bold text-[#E5B85C]">Панель Управления</h2>
               <button onClick={() => setView("home")} className="text-sm text-gray-400 hover:text-white">Выйти на главную</button>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <button onClick={() => setAdminTab("archive")} className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${adminTab === 'archive' ? 'bg-[#5C4033] text-white' : 'bg-transparent text-gray-500 hover:text-gray-300'}`}><ScrollText size={18}/> Архив</button>
              <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${adminTab === 'users' ? 'bg-[#5C4033] text-white' : 'bg-transparent text-gray-500 hover:text-gray-300'}`}><Users size={18}/> Аккаунты</button>
              <button onClick={() => setAdminTab("diag")} className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${adminTab === 'diag' ? 'bg-[#5C4033] text-white' : 'bg-transparent text-gray-500 hover:text-gray-300'}`}><Activity size={18}/> Диагностика</button>
            </div>

            {adminTab === "archive" && (
              <form onSubmit={handleAddItem} className="space-y-4 max-w-xl">
                <h3 className="text-lg font-bold text-[#E5B85C]">Добавить запись</h3>
                <input required placeholder="Название" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                <input placeholder="Символ (текст)" value={newItem.symbol} onChange={e => setNewItem({...newItem, symbol: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white">
                   {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea required placeholder="Описание" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white h-24" />
                <button type="submit" className="px-6 py-2 bg-[#E5B85C] text-black font-bold rounded hover:bg-[#F2D18B]">Сохранить в БД</button>
              </form>
            )}

            {adminTab === "users" && (
              <div className="space-y-10">
                <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl bg-[#1f1814] p-6 rounded-xl border border-[#4a3424]">
                  <h3 className="text-lg font-bold text-[#E5B85C] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
                  <input required placeholder="Название аккаунта (Никнейм)" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white" />
                  <div className="flex items-center gap-2">
                    <input required={!autoUser} placeholder="Логин" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white disabled:opacity-50" />
                    <label className="flex items-center gap-1 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input required={!autoPass} placeholder="Пароль" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white disabled:opacity-50" />
                    <label className="flex items-center gap-1 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label>
                  </div>
                  <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#1a1512] border border-[#4a3424] rounded text-white">
                     <option value="low">Лоу Стафф</option>
                     <option value="high">Хай Стафф</option>
                     <option value="guardian">Хранитель</option>
                     <option value="creator">Создатель Сервера</option>
                  </select>
                  <button type="submit" className="px-6 py-2 bg-[#E5B85C] text-black font-bold rounded hover:bg-[#F2D18B]">Сгенерировать</button>
                </form>

                <div>
                  <h3 className="text-lg font-bold text-[#E5B85C] mb-4 flex items-center gap-2"><Users size={18}/> Список доступных аккаунтов</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#4a3424] text-[#A89B8F]">
                          <th className="p-3">Имя</th>
                          <th className="p-3">Роль</th>
                          <th className="p-3">Логин</th>
                          <th className="p-3">Пароль</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map(u => (
                          <tr key={u.id} className="border-b border-[#3A271E] hover:bg-[#1f1814]">
                            <td className="p-3 font-medium">{u.account_name}</td>
                            <td className={`p-3 text-sm font-bold ${ROLES_MAP[u.role]?.color.split(' ')[0] || "text-white"}`}>{ROLES_MAP[u.role]?.name || u.role}</td>
                            <td className="p-3 font-mono text-gray-300">{u.username}</td>
                            <td className="p-3 font-mono text-red-400 bg-red-500/5">{u.plain_password || "********"}</td>
                          </tr>
                        ))}
                        {usersList.length === 0 && (
                          <tr><td colSpan={4} className="text-center p-6 text-gray-500">Нет доступных аккаунтов для отображения</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === "diag" && (
              <div className="max-w-xl">
                <h3 className="text-lg font-bold text-[#E5B85C] mb-4 flex items-center gap-2"><Database size={18}/> Проверка системы</h3>
                <p className="text-[#A89B8F] mb-6">Нажмите кнопку ниже, чтобы проверить подключение к базе данных Turso и замерить пинг.</p>
                
                <button onClick={runDiagnostics} className="px-6 py-3 bg-[#E5B85C] text-black font-bold rounded-lg hover:bg-[#F2D18B] flex items-center gap-2 mb-6">
                  <Activity size={18}/> Запустить тест
                </button>

                {diagResult && (
                  <div className={`p-6 rounded-xl border ${diagResult.status === 'ok' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {diagResult.status === 'ok' ? <ShieldAlert className="text-green-500" /> : <Skull className="text-red-500" />}
                      <h4 className={`text-xl font-bold ${diagResult.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                        {diagResult.status === 'ok' ? 'Система в норме' : 'Ошибка подключения'}
                      </h4>
                    </div>
                    <p className="text-gray-300 mb-2">{diagResult.message}</p>
                    {diagResult.latency !== undefined && (
                      <p className="text-sm text-gray-400 font-mono">Пинг до базы: {diagResult.latency} мс</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
