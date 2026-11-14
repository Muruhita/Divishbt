import React from "react";
import { Star, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ArchiveCard, SkeletonCard } from "@/components/ui/ArchiveCard";
import { ArchiveItem, CategoryItem } from "@/types";

interface ArchiveViewProps {
  categories: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (v: boolean) => void;
  isLoading: boolean;
  displayedData: ArchiveItem[];
  favorites: number[];
  canEdit: boolean;
  canDelete: boolean;
  handleToggleFavorite: (id: number) => void;
  setEditingItem: (i: ArchiveItem) => void;
  handleDeleteItem: (id: number, title: string) => void;
  setSelectedImage: (img: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  playSound: (t: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export const ArchiveView = (props: ArchiveViewProps) => {
  return (
    <div className="animate-smooth-fade-up w-full text-left">
       {/* Строка поиска */}
       <div className="relative w-full max-w-2xl mb-8 group mx-auto">
          <input 
            type="text" 
            placeholder="Поиск по свиткам..." 
            value={props.searchQuery} 
            onChange={(e) => { props.setSearchQuery(e.target.value); props.setCurrentPage(1); }} 
            className="w-full p-4 pl-12 bg-[#2e1b13] border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono focus:border-[#a37c49] transition-colors shadow-lg" 
          />
          <Search className="absolute left-4 top-4 text-[#6b513b] group-focus-within:text-[#a37c49] transition-colors" size={24} />
       </div>

       <div className="flex flex-wrap items-center gap-2 mb-8">
          <button onClick={() => { props.setSelectedCategory("Все"); props.setCurrentPage(1); props.setShowOnlyFavorites(false); props.playSound("click"); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 ${props.selectedCategory === "Все" && !props.showOnlyFavorites ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>Все</button>
          {props.categories.map(c => (
            <button key={c.id} onClick={() => { props.setSelectedCategory(c.name); props.setCurrentPage(1); props.setShowOnlyFavorites(false); props.playSound("click"); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 ${props.selectedCategory === c.name && !props.showOnlyFavorites ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>{c.name}</button>
          ))}
          <button onClick={() => { props.setShowOnlyFavorites(!props.showOnlyFavorites); props.playSound("click"); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 flex items-center gap-2 ml-auto ${props.showOnlyFavorites ? 'bg-yellow-600 text-white border-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.4)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-yellow-500 hover:text-yellow-400'}`}><Star size={16} fill={props.showOnlyFavorites ? "currentColor" : "none"} /> Избранное</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {props.isLoading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : props.displayedData.length > 0 ? props.displayedData.map((item) => (
            <ArchiveCard key={item.id} item={item} canEdit={props.canEdit} canDelete={props.canDelete} onEdit={(item) => { props.setEditingItem(item); props.playSound("modalOpen"); }} onDelete={props.handleDeleteItem} onViewImage={(img) => { props.setSelectedImage(img); props.playSound("modalOpen"); }} isFavorite={props.favorites.includes(item.id)} onToggleFavorite={props.handleToggleFavorite} searchQuery={props.searchQuery} />
          )) : <p className="text-center w-full col-span-2 text-[#8c6e52]">{props.showOnlyFavorites ? "В избранном пока пусто..." : "Ничего не найдено..."}</p>}
       </div>
       {props.totalPages > 1 && !props.showOnlyFavorites && (
         <div className="flex justify-center items-center gap-4 mt-12 pb-8">
           <button disabled={props.currentPage === 1} onClick={() => { props.setCurrentPage(prev => prev - 1); props.playSound("click"); }} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] hover:text-white active:scale-90 transition-all"><ChevronLeft size={24}/></button>
           <span className="font-pixeloid-mono text-lg text-[#a37c49]">Стр. {props.currentPage} из {props.totalPages}</span>
           <button disabled={props.currentPage === props.totalPages || props.totalPages === 0} onClick={() => { props.setCurrentPage(prev => prev + 1); props.playSound("click"); }} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] hover:text-white active:scale-90 transition-all"><ChevronRight size={24}/></button>
         </div>
       )}
    </div>
  );
};
