"use client";

import { useState } from "react";
import { Search, BookOpen, Flame } from "lucide-react";

type ArchiveItem = {
  id: number;
  title: string;
  category: "Символы" | "Термины" | "Высказывания" | "Комбинации";
  description: string;
  symbol?: string; 
};

// --- БАЗА ДАННЫХ (Можете менять текст здесь) ---
const ARCHIVE_DATA: ArchiveItem[] = [
  { id: 1, title: "Печать Сытого Лиса", category: "Символы", description: "Древний знак таверны, обозначающий безопасную гавань.", symbol: "🦊" },
  { id: 2, title: "Алхимический треугольник", category: "Символы", description: "Использовался для обозначения запрещенных зелий.", symbol: "🔺" },
  { id: 3, title: "Клеймо Отступника", category: "Символы", description: "Метка на картах, указывающая на опасную зону.", symbol: "⚓" },
  { id: 4, title: "Тёмный протокол", category: "Термины", description: "Скрытый способ передачи данных между гильдиями воров." },
  { id: 5, title: "Шифр 'Пьяный Гоблин'", category: "Термины", description: "Метод запутывания текста с помощью сдвига букв на 3 позиции." },
  { id: 6, title: "Фраза 'Лиса не дремлет'", category: "Высказывания", description: "Условный сигнал о приближении стражи." },
  { id: 7, title: "Комбинация 3-7-11", category: "Комбинации", description: "Секретный стук в дверь черного входа таверны." },
];

const CATEGORIES = ["Все", "Символы", "Термины", "Высказывания", "Комбинации"];

export default function TavernArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredData = ARCHIVE_DATA.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen font-mono relative" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #4a3424 0%, #1a1512 100%)" }}>
      
      {/* Декор */}
      <div className="absolute top-10 left-10 text-orange-500 animate-pulse opacity-50 hidden md:block"><Flame size={48} /></div>
      <div className="absolute top-10 right-10 text-orange-500 animate-pulse opacity-50 hidden md:block"><Flame size={48} /></div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        
        <header className="text-center mb-12">
          <div className="inline-block p-6 bg-[#3b2c20] border-4 border-[#d4af37] rounded-xl shadow-[8px_8px_0px_#000]">
            <h1 className="text-4xl md:text-5xl font-bold text-[#d4af37] uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
              Сытый Лис
            </h1>
            <p className="text-orange-300 mt-2 text-lg">Архив Запретных Знаний</p>
          </div>
        </header>

        <div className="relative mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Искать в архиве..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-[#1a1512] border-4 border-[#8b5a2b] text-[#f4e4c1] text-lg placeholder-orange-800 focus:outline-none focus:border-[#d4af37] shadow-[4px_4px_0px_#000] transition-all"
          />
          <Search className="absolute left-4 top-4 text-[#8b5a2b]" size={24} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 border-4 shadow-[4px_4px_0px_#000] font-bold uppercase transition-all duration-150 active:translate-y-1 active:shadow-none ${
                selectedCategory === cat
                  ? "bg-[#d4af37] border-[#f4e4c1] text-[#1a1512]"
                  : "bg-[#3b2c20] border-[#8b5a2b] text-[#f4e4c1] hover:bg-[#4a3424] hover:border-[#d4af37]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="bg-[#2a2019] border-4 border-[#5c4033] p-6 shadow-[6px_6px_0px_#000] hover:border-[#d4af37] hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-[#d4af37] group-hover:text-orange-400 transition-colors">{item.title}</h2>
                  <span className="text-4xl">{item.symbol}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-xs font-bold uppercase bg-[#1a1512] text-orange-300 border border-[#8b5a2b]">{item.category}</span>
                </div>
                <p className="text-[#bda88e] text-lg leading-relaxed">{item.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-[#8b5a2b]">
              <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-2xl">Ничего не найдено в архивах...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}