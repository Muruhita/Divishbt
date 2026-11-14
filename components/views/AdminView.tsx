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

      {/* --- ОСТАЛЬНЫЕ ВКЛАДКИ (ДАШБОРД, АРХИВ, МЕДИА И Т.Д.) ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ, Я ИХ СОКРАТИЛ ДЛЯ ПРИМЕРА --- */}
      
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
              {/* Общий статус */}
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

              {/* Детальный список */}
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
