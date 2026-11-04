"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Search, ChevronLeft, ChevronRight, Flame, ScrollText, Skull, Plus, X, LogOut, LockKeyhole, Trash2, Users, Settings, Database, Activity, ShieldAlert, Download, Upload, Image as ImageIcon, Maximize2, Pencil, Volume2, VolumeX, User as UserIcon, History, AlertTriangle, Save, Tag, CheckCircle2, Info, Home, BookOpen, LayoutDashboard, ImagePlus, Star, ArrowUp } from "lucide-react";

type ArchiveItem = { id: number; title: string; category: string; description: string; symbol?: string; dangerLevel?: string; image?: string; is_draft?: number; };
type DbArchiveItem = { id: number; title: string; category: string; description: string; symbol: string | null; danger_level: string | null; image: string | null; is_draft: number; };
type User = { id: number; username: string; account_name: string; role: string; avatar?: string; };
type DbUser = { id: number; username: string; account_name: string; role: string; plain_password: string | null; avatar: string | null; };
type LogItem = { id: number; action: string; item_title: string; user_name: string; user_role: string; timestamp: string; };
type NewArchiveItem = Omit<ArchiveItem, "id">;
type RoleItem = { id: string; name: string; level: number };
type CategoryItem = { id: number; name: string };

const DANGER_LEVELS = ["Низкий", "Средний", "Высокий", "Смертельный"];
const INITIAL_NEW_ITEM: NewArchiveItem = { title: "", category: "Комбинации Цифр", description: "", symbol: "", dangerLevel: "Низкий", image: "", is_draft: 0 };
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

const DEFAULT_CATEGORIES = ["Комбинации Цифр", "Слова", "Термины", "Комбинации Букв", "Символика", "Картинки", "Другое"].map((name, i) => ({ id: i+1, name }));
const DEFAULT_ROLES = [
  { id: "owner", name: "Овнер (Dev)", level: 4 },
  { id: "creator", name: "Создатель Сервера", level: 3 },
  { id: "guardian", name: "Хранитель", level: 2 },
  { id: "high", name: "Хай Стафф", level: 1 },
  { id: "low", name: "Лоу Стафф", level: 0 }
];

// --- СКЕЛЕТОН КАРТОЧКИ (Пока грузится) ---
const SkeletonCard = () => (
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
);

// --- КОМПОНЕНТ КАРТОЧКИ ---
const ArchiveCard = ({ 
  item, canEdit, canDelete, onEdit, onDelete, onViewImage, isFavorite, onToggleFavorite
}: { 
  item: ArchiveItem; 
  canEdit: boolean; 
  canDelete: boolean; 
  onEdit: (item: ArchiveItem) => void;
  onDelete: (id: number, title: string) => void;
  onViewImage: (img: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}) => {
  if (!item || !item.title) return null;
  return (
    <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:border-[#a37c49] hover:shadow-[0_0_20px_rgba(163,124,73,0.15)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative z-10 overflow-hidden animate-smooth-fade-up">
      {item.image && (
        <div className="w-full h-56 overflow-hidden border-b-2 border-[#5c3a21] cursor-pointer relative group/img flex items-center justify-center"
          style={{ backgroundColor: '#d6c5b3', backgroundImage: 'radial-gradient(#b8a38a 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          onClick={() => onViewImage(item.image!)}>
          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-110 drop-shadow-md" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 size={32} className="text-[#e6d5b8]" />
          </div>
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8]">{item.title}</h3>
          <div className="flex gap-2 items-center">
             {item.is_draft === 1 && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded font-bold">Черновик</span>}
             {item.symbol && <span className="text-xl font-bold font-pixeloid-mono text-[#e6d5b8] bg-[#1c110b] px-3 py-1 rounded border border-[#5c3a21]">{item.symbol}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold font-pixeloid-mono bg-[#1c110b] text-[#a37c49] rounded border border-[#5c3a21] uppercase">{item.category}</span>
          {item.dangerLevel && <span className="inline-block px-2 py-1 text-xs font-bold font-pixeloid-mono rounded border border-red-900/50 bg-red-900/20 text-red-400 uppercase">{item.dangerLevel}</span>}
          
          <div className="ml-auto flex items-center gap-1 relative z-[60]">
            {/* Кнопка Избранного */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(item.id); }} 
              className={`p-1.5 rounded active:scale-90 transition-all cursor-pointer ${isFavorite ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-400 bg-white/5 hover:bg-yellow-500/10'}`}
              title={isFavorite ? "Удалить из избранного" : "В избранное"}
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            
            {canEdit && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded active:scale-90 transition-all cursor-pointer"><Pencil size={16} /></button>
            )}
            {canDelete && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id, item.title); }} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded active:scale-90 transition-all cursor-pointer"><Trash2 size={16} /></button>
            )}
          </div>
        </div>
        <div className="text-[#c4b5a5] font-sans leading-relaxed flex-grow relative z-10 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default function TavernArchive() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ msg: string, onConfirm: () => void } | null>(null);
  const [promptDialog, setPromptDialog] = useState<{ msg: string, val: string, onConfirm: (val: string) => void } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const showConfirm = (msg: string, onConfirm: () => void) => setConfirmDialog({ msg, onConfirm });
  const showPrompt = (msg: string, onConfirm: (val: string) => void) => setPromptDialog({ msg, val: "", onConfirm });

  const [data, setData] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Стейт загрузки
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Фильтр избранного
  const [favorites, setFavorites] = useState<number[]>([]); // Массив ID избранных записей
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  const [showScrollTop, setShowScrollTop] = useState(false); // Стейт кнопки "Наверх"

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBookOpening, setIsBookOpening] = useState(false);

  const [newAccountName, setNewAccountName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPass, setNewPass] = useState("");
  const [oldPass, setOldPass] = useState("");

  const [newItems, setNewItems] = useState<NewArchiveItem[]>([{ ...INITIAL_NEW_ITEM }]);
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  const [bulkJson, setBulkJson] = useState(""); 
  
  const [adminTab, setAdminTab] = useState<"dashboard" | "archive" | "bulk" | "users" | "diag" | "logs" | "categories" | "roles" | "media">("dashboard");
  
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [diagResult, setDiagResult] = useState<{ status: string, latency?: number, message: string } | null>(null);
  
  const [stats, setStats] = useState({ archives: 0, users: 0, categories: 0 });
  const [mediaList, setMediaList] = useState<{ id: number, title: string, image: string }[]>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLevel, setNewRoleLevel] = useState(1);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- ЛОГИКА СКРОЛЛА (Кнопка Наверх) ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- КУРСОР ---
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, select, textarea, [role="button"]');
      
      if (isClickable && !isHovering.current) {
        isHovering.current = true;
        cursorDotRef.current?.classList.add("hovering");
      } else if (!isClickable && isHovering.current) {
        isHovering.current = false;
        cursorDotRef.current?.classList.remove("hovering");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = (type: "click" | "save" | "delete" | "success") => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "click") {
      osc.type = "triangle"; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === "save" || type === "success") {
      osc.type = "sine"; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === "delete") {
      osc.type = "sawtooth"; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    }
  };

  const fetchSettings = async () => {
    try {
      const catRes = await fetch('/api/admin/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData && catData.length > 0) setCategories(catData);
      }
      const roleRes = await fetch('/api/admin/roles');
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        if (roleData && roleData.length > 0) setRoles(roleData);
      }
    } catch (e) { console.error("Ошибка загрузки настроек", e); }
  };

  const fetchFavorites = async (userId: number) => {
    try {
      const res = await fetch(`/api/favorites?userId=${userId}`);
      if (res.ok) {
        setFavorites(await res.json());
      }
    } catch (e) { console.error("Ошибка загрузки избранного"); }
  };

  const handleToggleFavorite = async (archiveId: number) => {
    if (!user) return showToast("Войдите, чтобы добавлять в избранное", "warning");
    
    const isCurrentlyFavorite = favorites.includes(archiveId);
    const action = isCurrentlyFavorite ? "remove" : "add";

    // Оптимистичное обновление UI (сразу меняем цвет звездочки)
    if (isCurrentlyFavorite) {
      setFavorites(favorites.filter(id => id !== archiveId));
    } else {
      setFavorites([...favorites, archiveId]);
    }
    playSound("click");

    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, archiveId, action })
    });
  };

  const fetchArchive = async (page = 1, cat = selectedCategory, search = searchQuery) => {
    setIsLoading(true); // Включаем скелетон
    try {
      const res = await fetch(`/api/archive?page=${page}&limit=${LIMIT}&category=${encodeURIComponent(cat)}&search=${encodeURIComponent(search)}&role=${user?.role || 'guest'}`);
      const result = await res.json();
      const items = result.items || [];
      
      const formatted = (items as DbArchiveItem[]).map((item) => ({
        id: item.id, title: item.title, category: item.category, description: item.description,
        symbol: item.symbol || undefined, dangerLevel: item.danger_level || undefined,
        image: item.image || undefined, is_draft: item.is_draft
      }));
      
      setData(formatted);
      setTotalPages(Math.ceil((result.total || 0) / LIMIT));
      setCurrentPage(page);
    } catch (error) { setData([]); }
    finally { setIsLoading(false); } // Выключаем скелетон
  };

  useEffect(() => {
    const checkSession = () => {
      try {
        const savedSession = localStorage.getItem("tavern_session");
        if (savedSession) {
          const { userData, expiresAt } = JSON.parse(savedSession);
          if (Date.now() < expiresAt) {
            setUser(userData); 
            fetchFavorites(userData.id);
          } 
          else localStorage.removeItem("tavern_session"); 
        }
      } catch (e) { localStorage.removeItem("tavern_session"); } 
      finally { setIsCheckingAuth(false); }
    };
    checkSession();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user) fetchArchive(currentPage, selectedCategory, searchQuery);
  }, [user, currentPage, selectedCategory, searchQuery]);

  const userRole = roles.find(r => r.id === user?.role) || DEFAULT_ROLES.find(r => r.id === user?.role) || { level: 0, id: "guest", name: "Гость" };
  
  const canEdit = user?.role === 'owner' || user?.role === 'creator' || userRole.level >= 3;
  const canDelete = user?.role === 'owner' || user?.role === 'creator' || user?.role === 'high' || userRole.level >= 1;

  const getRoleColor = (level: number) => {
    if (level >= 4) return "text-owner-glow";
    if (level === 3) return "text-purple-500";
    if (level === 2) return "text-blue-500";
    if (level === 1) return "text-green-500";
    return "text-gray-400";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    playSound("click");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsBookOpening(true);
        playSound("success");
        
        setTimeout(() => {
          setUser({ ...data }); 
          setLoginUser(""); setLoginPass("");
          fetchFavorites(data.id); // Загружаем избранное
          const expiresAt = Date.now() + (5 * 60 * 60 * 1000); 
          localStorage.setItem("tavern_session", JSON.stringify({ userData: { ...data }, expiresAt }));
          setIsBookOpening(false);
        }, 1500);

      } else { setLoginError(data.error || "Ошибка входа"); }
    } catch { setLoginError("Ошибка соединения"); }
  };

  const handleLogout = () => {
    playSound("click");
    setUser(null);
    setFavorites([]);
    localStorage.removeItem("tavern_session");
    setView("home");
  };

  const openProfile = () => {
    if (user) {
      setNewAccountName(user.account_name);
      setNewUsername(user.username);
      setNewPass("");
      setOldPass("");
      setShowProfile(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    playSound("save");

    const res = await fetch("/api/user/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: user.id, oldPassword: oldPass, newPassword: newPass, avatar: user.avatar,
        newUsername: newUsername !== user.username ? newUsername : undefined,
        newAccountName: newAccountName !== user.account_name ? newAccountName : undefined
      })
    });

    const data = await res.json();
    if (res.ok) {
      showToast("Профиль успешно обновлен!", "success");
      setOldPass(""); setNewPass("");
      const updatedUser = { ...user, username: newUsername || user.username, account_name: newAccountName || user.account_name };
      setUser(updatedUser);
      const saved = JSON.parse(localStorage.getItem("tavern_session")!);
      saved.userData = updatedUser;
      localStorage.setItem("tavern_session", JSON.stringify(saved));
    } else { showToast(`Ошибка: ${data.error}`, "error"); }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast("Аватарка должна быть меньше 500КБ!", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setUser(prev => prev ? { ...prev, avatar: reader.result as string } : null);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Картинка должна быть меньше 2МБ!", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (index !== undefined) {
        const updated = [...newItems];
        updated[index].image = base64;
        setNewItems(updated);
      } else if (editingItem) {
        setEditingItem({ ...editingItem, image: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = (id: number, title: string) => {
    if (!user) return;
    showConfirm(`Вы уверены, что хотите удалить запись "${title}"?`, async () => {
      playSound("delete");
      await fetch(`/api/archive?id=${id}&title=${encodeURIComponent(title)}&authorName=${encodeURIComponent(user.account_name)}&authorRole=${user.role}`, { method: "DELETE" });
      fetchArchive(currentPage);
      showToast("Запись удалена", "info");
    });
  };

  const handleClearDatabase = () => {
    if (!user || userRole.id !== "owner") return;
    showPrompt("ВНИМАНИЕ! Это удалит ВСЕ записи навсегда. Введите слово 'УДАЛИТЬ':", async (val) => {
      if (val !== "УДАЛИТЬ") return showToast("Отменено. Слово введено неверно.", "warning");
      playSound("delete");
      const res = await fetch(`/api/archive?clear=true&authorName=${encodeURIComponent(user.account_name)}&authorRole=${user.role}`, { method: "DELETE" });
      if (res.ok) {
        showToast("База данных полностью очищена!", "success");
        fetchArchive(1);
      } else {
        showToast("Ошибка при очистке базы.", "error");
      }
    });
  };

  const handleClearLogs = () => {
    if (!user || (userRole.id !== "owner" && userRole.id !== "creator")) return;
    showConfirm("Очистить все логи? Это действие необратимо.", async () => {
      playSound("delete");
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogsList([]);
        showToast("Логи успешно очищены!", "success");
      } else {
        showToast("Ошибка при очистке логов", "error");
      }
    });
  };

  const handleAddMultipleItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const validItems = newItems.filter(item => item.title.trim() !== "" && item.description.trim() !== "");
    if (validItems.length === 0) return showToast("Заполните хотя бы одну запись", "warning");
    playSound("save");

    const itemsWithAuthor = validItems.map(item => ({ ...item, authorName: user.account_name, authorRole: user.role }));

    const res = await fetch("/api/archive", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemsWithAuthor)
    });
    
    if (res.ok) { 
      const result = await res.json();
      showToast(`Успешно добавлено ${result.count} записей!`, "success");
      fetchArchive(1); 
      setNewItems([{ ...INITIAL_NEW_ITEM }]); 
    } else { showToast("Ошибка при сохранении", "error"); }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !user) return;
    playSound("save");

    const res = await fetch("/api/archive", {
      method: "PUT", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ ...editingItem, authorName: user.account_name, authorRole: user.role })
    });
    
    if (res.ok) { 
      showToast("Запись обновлена!", "success"); setEditingItem(null); fetchArchive(currentPage); 
    } else { showToast("Ошибка при обновлении", "error"); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    playSound("save");
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCatName })
    });
    if (res.ok) { setNewCatName(""); fetchSettings(); showToast("Категория добавлена", "success"); }
    else { showToast("Ошибка при добавлении категории", "error"); }
  };

  const handleDeleteCategory = (id: number) => {
    showConfirm("Удалить категорию?", async () => {
      playSound("delete");
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) { fetchSettings(); showToast("Категория удалена", "info"); }
    });
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    playSound("save");
    const res = await fetch("/api/admin/roles", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newRoleName, level: newRoleLevel })
    });
    if (res.ok) { setNewRoleName(""); setNewRoleLevel(1); fetchSettings(); showToast("Уровень создан", "success"); }
    else { showToast("Ошибка при добавлении роли", "error"); }
  };

  const handleUpdateRole = async (id: string, name: string, level: number) => {
    playSound("save");
    const res = await fetch("/api/admin/roles", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name, level, requesterRole: user?.role })
    });
    if (res.ok) { fetchSettings(); showToast("Уровень обновлен", "success"); }
    else { const err = await res.json(); showToast(err.error, "error"); }
  };

  const handleDeleteRole = (id: string) => {
    showConfirm("Удалить уровень доступа?", async () => {
      playSound("delete");
      const res = await fetch(`/api/admin/roles?id=${id}&requesterRole=${user?.role}`, { method: "DELETE" });
      if (res.ok) { fetchSettings(); showToast("Уровень удален", "info"); }
      else { const err = await res.json(); showToast(err.error, "error"); }
    });
  };

  const generateRandom = (length = 15) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    playSound("save");
    
    if (newAcc.role === "owner" && userRole.id !== "owner") {
      return showToast("Только Овнер может создать Овнера", "error");
    }

    const finalUsername = autoUser ? generateRandom(15) : newAcc.username;
    const finalPassword = autoPass ? generateRandom(15) : newAcc.password;

    const res = await fetch("/api/admin/create-user", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAcc, username: finalUsername, password: finalPassword, requesterRole: user.role, requesterName: user.account_name })
    });

    if (res.ok) {
      showToast(`Аккаунт создан! Логин: ${finalUsername} | Пароль: ${finalPassword}`, "success");
      setNewAcc({ account_name: "", username: "", password: "", role: roles[roles.length - 1]?.id || "low" });
      setAutoUser(false); setAutoPass(false); fetchUsers();
    } else { const err = await res.json(); showToast(err.error, "error"); }
  };

  const handleDeleteUser = (id: number, targetName: string) => {
    if (!user) return;
    showConfirm(`Удалить аккаунт "${targetName}"?`, async () => {
      playSound("delete");
      const res = await fetch(`/api/admin/users?id=${id}&requesterRole=${user.role}`, { method: "DELETE" });
      if (res.ok) { fetchUsers(); showToast("Аккаунт удален", "info"); }
      else { const err = await res.json(); showToast(err.error, "error"); }
    });
  };

  const fetchUsers = async () => {
    if (!user) return;
    const res = await fetch(`/api/admin/users?role=${user.role}`);
    if (res.ok) setUsersList(await res.json());
  };

  const fetchLogs = async () => {
    const res = await fetch("/api/admin/logs");
    if (res.ok) setLogsList(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
  };

  const fetchMedia = async () => {
    const res = await fetch("/api/admin/images");
    if (res.ok) setMediaList(await res.json());
  };

  const handleDeleteMedia = (id: number) => {
    showConfirm("Удалить эту картинку из базы?", async () => {
      const res = await fetch(`/api/admin/images?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMedia();
        showToast("Картинка удалена", "success");
      } else {
        showToast("Ошибка удаления", "error");
      }
    });
  };

  const handleExport = async () => {
    playSound("click");
    try {
      const res = await fetch("/api/archive?limit=9999");
      const result = await res.json();
      const exportData = (result.items || []).map((item: DbArchiveItem) => ({
        title: item.title, category: item.category, description: item.description,
        symbol: item.symbol, dangerLevel: item.danger_level, image: item.image 
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "tavern_archive_export.json"; a.click();
      URL.revokeObjectURL(url);
      showToast("Экспорт начат", "success");
    } catch { showToast("Ошибка при экспорте", "error"); }
  };

  const handleBulkImport = async () => {
    if (!user) return;
    playSound("save");
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON должен быть массивом");
      
      const itemsWithAuthor = parsed.map((item: any) => ({ ...item, authorName: user.account_name, authorRole: user.role }));
      const res = await fetch("/api/archive", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemsWithAuthor)
      });
      
      if (res.ok) {
        const result = await res.json();
        showToast(`Успешно добавлено ${result.count} записей!`, "success");
        setBulkJson(""); fetchArchive(1);
      } else { showToast("Ошибка при импорте", "error"); }
    } catch (e) { showToast("Ошибка формата JSON.", "error"); }
  };

  useEffect(() => {
    if (view === "admin") {
      if (adminTab === "users") fetchUsers();
      if (adminTab === "logs") fetchLogs();
      if (adminTab === "dashboard") fetchStats();
      if (adminTab === "media") fetchMedia();
    }
  }, [view, adminTab]);

  // Фильтрация данных для отображения (учитывая "Только избранное")
  const displayedData = showOnlyFavorites ? data.filter(item => favorites.includes(item.id)) : data;

  if (isCheckingAuth) return <main className="min-h-screen bg-[#160d08]"></main>;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#160d08] text-[#e6d5b8] font-sans flex flex-col">
      
      <div ref={cursorDotRef} className="custom-cursor-dot hidden md:block pointer-events-none" />

      <div className="pixel-stars pointer-events-none"></div>
      <div className="fog-container pointer-events-none"><div className="fog-layer"></div><div className="fog-layer"></div></div>
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {RUNES.slice(0, 6).map((rune, i) => (
          <div key={i} className="rune pointer-events-none">{rune}</div>
        ))}
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #a37c49 0%, transparent 70%)" }}></div>

      <button onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playSound("success"); }}
        className="absolute top-4 left-4 z-[100] p-2 bg-[#1c110b]/80 border border-[#5c3a21] rounded hover:bg-[#a37c49] text-[#8c6e52] active:scale-95 transition-all">
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] animate-smooth-pop pointer-events-none">
          <div className={`px-6 py-4 rounded-lg border-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3 font-pixeloid-mono backdrop-blur-md text-lg
            ${toast.type === 'success' ? 'bg-[#1a2e1c]/95 border-green-500 text-green-100' :
              toast.type === 'error' ? 'bg-[#2e1a1a]/95 border-red-500 text-red-100' :
              toast.type === 'warning' ? 'bg-[#2e2a1a]/95 border-orange-500 text-orange-100' :
              'bg-[#2e1b13]/95 border-[#a37c49] text-[#e6d5b8]'}`}>
            {toast.type === 'success' && <CheckCircle2 size={24} className="text-green-400" />}
            {toast.type === 'error' && <Skull size={24} className="text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle size={24} className="text-orange-400" />}
            {toast.type === 'info' && <Info size={24} className="text-[#a37c49]" />}
            {toast.msg}
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-8 rounded-xl max-w-md w-full animate-smooth-pop text-center shadow-2xl relative overflow-hidden">
            <AlertTriangle size={56} className="mx-auto text-orange-500 mb-6 drop-shadow-lg relative z-10" />
            <h3 className="text-2xl font-bold font-pixeloid-mono text-[#e6d5b8] mb-4 relative z-10">Подтверждение</h3>
            <p className="text-[#c4b5a5] font-sans text-lg mb-8 relative z-10">{confirmDialog.msg}</p>
            <div className="flex justify-center gap-4 relative z-10">
              <button onClick={() => { playSound("click"); setConfirmDialog(null); }} className="px-6 py-3 bg-[#3d2617] border border-[#5c3a21] text-[#a37c49] font-bold rounded-lg hover:bg-[#5c3a21] active:scale-95 transition-all w-32">Отмена</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-6 py-3 bg-red-900/40 border border-red-500 text-red-400 font-bold rounded-lg hover:bg-red-900/60 active:scale-95 transition-all w-32">Да</button>
            </div>
          </div>
        </div>
      )}

      {promptDialog && (
        <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#2e1b13] border-double border-4 border-red-900/50 p-8 rounded-xl max-w-md w-full animate-smooth-pop text-center shadow-2xl relative overflow-hidden">
            <Skull size={56} className="mx-auto text-red-500 mb-6 animate-pulse drop-shadow-lg" />
            <h3 className="text-2xl font-bold font-pixeloid-mono text-red-500 mb-4">Опасная зона</h3>
            <p className="text-[#c4b5a5] font-sans text-sm mb-6">{promptDialog.msg}</p>
            <input 
              type="text" value={promptDialog.val} onChange={e => setPromptDialog({ ...promptDialog, val: e.target.value })}
              className="w-full p-3 bg-[#1c110b] border-2 border-[#5c3a21] rounded text-white text-center font-bold tracking-widest focus:border-red-500 outline-none mb-6"
              placeholder="УДАЛИТЬ" autoFocus
            />
            <div className="flex justify-center gap-4">
              <button onClick={() => setPromptDialog(null)} className="px-6 py-3 bg-[#3d2617] border border-[#5c3a21] text-[#a37c49] font-bold rounded-lg hover:bg-[#5c3a21] active:scale-95 transition-all w-32">Отмена</button>
              <button onClick={() => { promptDialog.onConfirm(promptDialog.val); setPromptDialog(null); }} className="px-6 py-3 bg-red-900/60 border border-red-500 text-white font-bold rounded-lg hover:bg-red-700 active:scale-95 transition-all w-32">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-2xl relative animate-smooth-pop" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 active:scale-90 transition-all"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Редактировать</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <input required placeholder="Название" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select value={editingItem.dangerLevel || "Низкий"} onChange={e => setEditingItem({...editingItem, dangerLevel: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none">
                  {DANGER_LEVELS.map(l => <option key={l} value={l}>Уровень: {l}</option>)}
                </select>
              </div>
              <textarea required placeholder="Описание (Markdown)" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-32 font-mono text-sm focus:border-[#a37c49] outline-none" />
              
              <label className="flex items-center gap-2 text-sm text-[#a37c49] font-pixeloid-mono cursor-pointer mt-4 mb-4">
                <input type="checkbox" checked={editingItem.is_draft === 1} onChange={e => setEditingItem({...editingItem, is_draft: e.target.checked ? 1 : 0})} />
                Сохранить как черновик (скрыто от пользователей)
              </label>

              <button type="submit" className="px-6 py-2 bg-[#5c3a21] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {showProfile && user && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowProfile(false)}>
          <div className="bg-[#2e1b13] border-double border-4 border-[#5c3a21] p-6 rounded-xl w-full max-w-md relative animate-smooth-pop" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 active:scale-90 transition-all"><X size={24}/></button>
            <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49] mb-6 text-center">Личный кабинет</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4 group/avatar">
                <div className="w-24 h-24 rounded-full border-4 border-[#5c3a21] group-hover/avatar:border-[#a37c49] overflow-hidden bg-[#1c110b] mb-2 flex items-center justify-center relative cursor-pointer transition-colors">
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300" /> : <UserIcon size={40} className="text-[#5c3a21] group-hover/avatar:text-[#a37c49] transition-colors" />}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs text-white font-bold">Сменить</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2 border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Изменить имя</label>
                <input type="text" placeholder="Новое имя" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
              </div>

              <div className="space-y-2 border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Изменить логин</label>
                <input type="text" placeholder="Новый логин" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
              </div>

              <div className="space-y-2 border-t border-[#5c3a21] pt-4">
                <label className="text-sm font-pixeloid-mono text-[#a37c49]">Смена пароля</label>
                <input type="password" placeholder="Старый пароль" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
                <input type="password" placeholder="Новый пароль" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
              </div>
              
              <button type="submit" className="w-full py-2 bg-[#5c3a21] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Сохранить изменения</button>
            </form>
          </div>
        </div>
      )}

      {!user && (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden book-container ${isBookOpening ? 'book-open' : ''}`}>
          <div className="absolute inset-0 bg-[#0a0705]"></div>

          <div className="book-cover-left flex items-center justify-end pr-4">
            <div className="w-1/2 h-full border-r border-[#5c3a21]"></div>
            <div className="book-corner book-corner-tl"></div>
            <div className="book-corner book-corner-bl"></div>
          </div>

          <div className="book-cover-right flex items-center justify-start pl-4">
            <div className="w-1/2 h-full border-l border-[#5c3a21]"></div>
            <div className="book-corner book-corner-tr"></div>
            <div className="book-corner book-corner-br"></div>
          </div>

          <div className="book-spine"></div>

          <div className="login-content">
            <div className="bg-[#2e1b13]/95 border-4 border-[#a37c49] p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] relative z-50">
              <div className="flex justify-center mb-6 relative">
                <div className="absolute inset-0 bg-[#a37c49] blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <img src="/logo.png" alt="Сытый Лис" className="w-32 h-32 object-cover rounded-full border-4 border-[#5c3a21] relative z-10 animate-float bg-[#1c110b]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              
              <h1 className="text-3xl font-bold font-pixeloid-mono text-center mb-2 text-[#E5B85C] uppercase flex justify-center items-center gap-2 drop-shadow-md">
                <Flame /> Сытый Лис
              </h1>
              <p className="text-center text-[#8c6e52] mb-8 font-pixeloid-mono">Открыть древний фолиант</p>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Логин</label>
                  <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-pixeloid-mono text-[#a37c49] mb-1">Пароль</label>
                  <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 bg-[#1c110b] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none transition-colors" />
                </div>
                
                {loginError && <p className="text-red-400 text-sm text-center animate-shake">{loginError}</p>}
                
                <button type="submit" className="w-full py-3 bg-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono text-lg rounded hover:bg-[#7a4f2e] active:scale-95 transition-all shadow-[0_4px_0_#1c110b] hover:shadow-none hover:translate-y-1 flex items-center justify-center gap-2">
                  <BookOpen size={20} /> Открыть
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="flex-grow flex flex-col relative z-10 w-full animate-content-fade">
          
          <div className="w-full flex justify-end p-4 relative z-[60] animate-menu-drop" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col items-end gap-2">
              <button 
                type="button"
                className={`flex items-center gap-3 bg-[#2e1b13]/90 border ${userRole.id === 'owner' ? 'owner-border' : 'border-[#5c3a21]'} p-1.5 rounded-lg cursor-pointer hover:border-[#a37c49] transition-all group text-left`} 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openProfile(); }}
              >
                <div className="w-10 h-10 rounded bg-[#1c110b] overflow-hidden flex items-center justify-center border border-[#5c3a21] group-hover:border-[#a37c49] transition-colors">
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-[#5c3a21] group-hover:text-[#a37c49] transition-colors" />}
                </div>
                <div className="flex flex-col text-right pr-2">
                  <span className="text-sm font-bold font-pixeloid-mono">{user.account_name}</span>
                  <span className={`text-xs font-bold font-pixeloid-mono ${getRoleColor(userRole.level)}`}>{userRole.name}</span>
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded active:scale-90 transition-all" title="Выйти"><LogOut size={18} /></button>
              </button>

              <div className="flex flex-col gap-1 items-end">
                {view !== "home" && (
                  <button onClick={() => setView("home")} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start">
                    <Home size={14} /> На главную
                  </button>
                )}
                {view !== "archive" && (
                  <button onClick={() => setView("archive")} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start">
                    <ScrollText size={14} /> Открыть свитки
                  </button>
                )}
                {view !== "admin" && userRole.level >= 1 && (
                  <button onClick={() => setView("admin")} className="flex items-center gap-2 px-3 py-1.5 bg-[#1c110b]/90 border border-[#5c3a21] text-[#a37c49] text-xs font-pixeloid-mono rounded hover:bg-[#5c3a21] hover:text-white transition-all shadow-md backdrop-blur-sm w-32 justify-start">
                    <Settings size={14} /> Админка
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 pb-12 w-full flex flex-col flex-grow -mt-16">
            <header className="flex justify-center mb-8 cursor-pointer" onClick={() => setView("home")}>
              <img src="/logo.png" alt="Сытый Лис" className="w-24 h-24 object-cover rounded-full border-4 border-[#5c3a21] animate-float bg-[#1c110b] hover:scale-105 transition-all" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </header>

            {view === "home" && (
              <div className="flex-grow flex flex-col items-center animate-smooth-fade-up text-center pb-20">
                <h2 className="text-4xl font-bold font-pixeloid-mono text-[#a37c49] mb-6">Запретный Архив</h2>
                <div className="relative w-full max-w-2xl mb-8 group">
                  <input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full p-4 pl-12 bg-[#2e1b13] border-2 border-[#5c3a21] rounded-lg text-[#e6d5b8] font-pixeloid-mono focus:border-[#a37c49] transition-colors shadow-lg" />
                  <Search className="absolute left-4 top-4 text-[#6b513b] group-focus-within:text-[#a37c49] transition-colors" size={24} />
                </div>
                
                {searchQuery.length > 0 || selectedCategory !== "Все" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                    {isLoading ? (
                      <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                    ) : displayedData.length > 0 ? displayedData.map((item) => (
                      <ArchiveCard 
                        key={item.id} item={item} canEdit={canEdit} canDelete={canDelete} 
                        onEdit={(item) => setEditingItem(item)} onDelete={handleDeleteItem} 
                        onViewImage={(img) => setSelectedImage(img)}
                        isFavorite={favorites.includes(item.id)} onToggleFavorite={handleToggleFavorite}
                      />
                    )) : <p className="text-center w-full col-span-2 text-[#8c6e52]">Ничего не найдено...</p>}
                  </div>
                ) : (
                  <div className="text-[#8c6e52] mt-12 text-lg font-pixeloid-mono opacity-50 flex flex-col items-center gap-4">
                    <ScrollText size={64} className="opacity-20" />
                    Используйте поиск или меню справа сверху, чтобы открыть свитки.
                  </div>
                )}
              </div>
            )}

            {view === "archive" && (
              <div className="animate-smooth-fade-up w-full text-left">
                 <div className="flex flex-wrap items-center gap-2 mb-8">
                    <button onClick={() => { setSelectedCategory("Все"); setCurrentPage(1); setShowOnlyFavorites(false); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 ${selectedCategory === "Все" && !showOnlyFavorites ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>Все</button>
                    {categories.map(c => (
                      <button key={c.id} onClick={() => { setSelectedCategory(c.name); setCurrentPage(1); setShowOnlyFavorites(false); }} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 ${selectedCategory === c.name && !showOnlyFavorites ? 'bg-[#a37c49] text-[#160d08] border-[#a37c49] shadow-[0_0_15px_rgba(163,124,73,0.3)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-[#a37c49] hover:text-[#e6d5b8]'}`}>{c.name}</button>
                    ))}
                    {/* Кнопка Только избранное */}
                    <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`px-4 py-2 rounded border font-pixeloid-mono uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 flex items-center gap-2 ml-auto ${showOnlyFavorites ? 'bg-yellow-600 text-white border-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.4)] scale-105' : 'bg-[#2e1b13] border-[#5c3a21] text-[#8c6e52] hover:border-yellow-500 hover:text-yellow-400'}`}>
                      <Star size={16} fill={showOnlyFavorites ? "currentColor" : "none"} /> Избранное
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                      <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                    ) : displayedData.length > 0 ? displayedData.map((item) => (
                      <ArchiveCard 
                        key={item.id} item={item} canEdit={canEdit} canDelete={canDelete} 
                        onEdit={(item) => setEditingItem(item)} onDelete={handleDeleteItem} 
                        onViewImage={(img) => setSelectedImage(img)}
                        isFavorite={favorites.includes(item.id)} onToggleFavorite={handleToggleFavorite}
                      />
                    )) : <p className="text-center w-full col-span-2 text-[#8c6e52]">{showOnlyFavorites ? "В избранном пока пусто..." : "В этой категории пока нет записей..."}</p>}
                 </div>
                 
                 {totalPages > 1 && !showOnlyFavorites && (
                   <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                     <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] hover:text-white active:scale-90 transition-all"><ChevronLeft size={24}/></button>
                     <span className="font-pixeloid-mono text-lg text-[#a37c49]">Стр. {currentPage} из {totalPages}</span>
                     <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-[#2e1b13] border border-[#5c3a21] rounded text-[#a37c49] disabled:opacity-30 hover:bg-[#5c3a21] hover:text-white active:scale-90 transition-all"><ChevronRight size={24}/></button>
                   </div>
                 )}
              </div>
            )}

            {view === "admin" && userRole.level >= 1 && (
              <div className="animate-smooth-fade-up w-full bg-[#2e1b13] p-8 rounded-xl border-double border-4 border-[#5c3a21]">
                <div className="flex justify-between items-center mb-8 border-b border-[#5c3a21] pb-4">
                   <h2 className="text-2xl font-bold font-pixeloid-mono text-[#a37c49]">Панель Управления</h2>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 font-pixeloid-mono text-sm">
                  <button onClick={() => setAdminTab("dashboard")} className={`px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-2 ${adminTab === 'dashboard' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><LayoutDashboard size={16}/> Дашборд</button>
                  <button onClick={() => setAdminTab("archive")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'archive' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Добавить</button>
                  <button onClick={() => setAdminTab("bulk")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'bulk' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Импорт</button>
                  <button onClick={() => setAdminTab("users")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'users' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Аккаунты</button>
                  <button onClick={() => setAdminTab("media")} className={`px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-2 ${adminTab === 'media' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><ImagePlus size={16}/> Медиа</button>
                  
                  {userRole.level >= 2 && (
                    <button onClick={() => setAdminTab("categories")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'categories' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Категории</button>
                  )}
                  {userRole.level >= 3 && (
                    <button onClick={() => setAdminTab("roles")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'roles' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Уровни</button>
                  )}
                  
                  {(userRole.id === "owner" || userRole.id === "creator") && (
                    <button onClick={() => setAdminTab("logs")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'logs' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Логи</button>
                  )}
                  <button onClick={() => setAdminTab("diag")} className={`px-4 py-2 rounded transition-all active:scale-95 ${adminTab === 'diag' ? 'bg-[#5c3a21] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Диагностика</button>
                </div>

                {adminTab === "dashboard" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-smooth-fade-up">
                    <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg">
                      <ScrollText size={40} className="mx-auto text-[#a37c49] mb-4" />
                      <h3 className="text-3xl font-bold text-[#e6d5b8]">{stats.archives}</h3>
                      <p className="text-[#8c6e52] font-pixeloid-mono mt-2">Записей в архиве</p>
                    </div>
                    <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg">
                      <Users size={40} className="mx-auto text-[#a37c49] mb-4" />
                      <h3 className="text-3xl font-bold text-[#e6d5b8]">{stats.users}</h3>
                      <p className="text-[#8c6e52] font-pixeloid-mono mt-2">Пользователей</p>
                    </div>
                    <div className="bg-[#1c110b] p-6 rounded-xl border border-[#5c3a21] text-center shadow-lg">
                      <Tag size={40} className="mx-auto text-[#a37c49] mb-4" />
                      <h3 className="text-3xl font-bold text-[#e6d5b8]">{stats.categories}</h3>
                      <p className="text-[#8c6e52] font-pixeloid-mono mt-2">Категорий</p>
                    </div>
                  </div>
                )}

                {adminTab === "archive" && (
                  <div className="animate-smooth-fade-up">
                    <form onSubmit={handleAddMultipleItems} className="space-y-6 max-w-xl">
                      {newItems.map((item, index) => (
                        <div key={index} className="p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg">
                          <div className="space-y-3">
                            <input required placeholder="Название" value={item.title} onChange={e => { const upd = [...newItems]; upd[index].title = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none transition-colors" />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <select value={item.category} onChange={e => { const upd = [...newItems]; upd[index].category = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none">
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                              <select value={item.dangerLevel} onChange={e => { const upd = [...newItems]; upd[index].dangerLevel = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none">
                                {DANGER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>
                            
                            <textarea required placeholder="Описание (Markdown)" value={item.description} onChange={e => { const upd = [...newItems]; upd[index].description = e.target.value; setNewItems(upd); }} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white h-20 focus:border-[#a37c49] outline-none transition-colors" />
                            
                            <label className="flex items-center gap-2 text-sm text-[#a37c49] font-pixeloid-mono cursor-pointer">
                              <input type="checkbox" checked={item.is_draft === 1} onChange={e => { const upd = [...newItems]; upd[index].is_draft = e.target.checked ? 1 : 0; setNewItems(upd); }} />
                              Сохранить как черновик (скрыто от пользователей)
                            </label>

                            <div className="mt-2 border-t border-[#5c3a21] pt-3">
                              <label className="block text-xs font-pixeloid-mono text-[#a37c49] mb-2 flex items-center gap-1"><ImageIcon size={14}/> Картинка (до 2МБ)</label>
                              {!item.image ? (
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} className="w-full text-sm text-[#8c6e52] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#3d2617] file:text-[#e6d5b8] hover:file:bg-[#5c3a21] file:cursor-pointer" />
                              ) : (
                                <div className="relative inline-block border-2 border-[#5c3a21] rounded-lg overflow-hidden" style={{ backgroundColor: '#d6c5b3' }}>
                                  <img src={item.image} alt="Preview" className="h-32 object-contain p-2" />
                                  <button type="button" onClick={() => { const upd = [...newItems]; upd[index].image = ""; setNewItems(upd); }} className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors"><X size={14} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-4">
                        <button type="button" onClick={() => setNewItems([...newItems, { ...INITIAL_NEW_ITEM }])} className="px-4 py-2 bg-[#3d2617] border border-[#5c3a21] text-white rounded hover:bg-[#5c3a21] active:scale-95 transition-all">Добавить ещё</button>
                        <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Сохранить</button>
                      </div>
                    </form>

                    {userRole.id === "owner" && (
                      <div className="mt-12 pt-6 border-t border-red-900/50 max-w-xl animate-smooth-fade-up">
                        <h3 className="text-red-500 font-bold font-pixeloid-mono mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Опасная зона</h3>
                        <p className="text-sm text-gray-500 mb-4">Эта кнопка безвозвратно удалит ВСЕ записи из архива.</p>
                        <button onClick={handleClearDatabase} className="px-6 py-2 bg-red-900/20 border border-red-500 text-red-400 font-bold rounded hover:bg-red-900/40 active:scale-95 transition-all">
                          Очистить базу данных
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {adminTab === "media" && (
                  <div className="animate-smooth-fade-up w-full">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4">Галерея картинок</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mediaList.map(m => (
                        <div key={m.id} className="bg-[#1c110b] border border-[#5c3a21] rounded-lg p-2 relative group">
                          <img src={m.image} alt={m.title} className="w-full h-32 object-cover rounded" />
                          <div className="mt-2 text-xs text-center truncate">{m.title}</div>
                          <button onClick={() => handleDeleteMedia(m.id)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                      ))}
                      {mediaList.length === 0 && <p className="col-span-full text-center text-[#8c6e52] py-8">Нет загруженных картинок</p>}
                    </div>
                  </div>
                )}

                {adminTab === "categories" && userRole.level >= 2 && (
                  <div className="animate-smooth-fade-up max-w-xl">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Tag size={18}/> Управление категориями</h3>
                    <div className="flex gap-2 mb-6">
                      <input type="text" placeholder="Новая категория..." value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-grow p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
                      <button onClick={handleAddCategory} className="px-4 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Добавить</button>
                    </div>
                    <div className="space-y-2">
                      {categories.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-[#1c110b] border border-[#5c3a21] rounded">
                          <span className="font-pixeloid-mono text-[#e6d5b8]">{c.name}</span>
                          <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-400 p-1.5 rounded active:scale-90 transition-all"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "roles" && userRole.level >= 3 && (
                  <div className="animate-smooth-fade-up max-w-2xl">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><ShieldAlert size={18}/> Уровни доступа (Роли)</h3>
                    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#1c110b] border border-[#5c3a21] rounded-lg">
                      <input type="text" placeholder="Название роли..." value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="flex-grow p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
                      <input type="number" placeholder="Уровень (цифра)" value={newRoleLevel} onChange={e => setNewRoleLevel(parseInt(e.target.value))} className="w-32 p-2 bg-[#160d08] border border-[#5c3a21] rounded text-white focus:border-[#a37c49] outline-none" />
                      <button onClick={handleAddRole} className="px-4 py-2 bg-[#5c3a21] border border-[#a37c49] text-white font-bold rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Создать</button>
                    </div>
                    <div className="space-y-2">
                      {roles.map(r => (
                        <div key={r.id} className="flex flex-wrap items-center gap-2 p-3 bg-[#1c110b] border border-[#5c3a21] rounded">
                          <input type="text" value={r.name} onChange={e => {
                            const newRoles = roles.map(role => role.id === r.id ? { ...role, name: e.target.value } : role);
                            setRoles(newRoles);
                          }} className="flex-grow p-1 bg-transparent border-b border-transparent hover:border-[#5c3a21] focus:border-[#a37c49] outline-none text-white font-pixeloid-mono" />
                          <input type="number" value={r.level} onChange={e => {
                            const newRoles = roles.map(role => role.id === r.id ? { ...role, level: parseInt(e.target.value) } : role);
                            setRoles(newRoles);
                          }} className="w-20 p-1 bg-[#160d08] border border-[#5c3a21] rounded text-center text-white" title="Уровень доступа" />
                          
                          {(userRole.id === "owner" || userRole.level > r.level) && (
                            <button onClick={() => handleUpdateRole(r.id, r.name, r.level)} className="text-green-500 hover:text-green-400 p-1.5 rounded active:scale-90 transition-all" title="Сохранить изменения"><Save size={16}/></button>
                          )}
                          
                          {r.id !== "owner" && (userRole.id === "owner" || userRole.level > r.level) && (
                            <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-400 p-1.5 rounded active:scale-90 transition-all" title="Удалить роль"><Trash2 size={16}/></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "bulk" && (
                  <div className="space-y-8 max-w-2xl animate-smooth-fade-up">
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Upload size={18}/> Массовый импорт</h3>
                      <textarea placeholder="Вставьте JSON сюда..." value={bulkJson} onChange={e => setBulkJson(e.target.value)} className="w-full p-3 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] font-mono text-sm focus:border-[#a37c49] outline-none h-48" />
                      <button onClick={handleBulkImport} className="mt-4 px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] active:scale-95 transition-all shadow-lg">Импортировать</button>
                    </div>
                    <div className="bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Download size={18}/> Экспорт</h3>
                      <button onClick={handleExport} className="px-6 py-2 bg-[#3d2617] border border-[#5c3a21] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#5c3a21] active:scale-95 transition-all shadow-lg">Скачать файл</button>
                    </div>
                  </div>
                )}

                {adminTab === "users" && (
                  <div className="space-y-10 font-sans animate-smooth-fade-up">
                    <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl bg-[#1c110b] p-6 rounded-lg border border-[#5c3a21]">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><Plus size={18}/> Создать аккаунт</h3>
                      <input required placeholder="Название аккаунта" value={newAcc.account_name} onChange={e => setNewAcc({...newAcc, account_name: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none" />
                      <div className="flex items-center gap-2"><input required={!autoUser} placeholder="Логин" value={newAcc.username} onChange={e => setNewAcc({...newAcc, username: e.target.value})} disabled={autoUser} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono hover:text-white transition-colors"><input type="checkbox" checked={autoUser} onChange={e => setAutoUser(e.target.checked)} /> Рандом</label></div>
                      <div className="flex items-center gap-2"><input required={!autoPass} placeholder="Пароль" value={newAcc.password} onChange={e => setNewAcc({...newAcc, password: e.target.value})} disabled={autoPass} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none disabled:opacity-50" /><label className="flex items-center gap-1 text-sm text-[#8c6e52] cursor-pointer font-pixeloid-mono hover:text-white transition-colors"><input type="checkbox" checked={autoPass} onChange={e => setAutoPass(e.target.checked)} /> Рандом</label></div>
                      
                      <select value={newAcc.role} onChange={e => setNewAcc({...newAcc, role: e.target.value})} className="w-full p-2 bg-[#160d08] border border-[#5c3a21] rounded text-[#e6d5b8] focus:border-[#a37c49] outline-none">
                         {roles
                           .filter(r => userRole.id === "owner" || r.level < userRole.level)
                           .map(r => <option key={r.id} value={r.id}>{r.name} (Ур. {r.level})</option>)
                         }
                      </select>
                      <button type="submit" className="px-6 py-2 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded hover:bg-[#7a4f2e] active:scale-95 transition-all">Сгенерировать</button>
                    </form>
                    
                    <div>
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Users size={18}/> Список аккаунтов</h3>
                      <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono text-sm"><th className="p-3">Имя</th><th className="p-3">Роль</th><th className="p-3">Логин</th><th className="p-3">Пароль</th><th className="p-3">Действие</th></tr></thead>
                          <tbody>
                            {usersList.map(u => {
                              const roleObj = roles.find(r => r.id === u.role);
                              const roleLevel = roleObj ? roleObj.level : 0;
                              return (
                                <tr key={u.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                                  <td className="p-3 font-medium">{u.account_name}</td>
                                  <td className={`p-3 text-sm font-bold font-pixeloid-mono ${getRoleColor(roleLevel)}`}>{roleObj?.name || u.role}</td>
                                  <td className="p-3 font-mono text-[#c4b5a5]">{u.username}</td>
                                  <td className="p-3 font-mono text-red-400 bg-red-500/5">{u.plain_password || "********"}</td>
                                  <td className="p-3">
                                    {userRole.level > roleLevel && u.id !== user.id && (
                                      <button onClick={() => handleDeleteUser(u.id, u.account_name)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded active:scale-90 transition-all"><Trash2 size={16} /></button>
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

                {adminTab === "logs" && (userRole.id === "owner" || userRole.id === "creator") && (
                  <div className="animate-smooth-fade-up">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] flex items-center gap-2"><History size={18}/> История действий (Последние 100)</h3>
                      <button onClick={handleClearLogs} className="px-4 py-2 bg-red-900/20 border border-red-500 text-red-400 font-bold rounded hover:bg-red-900/40 active:scale-95 transition-all text-sm flex items-center gap-2">
                        <Trash2 size={16}/> Очистить логи
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#5c3a21]">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1c110b]"><tr className="text-[#8c6e52] border-b border-[#5c3a21] font-pixeloid-mono text-sm"><th className="p-3">Время</th><th className="p-3">Действие</th><th className="p-3">Запись</th><th className="p-3">Кто</th></tr></thead>
                        <tbody>
                          {logsList.map(log => (
                            <tr key={log.id} className="border-b border-[#3d2617] hover:bg-[#1c110b] transition-colors">
                              <td className="p-3 text-xs text-[#8c6e52]">{new Date(log.timestamp).toLocaleString('ru-RU')}</td>
                              <td className={`p-3 font-bold font-pixeloid-mono ${log.action === 'УДАЛЕНИЕ' ? 'text-red-400' : log.action === 'СОЗДАНИЕ' ? 'text-green-400' : 'text-blue-400'}`}>{log.action}</td>
                              <td className="p-3 text-sm">{log.item_title}</td>
                              <td className="p-3 text-sm">{log.user_name}</td>
                            </tr>
                          ))}
                          {logsList.length === 0 && (
                            <tr><td colSpan={4} className="text-center p-6 text-[#8c6e52]">Логи пусты</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === "diag" && (
                  <div className="max-w-xl font-sans animate-smooth-fade-up">
                    <h3 className="text-lg font-bold font-pixeloid-mono text-[#a37c49] mb-4 flex items-center gap-2"><Database size={18}/> Проверка</h3>
                    <button onClick={async () => {
                      setDiagResult(null);
                      const res = await fetch("/api/admin/diagnostics");
                      setDiagResult(await res.json());
                    }} className="px-6 py-3 bg-[#5c3a21] border border-[#a37c49] text-[#e6d5b8] font-bold font-pixeloid-mono rounded-lg hover:bg-[#7a4f2e] active:scale-95 flex items-center gap-2 mb-6 shadow-lg transition-all"><Activity size={18}/> Запустить тест</button>
                    
                    {diagResult && (
                      <div className={`p-6 rounded-xl border animate-smooth-pop ${diagResult.status === 'ok' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <p className="text-[#e6d5b8] mb-2">{diagResult.message}</p>
                        {diagResult.latency !== undefined && (<p className="text-sm text-[#8c6e52] font-mono">Пинг: {diagResult.latency} мс</p>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* КНОПКА "НАВЕРХ" */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-6 z-[100] p-3 bg-[#5c3a21] border-2 border-[#a37c49] text-[#e6d5b8] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.6)] hover:bg-[#a37c49] hover:text-[#1a1512] hover:-translate-y-1 transition-all duration-300 animate-smooth-pop"
          title="Наверх"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <div className="fixed bottom-4 right-4 z-[100] bg-[#1c110b]/70 border border-[#5c3a21]/40 px-3 py-1.5 rounded-md text-[11px] text-[#8c6e52]/70 font-pixeloid-mono hover:text-[#a37c49] transition-colors cursor-default select-none">Автор: muruh1ta</div>
    </main>
  );
}
