"use client";

import { useState } from "react";
import { Search, ChevronLeft, BookOpen, Flame, ScrollText, Skull } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: "Символы" | "Термины" | "Высказывания" | "Комбинации" | "Опасные артефакты";
  description: string;
  symbol?: string; 
  dangerLevel?: "Низкий" | "Средний" | "Высокий" | "Смертельный";
};

// --- БАЗА ДАННЫХ АРХИВА (Здесь вы можете менять текст на свой) ---
const ARCHIVE_DATA: ArchiveItem[] = [
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive">("home");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (view === "home" && e.target.value.length > 0) {
      setView("archive");
    }
  };

  const filteredData = ARCHIVE_DATA.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDangerColor = (level?: string) => {
    switch (level) {
      case "Смертельный": return "text-red-400 border-red-500/50 bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "Высокий": return "text-orange-400 border-orange-500/50 bg-orange-900/20";
      case "Средний": return "text-yellow-400 border-yellow-500/50 bg-yellow-900/20";
      default: return "text-green-400 border-green-500/50 bg-green-900/20";
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1a1512] text-[#F3E8D6] font-sans">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20 pointer-events-none animate-bg-pulse" 
           style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #E5B85C 0%, transparent 70%)" }}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1512]/50 to-[#1a1512] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10 flex flex-col min-h-screen">
        
        {/* ШАПКА С ЛОГОТИПОМ */}
        <header className="flex justify-center items-center mb-10 cursor-pointer group" onClick={() => setView("home")}>
          <div className="relative">
            {/* Свечение вокруг логотипа */}
            <div className="absolute inset-0 bg-[#E5B85C] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            {/* Сама картинка */}
            <img 
              src="/logo.png" 
              alt="Сытый Лис" 
              className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-[#5C4033] group-hover:border-[#E5B85C] transition-colors duration-300 shadow-2xl relative z-10 animate-float"
              onError={(e) => {
                // Если картинки нет, покажет текст
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<h1 class="text-4xl font-bold text-[#E5B85C] animate-float">Сытый Лис</h1>';
              }}
            />
          </div>
        </header>

        {/* ЭКРАН 1: ГЛАВНАЯ */}
        {view === "home" && (
          <div className="flex-grow flex flex-col items-center justify-center animate-fade-in text-center pb-20">
            <h2 className="text-4xl md:text-5xl text-[#F3E8D6] mb-4 font-bold tracking-wide drop-shadow-lg">
              Запретный Архив
            </h2>
            <p className="text-[#A89B8F] mb-10 max-w-lg mx-auto text-lg">
              Добро пожаловать, странник. Здесь хранятся секреты, за которые можно поплатиться головой.
            </p>

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

            <button
              onClick={() => setView("archive")}
              className="mt-10 px-10 py-4 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#2A1B14] font-bold text-xl rounded-xl shadow-[0_6px_0_#9C7330] hover:shadow-[0_2px_0_#9C7330] hover:translate-y-[4px] transition-all duration-200 flex items-center gap-3 group"
            >
              <ScrollText size={24} className="group-hover:rotate-12 transition-transform duration-300" />
              Открыть все свитки
            </button>
          </div>
        )}

        {/* ЭКРАН 2: АРХИВ */}
        {view === "archive" && (
          <div className="animate-fade-in w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <button 
                onClick={() => { setView("home"); setSearchQuery(""); setSelectedCategory("Все"); }}
                className="flex items-center gap-2 text-[#A89B8F] hover:text-[#E5B85C] transition-colors px-4 py-2 font-medium bg-[#2A1B14] rounded-lg border border-[#5C4033] hover:border-[#E5B85C]"
              >
                <ChevronLeft size={20} /> На главную
              </button>

              <div className="relative w-full md:w-96 group">
                <input
                  type="text"
                  placeholder="Поиск по архиву..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-12 bg-[#2A1B14]/80 border-2 border-[#5C4033] rounded-xl text-[#F3E8D6] placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors" size={20} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#E5B85C] text-[#2A1B14] shadow-[0_2px_10px_rgba(229,184,92,0.3)] scale-105"
                      : "bg-[#2A1B14] border-2 border-[#5C4033] text-[#A89B8F] hover:border-[#E5B85C] hover:text-[#F3E8D6] hover:-translate-y-0.5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2A1B14]/90 backdrop-blur-sm border-2 border-[#5C4033] p-6 rounded-2xl shadow-lg hover:border-[#E5B85C] hover:shadow-[0_0_20px_rgba(229,184,92,0.15)] hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5B85C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <h3 className="text-xl font-bold text-[#E5B85C] group-hover:text-[#F2D18B] transition-colors pr-2">
                        {item.title}
                      </h3>
                      {item.symbol && <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{item.symbol}</span>}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1F1510] text-[#A89B8F] rounded-md border border-[#5C4033]">
                        {item.category}
                      </span>
                      {item.dangerLevel && (
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md border ${getDangerColor(item.dangerLevel)}`}>
                          ⚠ {item.dangerLevel}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#C7B8A9] leading-relaxed flex-grow relative z-10 group-hover:text-[#F3E8D6] transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                ))
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
