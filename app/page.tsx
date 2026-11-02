"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, BookOpen, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2 } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: "Символы" | "Термины" | "Высказывания" | "Комбинации" | "Опасные артефакты";
  description: string;
  symbol?: string; 
  dangerLevel?: "Низкий" | "Средний" | "Высокий" | "Смертельный";
};

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

  // Загрузка и сохранение
  useEffect(() => {
    const saved = localStorage.getItem("tavern_archive_data");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tavern_archive_data", JSON.stringify(data));
  }, [data]);

  // Функция поиска (фокус больше не теряется!)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

    const itemToAdd: ArchiveItem = { ...newItem, id: Date.now() };
    setData([itemToAdd, ...data]);
    setShowAddForm(false);
    setNewItem({ title: "", category: "Символы", description: "", symbol: "", dangerLevel: "Низкий" });
    // Оставляем пользователя в архиве, чтобы он видел, что запись добавилась
    setView("archive"); 
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Вы уверены, что хотите безвозвратно удалить эту запись из архива?")) {
      setData(data.filter(item => item.id !== id));
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDangerColor = (level?: string) => {
    switch (level) {
      case "Смертельный": return "text-red-500 border-red-500/30 bg-red-500/10";
      case "Высокий": return "text-orange-500 border-orange-500/30 bg-orange-500/10";
      case "Средний": return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
      default: return "text-green-500 border-green-500/30 bg-green-500/10";
    }
  };

  // Вынесенный компонент карточки для чистоты кода
  const ArchiveCard = ({ item }: { item: ArchiveItem }) => (
    <div className="bg-[#2A1B14]/90 backdrop-blur-sm border-2 border-[#5C4033] p-6 rounded-2xl shadow-lg hover:border-[#E5B85C] hover:shadow-[0_0_20px_rgba(229,184,92,0.15)] hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E5B85C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="text-xl font-bold text-[#E5B85C] group-hover:text-[#F2D18B] transition-colors pr-2">{item.title}</h3>
        {item.symbol && <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{item.symbol}</span>}
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1F1510] text-[#A89B8F] rounded-md border border-[#5C4033]">{item.category}</span>
        {item.dangerLevel && (
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md border ${getDangerColor(item.dangerLevel)}`}>⚠ {item.dangerLevel}</span>
        )}
        {/* Кнопка удаления только для хозяина */}
        {isOwner && (
          <button onClick={() => handleDeleteItem(item.id)} className="ml-auto text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded transition-colors" title="Удалить запись">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      <p className="text-[#C7B8A9] leading-relaxed flex-grow relative z-10 group-hover:text-[#F3E8D6] transition-colors duration-300">{item.description}</p>
    </div>
  );

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1f1814] text-[#F3E8D6] font-sans">
      
      {/* НЕВИДИМЫЙ КВАДРАТ ДЛЯ ВХОДА */}
      <div onClick={() => setShowLogin(true)} className="absolute top-0 left-0 w-12 h-12 z-[100] cursor-default"></div>

      {/* ФОН */}
      <div className="absolute inset-0 opacity-20 pointer-events-none animate-bg-pulse" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #E5B85C 0%, transparent 70%)" }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1f1814]/50 to-[#1f1814] pointer-events-none"></div>

      {/* МОДАЛЬНОЕ ОКНО ВХОДА */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#2A1B14] border-2 border-[#E5B85C] p-8 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-[#A89B8F] hover:text-white"><X size={24} /></button>
            <div className="flex justify-center mb-6 text-[#E5B85C]"><LockKeyhole size={48} /></div>
            <h2 className="text-2xl font-bold text-center mb-6 text-[#E5B85C]">Вход для Хозяина</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Логин" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
              <input type="password" placeholder="Пароль" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1a1512] border border-[#4a3424] rounded-lg text-white focus:border-[#E5B85C] outline-none" />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg transition-colors">Войти</button>
            </form>
          </div>
        </div>
      )}

      {/* ИНДИКАТОР ОВНЕРА */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-[#2A1B14] border border-[#E5B85C] px-4 py-2 rounded-full shadow-lg">
          <span className="text-[#E5B85C] text-sm font-bold flex items-center gap-2"><Flame size={16} /> Хозяин</span>
          <button onClick={() => setIsOwner(false)} className="text-[#A89B8F] hover:text-red-400 transition-colors" title="Выйти"><LogOut size={18} /></button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        
        {/* ШАПКА */}
        <header className="flex justify-center items-center mb-10 cursor-pointer group" onClick={() => {setView("home"); setSearchQuery("");}}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#E5B85C] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            <img 
              src="/logo.png" 
              alt="Сытый Лис" 
              className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-[#5C4033] group-hover:border-[#E5B85C] transition-colors duration-300 shadow-2xl relative z-10 animate-float"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<h1 class="text-4xl font-bold text-[#E5B85C] animate-float">Сытый Лис</h1>';
              }}
            />
          </div>
        </header>

        {/* ЭКРАН 1: ГЛАВНАЯ */}
        {view === "home" && (
          <div className="flex-grow flex flex-col items-center animate-fade-in text-center pb-20">
            <h2 className="text-4xl md:text-5xl text-[#F3E8D6] mb-4 font-bold tracking-wide drop-shadow-lg mt-4">Запретный Архив</h2>
            <p className="text-[#A89B8F] mb-10 max-w-lg mx-auto text-lg">Добро пожаловать, странник. Здесь хранятся секреты, за которые можно поплатиться головой.</p>

            <div className="relative w-full max-w-2xl mx-auto group">
              <input
                type="text"
                placeholder="Найти нужный термин или символ..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-5 pl-14 bg-[#2A1B14]/80 backdrop-blur-sm border-2 border-[#5C4033] rounded-2xl text-[#F3E8D6] text-xl placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] focus:ring-4 focus:ring-[#E5B85C]/20 shadow-2xl transition-all duration-300"
              />
              <Search className="absolute left-5 top-5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors duration-300" size={28} />
            </div>

            {/* Если есть поисковый запрос - показываем результаты прямо тут */}
            {searchQuery.length > 0 ? (
              <div className="mt-12 w-full text-left animate-fade-in">
                <h3 className="text-2xl font-bold text-[#E5B85C] mb-6 border-b border-[#4a3424] pb-2">Результаты поиска ({filteredData.length})</h3>
                {filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredData.map(item => <ArchiveCard key={item.id} item={item} />)}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-50 flex flex-col items-center">
                    <Skull size={64} className="mb-4 text-[#5C4033]" />
                    <p className="text-xl">По вашему запросу ничего не найдено...</p>
                  </div>
                )}
              </div>
            ) : (
              /* Если поиск пустой - показываем кнопку */
              <button onClick={() => setView("archive")} className="mt-10 px-10 py-4 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#2A1B14] font-bold text-xl rounded-xl shadow-[0_6px_0_#9C7330] hover:shadow-[0_2px_0_#9C7330] hover:translate-y-[4px] transition-all duration-200 flex items-center gap-3 group">
                <ScrollText size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                Открыть все свитки
              </button>
            )}
          </div>
        )}

        {/* ЭКРАН 2: АРХИВ */}
        {view === "archive" && (
          <div className="animate-fade-in w-full pb-20">
            
            {/* ПАНЕЛЬ ХОЗЯИНА */}
            {isOwner && (
              <div className="mb-8 p-4 bg-[#2A1B14] border border-[#E5B85C]/30 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[#E5B85C] font-medium">Вы в режиме редактирования архива.</p>
                <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg flex items-center gap-2 transition-colors">
                  {showAddForm ? <X size={18} /> : <Plus size={18} />} {showAddForm ? "Отменить добавление" : "Добавить новую запись"}
                </button>
              </div>
            )}

            {/* ФОРМА ДОБАВЛЕНИЯ */}
            {isOwner && showAddForm && (
              <form onSubmit={handleAddItem} className="mb-10 p-6 bg-[#2A1B14] border border-[#E5B85C]/50 rounded-2xl shadow-xl animate-fade-in">
                <h3 className="text-xl font-bold text-[#E5B85C] mb-4">Новая запись в архив</h3>
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
                <button type="submit" className="px-6 py-3 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#1a1512] font-bold rounded-lg transition-colors w-full md:w-auto shadow-[0_4px_0_#9C7330] hover:shadow-[0_2px_0_#9C7330] hover:translate-y-[2px]">
                  Сохранить в архив
                </button>
              </form>
            )}

            {/* ПАНЕЛЬ ПОИСКА И НАВИГАЦИИ В АРХИВЕ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <button onClick={() => { setView("home"); setSearchQuery(""); setSelectedCategory("Все"); }} className="flex items-center gap-2 text-[#A89B8F] hover:text-[#E5B85C] transition-colors px-4 py-2 font-medium bg-[#2A1B14] rounded-lg border border-[#5C4033] hover:border-[#E5B85C]">
                <ChevronLeft size={20} /> На главную
              </button>
              <div className="relative w-full md:w-96 group">
                <input type="text" placeholder="Поиск по архиву..." value={searchQuery} onChange={handleSearchChange} className="w-full p-3 pl-12 bg-[#2A1B14]/80 border-2 border-[#5C4033] rounded-xl text-[#F3E8D6] placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] transition-all" />
                <Search className="absolute left-4 top-3.5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors" size={20} />
              </div>
            </div>

            {/* КАТЕГОРИИ */}
            <div className="flex flex-wrap gap-3 mb-8">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${selectedCategory === cat ? "bg-[#E5B85C] text-[#2A1B14] shadow-[0_2px_10px_rgba(229,184,92,0.3)] scale-105" : "bg-[#2A1B14] border-2 border-[#5C4033] text-[#A89B8F] hover:border-[#E5B85C] hover:text-[#F3E8D6] hover:-translate-y-0.5"}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* СЕТКА КАРТОЧЕК В АРХИВЕ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((item) => <ArchiveCard key={item.id} item={item} />)
              ) : (
                <div className="col-span-full text-center py-20 opacity-50 flex flex-col items-center">
                  <Skull size={64} className="mb-4 text-[#5C4033] animate-bounce" />
                  <p className="text-xl">В архивах нет записей по вашему запросу...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
