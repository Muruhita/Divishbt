import React from "react";
import { LayoutDashboard, ScrollText, Users, Tag, ImagePlus, ShieldAlert, History, Activity, Database, Plus, X, Image as ImageIcon, AlertTriangle, BookOpen, Upload, Download, FileSpreadsheet, Trash2, Save, CheckCircle2 } from "lucide-react";
import { User, RoleItem, CategoryItem, NewArchiveItem, DbUser, LogItem } from "@/types";
import { DANGER_LEVELS } from "@/constants";

interface AdminViewProps {
  user: User;
  userRole: RoleItem;
  roles: RoleItem[];
  setRoles: (roles: RoleItem[]) => void;
  categories: CategoryItem[];
  stats: { archives: number; users: number; categories: number };
  adminTab: string;
  setAdminTab: (t: any) => void;
  newItems: NewArchiveItem[];
  setNewItems: (i: NewArchiveItem[]) => void;
  handleAddMultipleItems: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index?: number) => void;
  handleRemoveImage: (i: number, formIndex?: number) => void;
  handleClearDatabase: () => void;
  mediaList: { id: number, title: string, image: string }[];
  handleDeleteMedia: (id: number) => void;
  newCatName: string;
  setNewCatName: (v: string) => void;
  handleAddCategory: () => void;
  handleDeleteCategory: (id: number) => void;
  newRoleName: string;
  setNewRoleName: (v: string) => void;
  newRoleLevel: number;
  setNewRoleLevel: (v: number) => void;
  handleAddRole: () => void;
  handleUpdateRole: (id: string, name: string, level: number) => void;
  handleDeleteRole: (id: string) => void;
  bulkText: string;
  setBulkText: (v: string) => void;
  handleTextImport: () => void;
  bulkJson: string;
  setBulkJson: (v: string) => void;
  handleBulkImport: () => void;
  handleExport: () => void;
  handleExportCSV: () => void;
  newAcc: any;
  setNewAcc: (v: any) => void;
  autoUser: boolean;
  setAutoUser: (v: boolean) => void;
  autoPass: boolean;
  setAutoPass: (v: boolean) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  usersList: DbUser[];
  handleDeleteUser: (id: number, name: string) => void;
  logsList: LogItem[];
  handleClearLogs: () => void;
  diagResult: any;
  setDiagResult: (v: any) => void;
  playSound: (t: string) => void;
  getRoleColor: (level: number) => string;
}

export const AdminView = (props: AdminViewProps) => {
  return (
    <div className="animate-smooth-fade-up w-full bg-[#2e1b13] p-8 rounded-xl border-double border-4 border-[#5c3a21]">
      <div className="flex justify-between items-center mb-8 border-b border-[#5c3a21] pb-4"><h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49]">Панель Управления</h2></div>
      
      {/* Кнопки вкладок */}
      <div className="flex flex-wrap gap-4 mb-8 font-pixeloid-mono text-sm">
        <button onClick={() => { props.setAdminTab("dashboard"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-2 ${props.adminTab === 'dashboard' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><LayoutDashboard size={16}/> Дашборд</button>
        <button onClick={() => { props.setAdminTab("archive"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'archive' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Добавить</button>
        {props.userRole.level >= 2 && <button onClick={() => { props.setAdminTab("bulk"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'bulk' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Импорт</button>}
        {props.userRole.level >= 2 && <button onClick={() => { props.setAdminTab("users"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'users' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Аккаунты</button>}
        <button onClick={() => { props.setAdminTab("media"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-2 ${props.adminTab === 'media' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><ImagePlus size={16}/> Медиа</button>
        {props.userRole.level >= 2 && <button onClick={() => { props.setAdminTab("categories"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'categories' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Категории</button>}
        {props.userRole.level >= 3 && <button onClick={() => { props.setAdminTab("roles"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'roles' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Уровни</button>}
        {(props.userRole.id === "owner" || props.userRole.id === "creator") && <button onClick={() => { props.setAdminTab("logs"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'logs' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Логи</button>}
        <button onClick={() => { props.setAdminTab("diag"); props.playSound("click"); }} className={`px-4 py-2 rounded transition-all active:scale-95 ${props.adminTab === 'diag' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Диагностика</button>
      </div>

      {/* --- DASHBOARD --- */}
      {props.adminTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-smooth-fade-up">
          <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg"><ScrollText size={40} className="mx-auto text-[#a37c49] mb-4" /><h3 className="text-3xl font-bold text-[#e6d5b8] select-text">{props.stats.archives}</h3><p className="text-[#8c6e52] font-pixeloid-mono mt-2">Записей в архиве</p></div>
          <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg"><Users size={40} className="mx-auto text-[#a37c49] mb-4" /><h3 className="text-3xl font-bold text-[#e6d5b8] select-text">{props.stats.users}</h3><p className="text-[#8c6e52] font-pixeloid-mono mt-2">Пользователей</p></div>
          <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg"><Tag size={40} className="mx-auto text-[#a37c49] mb-4" /><h3 className="text-3xl font-bold text-[#e6d5b8] select-text">{props.stats.categories}</h3><p className="text-[#8c6e52] font-pixeloid-mono mt-2">Категорий</p></div>
        </div>
      )}

      {/* --- ARCHIVE ADD --- */}
      {props.adminTab === "archive" && (
        <div className="animate-smooth-fade-up">
          <form onSubmit={props.handleAddMultipleItems} className="space-y-6 max-w-xl">
            {props.newItems.map((item, index) => (
              <div key={index} className="relative p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg">
                {props.newItems.length > 1 && (
                  <button type="button" onClick={() => props.setNewItems(props.newItems.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 active:scale-90 transition-all bg-[#160d08] p-1.5 rounded"><X size={16} /></button>
                )}
                <div className="space-y-3">
                  <input required placeholder="Название" value={item.title} onChange={e => { const upd = [...props.newItems]; upd[index].title = e.target.value; props.setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none transition-colors" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={item.category} onChange={e => { const upd = [...props.newItems]; upd[index].category = e.target.value; props.setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none">{props.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                    <select value={item.dangerLevel} onChange={e => { const upd = [...props.newItems]; upd[index].dangerLevel = e.target.value; props.setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none">{DANGER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                  </div>
                  <textarea required placeholder="Описание (Markdown)" value={item.description} onChange={e => { const upd = [...props.newItems]; upd[index].description = e.target.value; props.setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-20 outline-none" />
                  <label className="flex items-center gap-2 text-sm text-[#a37c49] font-pixeloid-mono cursor-pointer"><input type="checkbox" checked={item.is_draft === 1} onChange={e => { const upd = [...props.newItems]; upd[index].is_draft = e.target.checked ? 1 : 0; props.setNewItems(upd); }} />Черновик</label>
                  
                  <div className="mt-2 border-t border-[#5c3a21] pt-3">
                    <label className="block text-xs font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-1"><ImageIcon size={14}/> Картинки</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => props.handleImageUpload(e, index)} className="w-full text-sm text-[#8c6e52] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#3d2617] file:text-[#e6d5b8] hover:file:bg-[#5c3a21] file:cursor-pointer mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {item.images?.map((img, i) => (
                        <div key={i} className="relative inline-block border-2 border-[#5c3a21] rounded-lg overflow-hidden bg-[#d6c5b3]">
                          <img src={img} alt="Preview" className="h-20 object-contain p-1 no-select" />
                          <button type="button" onClick={() => props.handleRemoveImage(i, index)} className="absolute top-0 right-0 bg-red-600/80 hover:bg-red-600 text-white p-0.5 rounded-bl-lg"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <button type="button" onClick={() => props.setNewItems([...props.newItems, { ...props.newItems[0], title: "", description: "", images: [] }])} className="px-4 py-2 bg-[#3d2617] border border-[#5c3a21] text-white rounded hover:bg-[#5c3a21] active:scale-95 transition-all">Добавить ещё</button>
              <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Сохранить</button>
            </div>
          </form>
          {props.userRole.id === "owner" && (
            <div className="mt-12 pt-6 border-t border-red-900/50 max-w-xl animate-smooth-fade-up">
              <h3 className="text-red-500 font-bold font-pixeloid-mono mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Опасная зона</h3>
              <p className="text-sm text-gray-500 mb-4">Эта кнопка безвозвратно удалит ВСЕ записи.</p>
              <button onClick={props.handleClearDatabase} className="px-6 py-2 bg-red-900/20 border border-red-500 text-red-400 font-bold rounded hover:bg-red-900/40 active:scale-95 transition-all">Очистить базу</button>
            </div>
          )}
        </div>
      )}

      {/* --- MEDIA --- */}
      {props.adminTab === "media" && (
        <div className="animate-smooth-fade-up w-full">
          <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4">Галерея картинок</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {props.mediaList.map(m => (
              <div key={m.id} className="bg-[#1c110b] border border-[#5c3a21] rounded-lg p-2 relative group">
                <img src={m.image} alt={m.title} className="w-full h-32 object-cover rounded no-select" />
                <div className="mt-2 text-xs text-center truncate select-text">{m.title}</div>
                <button onClick={() => props.handleDeleteMedia(m.id)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
            {props.mediaList.length === 0 && <p className="col-span-full text-center text-[#8c6e52] py-8">Нет картинок</p>}
          </div>
        </div>
      )}

      {/* --- CATEGORIES --- */}
      {props.adminTab === "categories" && props.userRole.level >= 2 && (
        <div className="animate-smooth-fade-up max-w-xl">
          <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Tag size={18}/> Категории</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="Новая категория..." value={props.newCatName} onChange={e => props.setNewCatName(e.target.value)} className="flex-grow p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
            <button onClick={props.handleAddCategory} className="px-4 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded hover:bg-[#7a4f2e] transition-all">Добавить</button>
          </div>
          <div className="space-y-2">
            {props.categories.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-[#1c110b] border border-[#5c3a21] rounded">
                <span className="font-pixeloid-mono text-[#e6d5b8] select-text">{c.name}</span>
                <button onClick={() => props.handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-400 p-1.5 rounded transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ROLES --- */}
      {props.adminTab === "roles" && props.userRole.level >= 3 && (
        <div className="animate-smooth-fade-up max-w-2xl">
          <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><ShieldAlert size={18}/> Роли</h3>
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg">
            <input type="text" placeholder="Название..." value={props.newRoleName} onChange={e => props.setNewRoleName(e.target.value)} className="flex-grow p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
            <input type="number" placeholder="Уровень" value={props.newRoleLevel} onChange={e => props.setNewRoleLevel(parseInt(e.target.value))} className="w-32 p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
            <button onClick={props.handleAddRole} className="px-4 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded transition-all">Создать</button>
          </div>
          <div className="space-y-2">
            {props.roles.map(r => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 p-3 bg-[#1c110b] border border-[#5c3a21] rounded">
                <input type="text" value={r.name} onChange={e => { 
                  const newRoles = props.roles.map(role => role.id === r.id ? { ...role, name: e.target.value } : role); 
                  props.setRoles(newRoles);
                }} className="flex-grow p-1 bg-transparent border-b border-transparent hover:border-[#5c3a21] text-white font-pixeloid-mono outline-none" />
                <input type="number" value={r.level} readOnly className="w-20 p-1 bg-[#160d08] border border-[#5c3a21] rounded text-center text-white" />
                {(props.userRole.id === "owner" || props.userRole.level > r.level) && <button onClick={() => props.handleUpdateRole(r.id, r.name, r.level)} className="text-green-500 hover:text-green-400 p-1.5"><Save size={16}/></button>}
                {r.id !== "owner" && (props.userRole.id === "owner" || props.userRole.level > r.level) && <button onClick={() => props.handleDeleteRole(r.id)} className="text-red-500 hover:text-red-400 p-1.5"><Trash2 size={16}/></button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BULK --- */}
      {props.adminTab === "bulk" && props.userRole.level >= 2 && (
        <div className="space-y-8 max-w-3xl animate-smooth-fade-up">
          <div className="bg-[#1c110b] p-6 rounded-lg border-2 border-[#a37c49]">
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-2"><BookOpen size={18}/> Импорт из текста</h3>
            <p className="text-xs text-[#8c6e52] mb-4">Формат:<br/><code className="bg-black/30 p-1 rounded">Название: Слово</code><br/><code className="bg-black/30 p-1 rounded">Описание: Текст...</code><br/>Разделитель: <span className="text-[#a37c49] font-bold">---</span></p>
            <textarea placeholder="Вставьте текст..." value={props.bulkText} onChange={e => props.setBulkText(e.target.value)} className="w-full p-3 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] font-mono text-sm h-64 outline-none" />
            <button onClick={props.handleTextImport} className="mt-4 px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold rounded transition-all">Импортировать</button>
          </div>
          <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Upload size={18}/> Импорт JSON</h3>
            <textarea placeholder="JSON..." value={props.bulkJson} onChange={e => props.setBulkJson(e.target.value)} className="w-full p-3 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] font-mono text-sm h-32 outline-none" />
            <button onClick={props.handleBulkImport} className="mt-4 px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold rounded transition-all">Загрузить JSON</button>
          </div>
          <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Download size={18}/> Экспорт</h3>
            <div className="flex gap-4 flex-wrap">
              <button onClick={props.handleExport} className="px-6 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold rounded flex items-center gap-2"><Download size={16}/> Скачать JSON</button>
              <button onClick={props.handleExportCSV} className="px-6 py-2 bg-[#3d2617] border border-green-700/50 text-green-400 font-bold rounded flex items-center gap-2"><FileSpreadsheet size={16}/> Скачать CSV</button>
            </div>
          </div>
        </div>
      )}

      {/* --- USERS --- */}
      {props.adminTab === "users" && props.userRole.level >= 2 && (
        <div className="space-y-10 animate-smooth-fade-up">
          <form onSubmit={props.handleCreateUser} className="space-y-4 max-w-xl bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
            <input required placeholder="Имя" value={props.newAcc.account_name} onChange={e => props.setNewAcc({...props.newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none" />
            <div className="flex items-center gap-2"><input required={!props.autoUser} placeholder="Логин" value={props.newAcc.username} onChange={e => props.setNewAcc({...props.newAcc, username: e.target.value})} disabled={props.autoUser} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer"><input type="checkbox" checked={props.autoUser} onChange={e => props.setAutoUser(e.target.checked)} /> Рандом</label></div>
            <div className="flex items-center gap-2"><input required={!props.autoPass} placeholder="Пароль" value={props.newAcc.password} onChange={e => props.setNewAcc({...props.newAcc, password: e.target.value})} disabled={props.autoPass} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer"><input type="checkbox" checked={props.autoPass} onChange={e => props.setAutoPass(e.target.checked)} /> Рандом</label></div>
            <select value={props.newAcc.role} onChange={e => props.setNewAcc({...props.newAcc, role: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white outline-none">{props.roles.filter(r => props.userRole.id === "owner" || Number(r.level) < Number(props.userRole.level)).map(r => <option key={r.id} value={r.id}>{r.name} (Ур. {r.level})</option>)}</select>
            <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded transition-all">Сгенерировать</button>
          </form>
          <div>
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Users size={18}/> Список</h3>
            <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] text-sm"><th className="p-3">Имя</th><th className="p-3">Роль</th><th className="p-3">Логин</th><th className="p-3">Действие</th></tr></thead>
                <tbody>
                  {props.usersList.map(u => {
                    const roleObj = props.roles.find(r => r.id === u.role);
                    const roleLevel = roleObj ? Number(roleObj.level) : 0;
                    return (
                      <tr key={u.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                        <td className="p-3 font-medium select-text">{u.account_name}</td>
                        <td className={`p-3 text-sm font-bold font-pixeloid-mono ${props.getRoleColor(roleLevel)} select-text`}>{roleObj?.name || u.role}</td>
                        <td className="p-3 font-mono text-[#c4b5a5] select-text">{u.username}</td>
                        <td className="p-3">
                          {Number(props.userRole.level) > roleLevel && u.id !== props.user.id && (
                            <button onClick={() => props.handleDeleteUser(u.id, u.account_name)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGS --- */}
      {props.adminTab === "logs" && (props.userRole.id === "owner" || props.userRole.id === "creator") && (
        <div className="animate-smooth-fade-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><History size={18}/> Логи (100)</h3>
            <button onClick={props.handleClearLogs} className="px-4 py-2 bg-red-900/20 border border-red-500 text-red-400 font-bold hover:bg-red-900/40 rounded">Очистить</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] text-sm"><th className="p-3">Действие</th><th className="p-3">Объект</th><th className="p-3">Пользователь</th><th className="p-3">Роль</th><th className="p-3">Время</th></tr></thead>
              <tbody>
                {props.logsList.map((log) => {
                  const roleObj = props.roles.find(r => r.id === log.user_role);
                  const displayRole = roleObj ? roleObj.name : log.user_role;
                  const roleColor = roleObj ? props.getRoleColor(roleObj.level) : "text-[#a37c49]";
                  return (
                    <tr key={log.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                      <td className="p-3 font-mono text-sm text-[#e6d5b8] select-text">{log.action}</td>
                      <td className="p-3 text-sm text-[#c4b5a5] select-text">{log.item_title}</td>
                      <td className="p-3 text-sm text-[#c4b5a5] select-text">{log.user_name}</td>
                      <td className={`p-3 text-sm font-bold font-pixeloid-mono ${roleColor} select-text`}>{displayRole}</td>
                      <td className="p-3 text-sm text-[#8c6e52] select-text">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DIAG --- */}
      {props.adminTab === "diag" && (
        <div className="animate-smooth-fade-up max-w-3xl">
          <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Activity size={18}/> Диагностика системы</h3>
          
          <button onClick={async () => { 
            props.setDiagResult({ loading: true });
            try { 
              const res = await fetch('/api/admin/diagnostics'); 
              const data = await res.json();
              props.setDiagResult(data); 
            } catch { 
              props.setDiagResult({ overallStatus: 'error', details: [{ name: 'Сеть', status: 'error', message: 'Не удалось связаться с сервером' }] }); 
            } 
          }} className="px-6 py-3 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded-lg mb-6 flex items-center gap-2 hover:bg-[#7a4f2e] transition-all">
            <Database size={18}/> {props.diagResult?.loading ? "Проверка..." : "Запустить проверку"}
          </button>

          {props.diagResult && !props.diagResult.loading && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                props.diagResult.overallStatus === 'ok' ? 'bg-green-900/20 border-green-500 text-green-400' : 
                props.diagResult.overallStatus === 'warning' ? 'bg-orange-900/20 border-orange-500 text-orange-400' : 
                'bg-red-900/20 border-red-500 text-red-400'
              }`}>
                {props.diagResult.overallStatus === 'ok' ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
                <div>
                  <h4 className="font-bold text-lg">
                    {props.diagResult.overallStatus === 'ok' ? 'Все системы в норме' : 
                     props.diagResult.overallStatus === 'warning' ? 'Есть предупреждения' : 
                     'Обнаружены критические ошибки'}
                  </h4>
                  <p className="text-sm opacity-80">Время проверки: {new Date(props.diagResult.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-[#1c110b] rounded-lg border border-[#5c3a21] overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#2e1b13]">
                    <tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono">
                      <th className="p-3">Компонент</th>
                      <th className="p-3">Проверка</th>
                      <th className="p-3">Статус</th>
                      <th className="p-3">Инфо</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.diagResult.details.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#3d2617] hover:bg-[#2e1b13]/50">
                        <td className="p-3 text-gray-400">{item.category}</td>
                        <td className="p-3 font-medium select-text">{item.name}</td>
                        <td className="p-3">
                          {item.status === 'ok' ? <span className="text-green-500 font-bold">OK</span> :
                           item.status === 'warning' ? <span className="text-orange-500 font-bold">WARN</span> :
                           <span className="text-red-500 font-bold">FAIL</span>}
                        </td>
                        <td className="p-3 text-gray-400 select-text">
                          {item.message} {item.latency && <span className="text-green-400 ml-1">({item.latency} мс)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
