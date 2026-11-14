import React from "react";
import { X, AlertTriangle, Skull, Image as ImageIcon, Save, FileEdit, User as UserIcon } from "lucide-react";
import { ArchiveItem, CategoryItem, InfoPage, User } from "@/types";
import { DANGER_LEVELS } from "@/constants";

export const Modals = (props: any) => {
  return (
    <>
      {/* CONFIRM MODAL */}
      {props.confirmDialog && (
        <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-8 rounded-xl max-w-md w-full animate-smooth-pop text-center shadow-2xl relative overflow-hidden">
            <AlertTriangle size={56} className="mx-auto text-orange-500 mb-6 drop-shadow-lg relative z-10" />
            <h3 className="text-2xl font-bold font-pixeloid-mono text-[#e6d5b8] mb-4 relative z-10">Подтверждение</h3>
            <p className="text-[#c4b5a5] font-sans text-lg mb-8 relative z-10">{props.confirmDialog.msg}</p>
            <div className="flex justify-center gap-4 relative z-10">
              <button onClick={() => props.setConfirmDialog(null)} className="px-6 py-3 bg-[#3d2617] border border-[#5c3a21] text-[#a37c49] font-bold rounded-lg hover:bg-[#5c3a21] active:scale-95 transition-all w-32">Отмена</button>
              <button onClick={() => { props.confirmDialog.onConfirm(); props.setConfirmDialog(null); }} className="px-6 py-3 bg-red-900/40 border border-red-500 text-red-400 font-bold rounded-lg hover:bg-red-900/60 active:scale-95 transition-all w-32">Да</button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT MODAL */}
      {props.promptDialog && (
        <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#2e1b13] border-double border-4 border-red-900/50 p-8 rounded-xl max-w-md w-full animate-smooth-pop text-center shadow-2xl relative overflow-hidden">
            <Skull size={56} className="mx-auto text-red-500 mb-6 animate-pulse drop-shadow-lg" />
            <h3 className="text-2xl font-bold font-pixeloid-mono text-red-500 mb-4">Опасная зона</h3>
            <p className="text-[#c4b5a5] font-sans text-sm mb-6">{props.promptDialog.msg}</p>
            <input type="text" value={props.promptDialog.val} onChange={e => props.setPromptDialog({ ...props.promptDialog, val: e.target.value })} className="w-full p-3 bg-[#1c110b] border-2 border-[#5c3a21] rounded text-white text-center font-bold tracking-widest focus:border-red-500 outline-none mb-6" placeholder="УДАЛИТЬ" autoFocus />
            <div className="flex justify-center gap-4">
              <button onClick={() => props.setPromptDialog(null)} className="px-6 py-3 bg-[#3d2617] border border-[#5c3a21] text-[#a37c49] font-bold rounded-lg hover:bg-[#5c3a21] active:scale-95 transition-all w-32">Отмена</button>
              <button onClick={() => { props.promptDialog.onConfirm(props.promptDialog.val); props.setPromptDialog(null); }} className="px-6 py-3 bg-red-900/60 border border-red-500 text-white font-bold rounded-lg hover:bg-red-700 active:scale-95 transition-all w-32">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {props.editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => props.setEditingItem(null)}>
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-2xl relative animate-smooth-pop" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => props.setEditingItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Редактировать</h2>
            <form onSubmit={props.handleUpdateItem} className="space-y-4">
              <input required placeholder="Название" value={props.editingItem.title} onChange={e => props.setEditingItem({...props.editingItem, title: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={props.editingItem.category} onChange={e => props.setEditingItem({...props.editingItem, category: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none">{props.categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                <select value={props.editingItem.dangerLevel || "Низкий"} onChange={e => props.setEditingItem({...props.editingItem, dangerLevel: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none">{DANGER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
              </div>
              <textarea required placeholder="Описание (Markdown)" value={props.editingItem.description} onChange={e => props.setEditingItem({...props.editingItem, description: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-32 font-mono text-sm outline-none" />
              <div className="border-t border-[#5c3a21] pt-3">
                <label className="block text-xs font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-1"><ImageIcon size={14}/> Картинки</label>
                <input type="file" multiple accept="image/*" onChange={(e) => props.handleImageUpload(e)} className="w-full text-sm text-[#8c6e52] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#3d2617] file:text-[#e6d5b8] mb-3" />
                <div className="flex flex-wrap gap-2">
                  {props.editingItem.images?.map((img: string, i: number) => (
                    <div key={i} className="relative inline-block border-2 border-[#5c3a21] rounded-lg overflow-hidden bg-[#d6c5b3]">
                      <img src={img} alt="Preview" className="h-20 object-contain p-1 no-select" />
                      <button type="button" onClick={() => props.handleRemoveImage(i)} className="absolute top-0 right-0 bg-red-600/80 hover:bg-red-600 text-white p-0.5 rounded-bl-lg"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#a37c49] font-pixeloid-mono cursor-pointer">
                <input type="checkbox" checked={props.editingItem.is_draft === 1} onChange={e => props.setEditingItem({...props.editingItem, is_draft: e.target.checked ? 1 : 0})} /> Черновик
              </label>
              <button type="submit" className="px-6 py-2 bg-[#5c3a21] text-white font-bold rounded hover:bg-[#7a4f2e]">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE VIEW MODAL */}
      {props.selectedImage && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm cursor-zoom-out" onClick={() => props.setSelectedImage(null)}>
          <img src={props.selectedImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl no-select" />
          <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-black/50 p-2 rounded-full" onClick={() => props.setSelectedImage(null)}><X size={32} /></button>
        </div>
      )}

      {/* INFO PAGE MODAL */}
      {props.activePage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => { props.setActivePage(null); props.setIsEditingPage(false); }}>
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-3xl relative animate-smooth-pop max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { props.setActivePage(null); props.setIsEditingPage(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-xl md:text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-4 pr-8">{props.activePage.title}</h2>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {props.isEditingPage ? (
                <textarea value={props.editPageContent} onChange={e => props.setEditPageContent(e.target.value)} className="w-full h-64 p-4 bg-[#160d08] border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-mono text-sm outline-none" />
              ) : (
                <div className="text-[#c4b5a5] font-sans leading-relaxed whitespace-pre-wrap select-text">{props.activePage.content}</div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-[#5c3a21] flex justify-end gap-3">
              {props.isEditingPage ? (
                <>
                  <button onClick={() => props.setIsEditingPage(false)} className="px-4 py-2 bg-[#3d2617] text-[#a37c49] font-bold rounded-lg">Отмена</button>
                  <button onClick={props.handleSaveInfoPage} className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded-lg flex items-center gap-2"><Save size={18}/> Сохранить</button>
                </>
              ) : (
                props.userRole.level >= 2 && (
                  <button onClick={() => { props.setEditPageContent(props.activePage.content); props.setIsEditingPage(true); }} className="px-6 py-2 bg-blue-600/20 border border-blue-500 text-blue-400 font-bold rounded-lg flex items-center gap-2"><FileEdit size={18}/> Редактировать</button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {props.showProfile && props.user && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => props.setShowProfile(false)}>
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-md relative animate-smooth-pop" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => props.setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 text-center">Личный кабинет</h2>
            <form onSubmit={props.handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4 group/avatar">
                <div className="w-24 h-24 rounded-full border-4 border-[#5c3a21] group-hover/avatar:border-[#a37c49] overflow-hidden bg-[#1c110b] mb-2 flex items-center justify-center relative cursor-pointer">
                  {props.user.avatar ? <img src={props.user.avatar} alt="Avatar" className="w-full h-full object-cover no-select" /> : <UserIcon size={40} className="text-[#5c3a21]" />}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center"><span className="text-xs text-white font-bold">Сменить</span></div>
                  <input type="file" accept="image/*" onChange={props.handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Имя</label>
                <input type="text" value={props.newAccountName} onChange={e => props.setNewAccountName(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
              </div>
              <div className="border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Логин</label>
                <input type="text" value={props.newUsername} onChange={e => props.setNewUsername(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
              </div>
              <div className="border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Смена пароля</label>
                <input type="password" placeholder="Старый" value={props.oldPass} onChange={e => props.setOldPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none mb-2" />
                <input type="password" placeholder="Новый" value={props.newPass} onChange={e => props.setNewPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#5c3a21] text-white font-bold rounded hover:bg-[#7a4f2e]">Сохранить</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
