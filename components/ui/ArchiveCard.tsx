import React from "react";
import ReactMarkdown from "react-markdown";
import { Star, Pencil, Trash2, Maximize2 } from "lucide-react";
import { ArchiveItem } from "@/types";
import { Highlight } from "./Highlight";

export const SkeletonCard = React.memo(() => (
  <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] rounded-lg p-6 flex flex-col h-64 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-[#5c3a21]/50 rounded w-1/2"></div>
      <div className="h-8 w-8 bg-[#5c3a21]/50 rounded"></div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-20 bg-[#5c3a21]/50 rounded"></div>
      <div className="h-6 w-16 bg-[#5c3a21]/50 rounded"></div>
    </div>
    <div className="space-y-2 flex-grow">
      <div className="h-4 bg-[#5c3a21]/50 rounded w-full"></div>
      <div className="h-4 bg-[#5c3a21]/50 rounded w-5/6"></div>
      <div className="h-4 bg-[#5c3a21]/50 rounded w-4/6"></div>
    </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

// Компонент для рендера Markdown с подсветкой
const MarkdownWithHighlight = ({ text, query }: { text: string, query: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p>{React.Children.map(children, child => typeof child === 'string' ? <Highlight text={child} query={query} /> : child)}</p>,
        li: ({ children }) => <li>{React.Children.map(children, child => typeof child === 'string' ? <Highlight text={child} query={query} /> : child)}</li>,
        strong: ({ children }) => <strong>{React.Children.map(children, child => typeof child === 'string' ? <Highlight text={child} query={query} /> : child)}</strong>,
        em: ({ children }) => <em>{React.Children.map(children, child => typeof child === 'string' ? <Highlight text={child} query={query} /> : child)}</em>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export const ArchiveCard = React.memo(({ 
  item, canEdit, canDelete, onEdit, onDelete, onViewImage, isFavorite, onToggleFavorite, searchQuery = ""
}: { 
  item: ArchiveItem; 
  canEdit: boolean; 
  canDelete: boolean; 
  onEdit: (item: ArchiveItem) => void;
  onDelete: (id: number, title: string) => void;
  onViewImage: (img: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  searchQuery?: string;
}) => {
  if (!item || !item.title) return null;
  const imgCount = item.images?.length || 0;

  return (
    <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:border-[#a37c49] hover:shadow-[0_0_20px_rgba(163,124,73,0.15)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative z-10 overflow-hidden animate-smooth-fade-up">
      {imgCount > 0 && (
        <div className={`w-full border-b-2 border-[#5c3a21] relative group/img bg-[#d6c5b3] flex items-center justify-center overflow-hidden`} style={{ backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
          {imgCount === 1 && (
            <div className="w-full h-56 cursor-pointer" onClick={() => onViewImage(item.images![0])}>
              <img src={item.images![0]} loading="lazy" alt={item.title} draggable={false} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-110 drop-shadow-md no-select" />
            </div>
          )}
          {imgCount === 2 && (
            <div className="grid grid-cols-2 gap-1 w-full h-56 p-1">
              {item.images!.map((img, i) => (
                <div key={i} className="relative cursor-pointer overflow-hidden rounded-sm" onClick={() => onViewImage(img)}>
                  <img src={img} loading="lazy" alt={`${item.title} ${i+1}`} draggable={false} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 no-select" />
                </div>
              ))}
            </div>
          )}
          {imgCount >= 3 && (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-56 p-1">
              <div className="row-span-2 relative cursor-pointer overflow-hidden rounded-sm" onClick={() => onViewImage(item.images![0])}>
                <img src={item.images![0]} loading="lazy" alt={`${item.title} 1`} draggable={false} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 no-select" />
              </div>
              <div className="relative cursor-pointer overflow-hidden rounded-sm" onClick={() => onViewImage(item.images![1])}>
                <img src={item.images![1]} loading="lazy" alt={`${item.title} 2`} draggable={false} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 no-select" />
              </div>
              <div className="relative cursor-pointer overflow-hidden rounded-sm" onClick={() => onViewImage(item.images![2])}>
                <img src={item.images![2]} loading="lazy" alt={`${item.title} 3`} draggable={false} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 no-select" />
                {imgCount > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-xl font-pixeloid-mono no-select">+{imgCount - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <Maximize2 size={32} className="text-white drop-shadow-lg" />
          </div>
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] select-text">
            <Highlight text={item.title} query={searchQuery} />
          </h3>
          <div className="flex gap-2 items-center">
             {item.is_draft === 1 && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded font-bold">Черновик</span>}
             {item.symbol && (
               <span className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] bg-[#1c110b] px-3 py-1 rounded border border-[#5c3a21] select-text">
                 <Highlight text={item.symbol} query={searchQuery} />
               </span>
             )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold font-pixeloid-mono bg-[#1c110b] text-[#a37c49] rounded border border-[#5c3a21] uppercase select-text">
            <Highlight text={item.category} query={searchQuery} />
          </span>
          {item.dangerLevel && <span className="inline-block px-2 py-1 text-xs font-bold font-pixeloid-mono rounded border border-red-900/50 bg-red-900/20 text-red-400 uppercase select-text">{item.dangerLevel}</span>}
          
          <div className="ml-auto flex items-center gap-1 relative z-[60]">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(item.id); }} className={`p-1.5 rounded active:scale-90 transition-all cursor-pointer ${isFavorite ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-400 bg-white/5 hover:bg-yellow-500/10'}`}>
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            {canEdit && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded active:scale-90 transition-all cursor-pointer"><Pencil size={16} /></button>}
            {canDelete && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id, item.title); }} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded active:scale-90 transition-all cursor-pointer"><Trash2 size={16} /></button>}
          </div>
        </div>
        <div className="text-[#c4b5a5] font-sans leading-relaxed flex-grow relative z-10 prose prose-invert prose-sm max-w-none select-text">
          <MarkdownWithHighlight text={item.description} query={searchQuery} />
        </div>
      </div>
    </div>
  );
});
ArchiveCard.displayName = 'ArchiveCard';
