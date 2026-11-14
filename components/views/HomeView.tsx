import React from "react";
import { Search, ScrollText } from "lucide-react";
import { ArchiveCard, SkeletonCard } from "@/components/ui/ArchiveCard";
import { ArchiveItem } from "@/types";

interface HomeViewProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isLoading: boolean;
  displayedData: ArchiveItem[];
  selectedCategory: string;
  favorites: number[];
  canEdit: boolean;
  canDelete: boolean;
  handleToggleFavorite: (id: number) => void;
  setEditingItem: (i: ArchiveItem) => void;
  handleDeleteItem: (id: number, title: string) => void;
  setSelectedImage: (img: string) => void;
  playSound: (t: string) => void;
  setCurrentPage: (p: number) => void;
}

export const HomeView = (props: HomeViewProps) => {
  return (
    <div className="flex-grow flex flex-col items-center animate-smooth-fade-up text-center pb-20">
      <h2 className="text-4xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Запретный Архив</h2>
      <div className="relative w-full max-w-2xl mb-8 group">
        <input type="text" placeholder="Поиск..." value={props.searchQuery} onChange={(e) => { props.setSearchQuery(e.target.value); props.setCurrentPage(1); }} className="w-full p-4 pl-12 bg-[#2e1b13] border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono focus:border-[#a37c49] transition-colors shadow-lg" />
        <Search className="absolute left-4 top-4 text-[#6b513b] group-focus-within:text-[#a37c49] transition-colors" size={24} />
      </div>
      
      {props.searchQuery.length > 0 || props.selectedCategory !== "Все" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
          {props.isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : props.displayedData.length > 0 ? props.displayedData.map((item) => (
            <ArchiveCard key={item.id} item={item} canEdit={props.canEdit} canDelete={props.canDelete} onEdit={(item) => { props.setEditingItem(item); props.playSound("modalOpen"); }} onDelete={props.handleDeleteItem} onViewImage={(img) => { props.setSelectedImage(img); props.playSound("modalOpen"); }} isFavorite={props.favorites.includes(item.id)} onToggleFavorite={props.handleToggleFavorite} />
          )) : <p className="text-center w-full col-span-2 text-[#8c6e52]">Ничего не найдено...</p>}
        </div>
      ) : (
        <div className="text-[#8c6e52] mt-12 text-lg font-pixeloid-mono opacity-50 flex flex-col items-center gap-4"><ScrollText size={64} className="opacity-20" />Используйте поиск или меню справа сверху, чтобы открыть свитки.</div>
      )}
    </div>
  );
};
