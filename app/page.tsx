"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, BookOpen, ScrollText, Skull, AlertTriangle, ShieldAlert, Plus, X, LogOut, LockKeyhole } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: "Символы" | "Термины" | "Высказывания" | "Комбинации" | "Опасные артефакты";
  description: string;
  symbol?: string; 
  dangerLevel?: "Низкий" | "Средний" | "Высокий" | "Смертельный";
};

// --- БАЗОВАЯ БАЗА ДАННЫХ ---
const INITIAL_DATA: ArchiveItem[] = [
  { id: 1, title: "Печать Сытого Лиса", category: "Символы", description: "Официальный знак таверны. Обозначает безопасную гавань для воров и наемников.", symbol: "🦊", dangerLevel: "Низкий" },
  { id: 2, title: "Перевернутая пентаграмма", category: "Символы", description: "Знак запрещенного культа 'Темного Пламени'. Используется для жертвоприношений.", symbol: "🔻", dangerLevel: "Смертельный" },
  { id: 3, title: "Тёмный протокол", category: "Термины", description: "Скрытый способ передачи зашифрованных данных между гильдиями воров с помощью птиц.", dangerLevel: "Средний" },
  { id: 4, title: "Шифр 'Пьяный Гоблин'", category: "Термины", description: "Метод запутывания текста с помощью сдвига букв на 3 позиции вперед по алфавиту. Легко взламывается.", dangerLevel: "Низкий" },
  { id: 5, title: "«Лиса не дремлет»", category: "Высказывания", description: "Условный сигнал о приближении городской стражи или инквизиции. Требует немедленного побега через черный ход.", dangerLevel: "Высокий" },
  { id: 6, title: "Комбинация 3-7-11", category: "Комбинации", description: "Секретный стук в дверь черного входа таверны. Открывает путь в подземелье и к тайному складу.", dangerLevel: "Средний" },
  { id: 7, title: "Слеза Василиска", category: "Опасные артефакты", description: "Камень, способный превращать металл в свинец. Хранится в защищенном сундуке под барной стойкой.", symbol: "💎", dangerLevel: "Смертельный" }
];

const CATEGORIES = ["Все", "Символы", "Термины", "Высказывания", "Комбинации", "Опасные артефакты"];

export default function TavernArchive() {
  const [data, setData] = useState<ArchiveItem[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive">("home");

  // --- СОСТОЯНИЯ АВТОРИЗАЦИИ И ДОБАВЛЕНИЯ ---
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ArchiveItem, "id">>({
    title: "",
    category: "Символы",
    description: "",
    symbol: "",
    dangerLevel: "Низкий"
  });

  // --- ЗАГРУЗКА И СОХРАНЕНИЕ В БРАУЗЕРЕ ---
  useEffect(() => {
    const saved = localStorage.getItem("tavern_archive_data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка загрузки данных", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tavern_archive_data", JSON.stringify(data));
  }, [data]);

  // --- ОБРАБОТЧИКИ ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (view === "home" && e.target.value.length > 0) {
      setView("archive");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === "Lisay" && loginPass === "Muril_203") {
      setIsOwner(true);
      setShowLogin(false);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
    } else {
      setLoginError("Неверный логин или пароль!");
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.description) return;

    const itemToAdd: ArchiveItem = {
      ...newItem,
      id: Date.now(), // Генерация уникального ID
    };

    setData([itemToAdd, ...data]); // Добавляем в начало списка
    setShowAddForm(false);
    setNewItem({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" }); // Сброс формы
    setView("archive"); // Перекидываем в архив, чтобы овнер увидел результат
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDangerBadge = (level?: string) => {
    switch (level) {
      case "Смертельный": return <span className="flex items-center gap-1 text-red-400 border border-red-500/30 bg-red-950/40 px-2.5 py-1 rounded-md text-xs font-semibold shadow-[0_0_10px_rgba(239,68,68,0.2)]"><Skull size={14} /> Смертельный</span>;
      case "Высокий": return <span className="flex items-center gap-1 text-orange-400 border border-orange-500/30 bg-orange-950/40 px-2.5 py-1 rounded-md text-xs font-semibold"><ShieldAlert size={14} /> Высокий</span>;
      case "Средний": return <span className="flex items-center gap-1 text-yellow-400 border border-yellow-500/30 bg-yellow-950/40 px-2.5 py-1 rounded-md text-xs font-semibold"><AlertTriangle size={14} /> Средний</span>;
      default: return <span className="flex items-center gap-1 text-green-400 border border-green-500/30 bg-green-950/40 px-2.5 py-1 rounded-md text-xs font-semibold">Низкий</span>;
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1a1512] text-[#F3E8D6]">
      
      {/* НЕВИДИМЫЙ КВАДРАТ ДЛЯ ВХОДА ОВНЕРА (Левый верхний угол) */}
      <div 
        onClick={() => setShowLogin(true)}
        className="absolute top-0 left-0 w-12 h-12 z-[100] cursor-default"
        title=""
      ></div>

      {/* Фоновые слои */}
      <div className="bg-noise"></div>
      <div className="bg-vignette"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#4a3424]/40 via-transparent to-transparent pointer-events-none"></div>

      {/* МОДАЛЬНОЕ ОКНО ВХОДА */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#2A1B14] border-2 border-[#E5B85C] p-8 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-[#A89B8F] hover:text-white">
              <X size={24} />
            </button>
            <div className="flex justify-center mb-6 text-[#E5B85C]">
              <LockKeyhole size={48} />
            </div>
            <h2 className="text-2xl font-heading text-center mb-6 text-[#E5B85C]">Вход для Хозяина</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Логин" 
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Пароль" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none"
                />
              </div>
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg transition-colors">
                Войти
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ИНДИКАТОР ОВНЕРА */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-[#2A1B14] border border-[#E5B85C] px-4 py-2 rounded-full shadow-lg">
          <span className="text-[#E5B85C] text-sm font-bold flex items-center gap-2">
            <ShieldAlert size={16} /> Режим Хозяина
          </span>
          <button onClick={() => setIsOwner(false)} className="text-[#A89B8F] hover:text-red-400 transition-colors" title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10 flex flex-col min-h-screen">
        
        {/* ШАПКА С ЛОГОТИПОМ */}
        <header className="flex flex-col items-center justify-center mb-16 cursor-pointer group" onClick={() => setView("home")}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#E5B85C] rounded-full animate-glow"></div>
            <div className="relative z-10 p-2 bg-[#2A1B14] rounded-full border-2 border-[#5C4033] group-hover:border-[#E5B85C] transition-colors duration-500 shadow-2xl">
              <img 
                src="/logo.png" 
                alt="Сытый Лис" 
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-full animate-float"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center font-heading text-3xl text-[#E5B85C]">Сытый Лис</div>';
                }}
              />
            </div>
          </div>
          <h1 className="mt-8 font-heading text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E5B85C] via-[#F2D18B] to-[#E5B85C] drop-shadow-lg tracking-wider text-center">
            Сытый Лис
          </h1>
        </header>

        {/* ЭКРАН 1: ГЛАВНАЯ */}
        {view === "home" && (
          <div className="flex-grow flex flex-col items-center justify-center animate-fade-in text-center pb-24">
            <h2 className="text-3xl md:text-4xl text-[#F3E8D6] mb-6 font-heading tracking-wide">
              Запретный Архив Знаний
            </h2>
            <p className="text-[#A89B8F] mb-12 max-w-lg mx-auto text-lg leading-relaxed">
              Добро пожаловать, странник. Здесь хранятся секреты, запрещенные символы и тайные комбинации.
            </p>

            <div className="relative w-full max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E5B85C] to-[#8b5a2b] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Найти нужный термин или символ..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-5 pl-14 bg-[#1a1512] border-2 border-[#4a3424] rounded-2xl text-[#F3E8D6] text-xl placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] shadow-2xl transition-all duration-300"
                />
                <Search className="absolute left-5 top-5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors duration-300" size={28} />
              </div>
            </div>

            <button
              onClick={() => setView("archive")}
              className="mt-12 px-10 py-4 bg-gradient-to-b from-[#E5B85C] to-[#C69C3D] hover:from-[#F2D18B] hover:to-[#D4AF37] text-[#1a1512] font-bold text-xl font-heading tracking-wider rounded-xl shadow-[0_6px_0_#8b5a2b] hover:shadow-[0_2px_0_#8b5a2b] hover:translate-y-[4px] transition-all duration-200 flex items-center gap-3"
            >
              <ScrollText size={24} className="group-hover:rotate-12 transition-transform duration-300" />
              Открыть все свитки
            </button>
          </div>
        )}

        {/* ЭКРАН 2: АРХИВ */}
        {view === "archive" && (
          <div className="animate-fade-in w-full pb-20">
            
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ ОВНЕРА */}
            {isOwner && (
              <div className="mb-8 p-4 bg-[#2A1B14] border border-[#E5B85C]/30 rounded-xl shadow-lg flex justify-between items-center">
                <p className="text-[#E5B85C]">Вы вошли как Хозяин таверны.</p>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg flex items-center gap-2 transition-colors"
                >
                  {showAddForm ? <X size={18} /> : <Plus size={18} />}
                  {showAddForm ? "Отменить" : "Добавить запись"}
                </button>
              </div>
            )}

            {/* ФОРМА ДОБАВЛЕНИЯ */}
            {isOwner && showAddForm && (
              <form onSubmit={handleAddItem} className="mb-10 p-6 bg-[#2A1B14] border border-[#E5B85C]/50 rounded-2xl shadow-xl animate-fade-in">
                <h3 className="text-xl font-heading text-[#E5B85C] mb-4">Новая запись в архив</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input required type="text" placeholder="Название (например, 14/88)" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
                  <input type="text" placeholder="Символ (эмодзи, опционально)" value={newItem.symbol} onChange={e => setNewItem({...newItem, symbol: e.target.value})} className="p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
                  <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})} className="p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none cursor-pointer">
                    {CATEGORIES.filter(c => c !== "Все").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newItem.dangerLevel} onChange={e => setNewItem({...newItem, dangerLevel: e.target.value as any})} className="p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none cursor-pointer">
                    <option value="Низкий">Опасность: Низкая</option>
                    <option value="Средний">Опасность: Средняя</option>
                    <option value="Высокий">Опасность: Высокая</option>
                    <option value="Смертельный">Опасность: Смертельная</option>
                  </select>
                </div>
                <textarea required placeholder="Подробное описание..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-3 mb-4 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none h-24 resize-none"></textarea>
                <button type="submit" className="px-6 py-3 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg transition-colors w-full md:w-auto">
                  Сохранить в архив
                </button>
              </form>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-[#4a3424]/50 pb-6">
              <button 
                onClick={() => { setView("home"); setSearchQuery(""); setSelectedCategory("Все"); }}
                className="flex items-center gap-2 text-[#A89B8F] hover:text-[#E5B85C] transition-colors px-4 py-2 font-medium bg-[#2A1B14] rounded-lg border border-[#4a3424] hover:border-[#E5B85C] shadow-lg"
              >
                <ChevronLeft size={20} /> На главную
              </button>

              <div className="relative w-full md:w-96 group">
                <input
                  type="text"
                  placeholder="Поиск по архиву..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-12 bg-[#1a1512] border-2 border-[#4a3424] rounded-xl text-[#F3E8D6] placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] transition-all shadow-inner"
                />
                <Search className="absolute left-4 top-3.5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors" size={20} />
              </div>
            </div>

            {/* Категории */}
            <div className="flex flex-wrap gap-3 mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-b from-[#E5B85C] to-[#C69C3D] text-[#1a1512] shadow-[0_4px_15px_rgba(229,184,92,0.4)] border border-[#F2D18B] scale-105"
                      : "bg-[#2A1B14] border border-[#4a3424] text-[#A89B8F] hover:border-[#E5B85C] hover:text-[#F3E8D6] hover:bg-[#3A271E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Сетка карточек */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-gradient-to-br from-[#2A1B14] to-[#1a1512] border border-[#4a3424] p-6 rounded-2xl shadow-xl hover:border-[#E5B85C]/50 hover:shadow-[0_10px_30px_rgba(229,184,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative overflow-hidden animate-fade-in delay-${(index % 3 + 1) * 100}`}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E5B85C]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <h3 className="text-xl font-bold font-heading text-[#E5B85C] group-hover:text-[#F2D18B] transition-colors pr-2 leading-tight">
                        {item.title}
                      </h3>
                      {item.symbol && (
                        <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 bg-[#1a1512] p-2 rounded-xl border border-[#4a3424]">
                          {item.symbol}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
                      <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#1F1510] text-[#A89B8F] rounded-md border border-[#4a3424]">
                        {item.category}
                      </span>
                      {item.dangerLevel && getDangerBadge(item.dangerLevel)}
                    </div>
                    
                    <p className="text-[#C7B8A9] leading-relaxed flex-grow relative z-10 group-hover:text-[#F3E8D6] transition-colors duration-300 text-[15px]">
                      {item.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-24 opacity-60 flex flex-col items-center">
                  <BookOpen size={64} className="mb-6 text-[#4a3424]" />
                  <p className="text-xl font-heading text-[#A89B8F]">В архивах нет записей по вашему запросу...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
