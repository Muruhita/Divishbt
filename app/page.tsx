"use client";

import { useState } from "react";
import { Search, ChevronLeft, BookOpen, Flame, ScrollText } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: "Символы" | "Термины" | "Высказывания" | "Комбинации";
  description: string;
  symbol?: string; 
};

const ARCHIVE_DATA: ArchiveItem[] = [
  { id: 1, title: "Печать Сытого Лиса", category: "Символы", description: "Древний знак таверны, обозначающий безопасную гавань и место, где можно укрыться от стражи.", symbol: "🦊" },
  { id: 2, title: "Алхимический треугольник", category: "Символы", description: "Использовался для обозначения запрещенных зелий и тайных ингредиентов.", symbol: "🔺" },
  { id: 3, title: "Клеймо Отступника", category: "Символы", description: "Метка на картах, указывающая на опасную зону или территорию враждебного клана.", symbol: "⚓" },
  { id: 4, title: "Тёмный протокол", category: "Термины", description: "Скрытый способ передачи зашифрованных данных между гильдиями воров и наемников." },
  { id: 5, title: "Шифр 'Пьяный Гоблин'", category: "Термины", description: "Метод запутывания текста с помощью сдвига букв на 3 позиции вперед по алфавиту." },
  { id: 6, title: "Фраза 'Лиса не дремлет'", category: "Высказывания", description: "Условный сигнал о приближении городской стражи или инквизиции." },
  { id: 7, title: "Комбинация 3-7-11", category: "Комбинации", description: "Секретный стук в дверь черного входа таверны, открывающий путь в подземелье." },
];

const CATEGORIES = ["Все", "Символы", "Термины", "Высказывания", "Комбинации"];

export default function TavernArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [view, setView] = useState<"home" | "archive">("home");

  // Если пользователь начал печатать на главной, автоматически перекидываем в архив
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

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#1f1814] text-[#F3E8D6]">
      {/* Мягкий фон с градиентом и текстурой */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')" }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#3A271E] via-transparent to-[#1f1814] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        
        {/* ШАПКА */}
        <header className="flex justify-center items-center mb-12 border-b-2 border-[#5C4033] pb-6 border-dashed">
          <Flame className="text-[#E5B85C] mr-4 animate-pulse" size={32} />
          <h1 className="text-3xl md:text-4xl font-bold text-[#E5B85C] tracking-widest uppercase drop-shadow-md">
            Сытый Лис
          </h1>
          <Flame className="text-[#E5B85C] ml-4 animate-pulse" size={32} />
        </header>

        {/* ЭКРАН 1: ГЛАВНАЯ */}
        {view === "home" && (
          <div className="flex-grow flex flex-col items-center justify-center animate-fade-in text-center">
            <h2 className="text-5xl md:text-6xl text-[#F3E8D6] mb-6 font-bold tracking-wider drop-shadow-lg">
              Архив Знаний
            </h2>
            <p className="text-[#A89B8F] mb-12 max-w-lg mx-auto text-lg">
              Добро пожаловать в таверну. Здесь хранятся все секреты, запрещенные символы и тайные комбинации.
            </p>

            <div className="relative w-full max-w-2xl mx-auto group">
              <input
                type="text"
                placeholder="Найти нужный термин или символ..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-5 pl-14 bg-[#2A1B14] border-2 border-[#5C4033] rounded-2xl text-[#F3E8D6] text-xl placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] focus:ring-4 focus:ring-[#E5B85C]/20 shadow-xl transition-all"
              />
              <Search className="absolute left-5 top-5 text-[#8C7A6B] group-focus-within:text-[#E5B85C] transition-colors" size={28} />
            </div>

            <button
              onClick={() => setView("archive")}
              className="mt-12 px-10 py-4 bg-[#E5B85C] hover:bg-[#F2D18B] text-[#2A1B14] font-bold text-xl rounded-xl shadow-[0_4px_0_#9C7330] hover:shadow-[0_2px_0_#9C7330] hover:translate-y-[2px] transition-all flex items-center gap-3"
            >
              <ScrollText size={24} />
              Войти в Архив
            </button>
          </div>
        )}

        {/* ЭКРАН 2: АРХИВ */}
        {view === "archive" && (
          <div className="animate-fade-in w-full">
            {/* Верхняя панель навигации */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <button 
                onClick={() => { setView("home"); setSearchQuery(""); setSelectedCategory("Все"); }}
                className="flex items-center gap-2 text-[#A89B8F] hover:text-[#E5B85C] transition-colors px-4 py-2"
              >
                <ChevronLeft size={20} /> На главную
              </button>

              <div className="relative w-full md:w-96 group">
                <input
                  type="text"
                  placeholder="Поиск по архиву..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-12 bg-[#2A1B14] border-2 border-[#5C4033] rounded-xl text-[#F3E8D6] placeholder-[#8C7A6B] focus:outline-none focus:border-[#E5B85C] transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-[#8C7A6B] group-focus-within:text-[#E5B85C]" size={20} />
              </div>
            </div>

            {/* Категории */}
            <div className="flex flex-wrap gap-3 mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#E5B85C] text-[#2A1B14] shadow-[0_2px_0_#9C7330]"
                      : "bg-[#2A1B14] border-2 border-[#5C4033] text-[#A89B8F] hover:border-[#E5B85C] hover:text-[#F3E8D6]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Список карточек */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2A1B14] border-2 border-[#5C4033] p-6 rounded-2xl shadow-lg hover:border-[#E5B85C] hover:shadow-[0_0_15px_rgba(229,184,92,0.15)] transition-all group flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-[#E5B85C] group-hover:text-[#F2D18B] transition-colors">
                        {item.title}
                      </h3>
                      {item.symbol && <span className="text-3xl">{item.symbol}</span>}
                    </div>
                    
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1F1510] text-[#A89B8F] rounded border border-[#5C4033] mb-4 w-fit">
                      {item.category}
                    </span>
                    
                    <p className="text-[#C7B8A9] leading-relaxed flex-grow">
                      {item.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 opacity-50">
                  <BookOpen size={64} className="mx-auto mb-4 text-[#5C4033]" />
                  <p className="text-xl">По вашему запросу ничего не найдено...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
