"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArchiveItem, DbArchiveItem, User, DbUser, LogItem, NewArchiveItem, RoleItem, CategoryItem, InfoPage, ImportJsonItem } from "@/types";
import { DEFAULT_CATEGORIES, DEFAULT_ROLES, DEFAULT_INFO_PAGES, INITIAL_NEW_ITEM, RUNES } from "@/constants";
import { LoginBook } from "@/components/ui/LoginBook";
import { Header } from "@/components/ui/Header";
import { HomeView } from "@/components/views/HomeView";
import { ArchiveView } from "@/components/views/ArchiveView";
import { AdminView } from "@/components/views/AdminView";
import { Modals } from "@/components/Modals";
import { ArrowUp, CheckCircle2, Skull, AlertTriangle, Info } from "lucide-react";

export default function TavernArchive() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const trail1Ref = useRef<HTMLDivElement>(null);
  const trail2Ref = useRef<HTMLDivElement>(null);
  const trail3Ref = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ msg: string, onConfirm: () => void } | null>(null);
  const [promptDialog, setPromptDialog] = useState<{ msg: string, val: string, onConfirm: (val: string) => void } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000); // Увеличил время показа ошибок до 5 сек
  }, []);
  
  const showConfirm = useCallback((msg: string, onConfirm: () => void) => setConfirmDialog({ msg, onConfirm }), []);
  const showPrompt = useCallback((msg: string, onConfirm: (val: string) => void) => setPromptDialog({ msg, val: "", onConfirm }), []);

  const [data, setData] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [view, setView] = useState<"home" | "archive" | "admin">("home");
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [infoPages, setInfoPages] = useState<InfoPage[]>(DEFAULT_INFO_PAGES);
  const [activePage, setActivePage] = useState<InfoPage | null>(null);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [editPageContent, setEditPageContent] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBookOpening, setIsBookOpening] = useState(false);
  const [isBookClosing, setIsBookClosing] = useState(false);
  const [startBookCloseAnim, setStartBookCloseAnim] = useState(false);

  const [newAccountName, setNewAccountName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPass, setNewPass] = useState("");
  const [oldPass, setOldPass] = useState("");

  const [newItems, setNewItems] = useState<NewArchiveItem[]>([{ ...INITIAL_NEW_ITEM }]);
  const [newAcc, setNewAcc] = useState({ account_name: "", username: "", password: "", role: "low" });
  const [autoUser, setAutoUser] = useState(false);
  const [autoPass, setAutoPass] = useState(false);
  
  const [bulkJson, setBulkJson] = useState(""); 
  const [bulkText, setBulkText] = useState("");
  const [adminTab, setAdminTab] = useState<"dashboard" | "archive" | "bulk" | "users" | "diag" | "logs" | "categories" | "roles" | "media">("dashboard");
  
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [stats, setStats] = useState({ archives: 0, users: 0, categories: 0 });
  const [mediaList, setMediaList] = useState<{ id: number, title: string, image: string }[]>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLevel, setNewRoleLevel] = useState(1);

  const playSound = useCallback((type: string) => {}, []);

  const handleApiError = useCallback((status: number) => {
    if (status === 401) {
      setTimeout(() => {
        setUser(null); setFavorites([]); localStorage.removeItem("tavern_session"); setView("home"); 
      }, 0);
      showToast("Сессия истекла, войдите снова", "warning");
    }
  }, [showToast]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMouseMove = (e: MouseEvent) => {
      const transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      [cursorDotRef, trail1Ref, trail2Ref, trail3Ref].forEach(ref => { if (ref.current) ref.current.style.transform = transform; });
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, select, textarea, [role="button"]');
      if (isClickable && !isHovering.current) { isHovering.current = true; cursorDotRef.current?.classList.add("hovering"); }
      else if (!isClickable && isHovering.current) { isHovering.current = false; cursorDotRef.current?.classList.remove("hovering"); }
    };
    const onMouseDown = (e: MouseEvent) => {
      const newClick = { id: Date.now(), x: e.clientX, y: e.clientY };
      setClicks((prev) => [...prev, newClick]);
      setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== newClick.id)), 500);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mousedown", onMouseDown); };
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const catRes = await fetch('/api/admin/categories');
      if (catRes.ok) { const d = await catRes.json(); if (d && d.length > 0) setCategories(d); }
      const roleRes = await fetch('/api/admin/roles');
      if (roleRes.ok) { const d = await roleRes.json(); if (d && d.length > 0) setRoles(d); }
      const infoRes = await fetch('/api/info-pages');
      if (infoRes.ok) { const d = await infoRes.json(); if (d && d.length > 0) setInfoPages(d); }
    } catch {}
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch(`/api/favorites`);
      if (res.ok) setFavorites(await res.json()); else handleApiError(res.status);
    } catch {}
  }, [handleApiError]);

  const handleToggleFavorite = useCallback(async (archiveId: number) => {
    if (!user) return showToast("Войдите, чтобы добавлять в избранное", "warning");
    const isFav = favorites.includes(archiveId);
    setFavorites(prev => isFav ? prev.filter(id => id !== archiveId) : [...prev, archiveId]);
    try {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archiveId, action: isFav ? "remove" : "add" }) });
    } catch {
      setFavorites(prev => isFav ? [...prev, archiveId] : prev.filter(id => id !== archiveId));
      showToast("Ошибка сохранения", "error");
    }
  }, [user, favorites, showToast]);

  const fetchArchive = useCallback(async (page = 1, cat = selectedCategory, search = debouncedSearch) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/archive?page=${page}&limit=${LIMIT}&category=${encodeURIComponent(cat)}&search=${encodeURIComponent(search)}`);
      const result = await res.json();
      const formatted = (result.items || []).map((item: DbArchiveItem) => {
        let parsedImages: string[] = [];
        if (item.image) {
          if (item.image.trim().startsWith('[')) { try { parsedImages = JSON.parse(item.image); } catch { parsedImages = [item.image]; } }
          else { parsedImages = [item.image]; }
        }
        return { id: item.id, title: item.title, category: item.category, description: item.description, symbol: item.symbol || undefined, dangerLevel: item.danger_level || undefined, images: parsedImages, is_draft: item.is_draft };
      });
      setData(formatted); setTotalPages(Math.ceil((result.total || 0) / LIMIT)); setCurrentPage(page);
    } catch { setData([]); } finally { setIsLoading(false); }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("tavern_session");
      if (s) {
        const { userData, expiresAt } = JSON.parse(s);
        if (Date.now() < expiresAt) { setUser(userData); fetchFavorites(); }
        else localStorage.removeItem("tavern_session"); 
      }
    } catch { localStorage.removeItem("tavern_session"); } 
    finally { setIsCheckingAuth(false); }
    fetchSettings();
  }, [fetchFavorites, fetchSettings]);

  useEffect(() => { if (user) fetchArchive(currentPage, selectedCategory, debouncedSearch); }, [user, currentPage, selectedCategory, debouncedSearch, fetchArchive]);

  const userRole = roles.find(r => r.id === user?.role) || DEFAULT_ROLES.find(r => r.id === user?.role) || { level: 0, id: "guest", name: "Гость" };
  const canEdit = user?.role === 'owner' || user?.role === 'creator' || userRole.level >= 3;
  const canDelete = user?.role === 'owner' || user?.role === 'creator' || user?.role === 'high' || userRole.level >= 1;
  const getRoleColor = (level: number) => level >= 4 ? "text-owner-glow" : level === 3 ? "text-purple-500" : level === 2 ? "text-blue-500" : level === 1 ? "text-green-500" : "text-gray-400";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: loginUser, password: loginPass }) });
      const d = await res.json();
      if (res.ok) {
        setIsBookOpening(true);
        setTimeout(() => {
          setUser({ ...d }); setLoginUser(""); setLoginPass(""); fetchFavorites();
          localStorage.setItem("tavern_session", JSON.stringify({ userData: { ...d }, expiresAt: Date.now() + (5 * 60 * 60 * 1000) }));
          setIsBookOpening(false);
        }, 1500);
      } else setLoginError(d.error || "Ошибка входа");
    } catch { setLoginError("Ошибка соединения"); }
  };

  const handleLogout = useCallback(() => {
    setIsBookClosing(true); setStartBookCloseAnim(false); setLoginUser(""); setLoginPass(""); setLoginError("");
    document.cookie = "tavern_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setTimeout(() => setStartBookCloseAnim(true), 50);
    setTimeout(() => { setUser(null); setFavorites([]); localStorage.removeItem("tavern_session"); setView("home"); setIsBookClosing(false); setStartBookCloseAnim(false); }, 1600);
  }, []);

  const openProfile = () => { if (user) { setNewAccountName(user.account_name); setNewUsername(user.username); setNewPass(""); setOldPass(""); setShowProfile(true); } };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    const res = await fetch("/api/user/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass, avatar: user.avatar, newUsername: newUsername !== user.username ? newUsername : undefined, newAccountName: newAccountName !== user.account_name ? newAccountName : undefined }) });
    if (res.status === 401) return handleApiError(401);
    const d = await res.json();
    if (res.ok) {
      showToast("Профиль обновлен!", "success"); setOldPass(""); setNewPass("");
      const updated = { ...user, username: newUsername || user.username, account_name: newAccountName || user.account_name };
      setUser(updated);
      const saved = JSON.parse(localStorage.getItem("tavern_session")!); saved.userData = updated; localStorage.setItem("tavern_session", JSON.stringify(saved));
    } else showToast(`Ошибка: ${d.error}`, "error");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 500 * 1024) return showToast("Максимум 500КБ!", "warning");
    const reader = new FileReader(); reader.onloadend = () => setUser(prev => prev ? { ...prev, avatar: reader.result as string } : null); reader.readAsDataURL(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    const isEditing = index === undefined;
    const currentImages = isEditing ? (editingItem?.images || []) : (newItems[index!].images || []);
    if (currentImages.length + files.length > 3) return showToast("Максимум 3 картинки!", "warning");
    
    for (const file of Array.from(files)) {
      if (file.size > 1024 * 1024) { showToast(`Файл ${file.name} > 1МБ`, "warning"); continue; }
      const formData = new FormData(); formData.append('file', file);
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        
        // Читаем ответ как текст, чтобы перехватить HTML-ошибку, если API нет
        const text = await res.text();
        let d;
        try {
          d = JSON.parse(text);
        } catch {
          throw new Error(`Сервер вернул не JSON (Код: ${res.status}). Возможно, отсутствует /api/upload`);
        }

        if (res.ok && d.url) {
          if (isEditing) setEditingItem(prev => prev ? { ...prev, images: [...(prev.images || []), d.url] } : null);
          else setNewItems(prev => { const u = [...prev]; u[index!].images = [...(u[index!].images || []), d.url]; return u; });
        } else {
          showToast(d.error || 'Ошибка загрузки', 'error');
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        // Показываем реальную причину
        showToast(err.message || 'Ошибка соединения при загрузке', 'error');
      }
    }
    e.target.value = '';
  };

  const handleRemoveImage = (imgIndex: number, formIndex?: number) => {
    if (formIndex !== undefined) setNewItems(prev => { const u = [...prev]; u[formIndex].images = u[formIndex].images?.filter((_, i) => i !== imgIndex); return u; });
    else if (editingItem) setEditingItem({ ...editingItem, images: editingItem.images?.filter((_, i) => i !== imgIndex) });
  };

  const handleDeleteItem = useCallback((id: number, title: string) => {
    if (!user) return;
    showConfirm(`Удалить запись "${title}"?`, async () => {
      const res = await fetch(`/api/archive?id=${id}`, { method: "DELETE" });
      if (res.status === 401) return handleApiError(401);
      fetchArchive(currentPage); showToast("Запись удалена", "info");
    });
  }, [user, showConfirm, fetchArchive, currentPage, showToast, handleApiError]);

  const handleClearDatabase = () => {
    if (!user || userRole.id !== "owner") return;
    showPrompt("Введите 'УДАЛИТЬ':", async (val) => {
      if (val !== "УДАЛИТЬ") return showToast("Отменено", "warning");
      const res = await fetch(`/api/archive?clear=true`, { method: "DELETE" });
      if (res.ok) { showToast("База очищена!", "success"); fetchArchive(1); } else showToast("Ошибка", "error");
    });
  };

  const handleClearLogs = () => {
    if (!user || (userRole.id !== "owner" && userRole.id !== "creator")) return;
    showConfirm("Очистить логи?", async () => {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) { setLogsList([]); showToast("Логи очищены", "success"); }
    });
  };

  const handleAddMultipleItems = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    const valid = newItems.filter(i => i.title.trim() && i.description.trim());
    if (valid.length === 0) return showToast("Заполните форму", "warning");
    const payload = valid.map(i => ({ ...i, image: i.images && i.images.length > 0 ? JSON.stringify(i.images) : null }));
    const res = await fetch("/api/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { const d = await res.json(); showToast(`Добавлено ${d.count} записей!`, "success"); fetchArchive(1); setNewItems([{ ...INITIAL_NEW_ITEM }]); }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingItem || !user) return;
    const payload = { ...editingItem, image: editingItem.images && editingItem.images.length > 0 ? JSON.stringify(editingItem.images) : null };
    const res = await fetch("/api/archive", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { showToast("Обновлено!", "success"); setEditingItem(null); fetchArchive(currentPage); }
  };

  const handleAddCategory = async () => { if (!newCatName.trim()) return; const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCatName }) }); if (res.ok) { setNewCatName(""); fetchSettings(); showToast("Добавлено", "success"); } };
  const handleDeleteCategory = (id: number) => showConfirm("Удалить?", async () => { const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" }); if (res.ok) { fetchSettings(); showToast("Удалено", "info"); } });
  const handleAddRole = async () => { if (!newRoleName.trim()) return; const res = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newRoleName, level: newRoleLevel }) }); if (res.ok) { setNewRoleName(""); setNewRoleLevel(1); fetchSettings(); showToast("Создано", "success"); } };
  const handleUpdateRole = async (id: string, name: string, level: number) => { const res = await fetch("/api/admin/roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name, level }) }); if (res.ok) { fetchSettings(); showToast("Обновлено", "success"); } };
  const handleDeleteRole = (id: string) => showConfirm("Удалить роль?", async () => { const res = await fetch(`/api/admin/roles?id=${id}`, { method: "DELETE" }); if (res.ok) { fetchSettings(); showToast("Удалено", "info"); } });

  const generateRandom = (length = 15) => { const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"; let r = ""; for (let i = 0; i < length; i++) r += c.charAt(Math.floor(Math.random() * c.length)); return r; };
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    const finalU = autoUser ? generateRandom(15) : newAcc.username; const finalP = autoPass ? generateRandom(15) : newAcc.password;
    const res = await fetch("/api/admin/create-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newAcc, username: finalU, password: finalP }) });
    if (res.ok) {
      showToast(`Создан! Логин: ${finalU} | Пароль: ${finalP}`, "success");
      const blob = new Blob([`Логин: ${finalU}\nПароль: ${finalP}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `Доступ_${newAcc.account_name}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNewAcc({ account_name: "", username: "", password: "", role: roles[roles.length - 1]?.id || "low" }); setAutoUser(false); setAutoPass(false); fetchUsers();
    } else { const d = await res.json(); showToast(d.error, "error"); }
  };
  const handleDeleteUser = (id: number, name: string) => showConfirm(`Удалить "${name}"?`, async () => { const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" }); if (res.ok) { fetchUsers(); showToast("Удален", "info"); } else { const d = await res.json(); showToast(d.error, "error"); } });

  const fetchUsers = async () => { if (!user) return; const res = await fetch(`/api/admin/users`); if (res.ok) setUsersList(await res.json()); };
  const fetchLogs = async () => { const res = await fetch("/api/admin/logs"); if (res.ok) setLogsList(await res.json()); };
  const fetchStats = async () => { const res = await fetch("/api/admin/stats"); if (res.ok) setStats(await res.json()); };
  const fetchMedia = async () => { const res = await fetch("/api/admin/images"); if (res.ok) setMediaList(await res.json()); };
  const handleDeleteMedia = (id: number) => showConfirm("Удалить картинку?", async () => { const res = await fetch(`/api/admin/images?id=${id}`, { method: "DELETE" }); if (res.ok) { fetchMedia(); showToast("Удалено", "success"); } });

  const handleExport = async () => { const res = await fetch("/api/archive?limit=9999"); const d = await res.json(); const e = (d.items || []).map((i: any) => { let img = []; if (i.image) { if (i.image.startsWith('[')) { try { img = JSON.parse(i.image); } catch { img = [i.image]; } } else img = [i.image]; } return { title: i.title, category: i.category, description: i.description, symbol: i.symbol, dangerLevel: i.danger_level, images: img }; }); const b = new Blob([JSON.stringify(e, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "export.json"; a.click(); };
  const handleExportCSV = async () => { const res = await fetch("/api/archive?limit=9999"); const d = await res.json(); const h = ["Название","Категория","Описание","Символ","Уровень","Картинки"].join(","); const r = (d.items || []).map((i: any) => [`"${(i.title||'').replace(/"/g,'""')}"`,`"${(i.category||'').replace(/"/g,'""')}"`,`"${(i.description||'').replace(/"/g,'""')}"`,`"${(i.symbol||'').replace(/"/g,'""')}"`,`"${(i.danger_level||'').replace(/"/g,'""')}"`,`"${(i.image||'').replace(/"/g,'""')}"`].join(",")); const b = new Blob(["\uFEFF" + [h, ...r].join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "export.csv"; a.click(); };

  const handleBulkImport = async () => { try { const p = JSON.parse(bulkJson) as ImportJsonItem[]; if (!Array.isArray(p)) throw new Error(); const pl = p.map(i => ({ ...i, image: i.images && Array.isArray(i.images) ? JSON.stringify(i.images) : (i.image || null) })); const res = await fetch("/api/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pl) }); if (res.ok) { const d = await res.json(); showToast(`Добавлено ${d.count}!`, "success"); setBulkJson(""); fetchArchive(1); } } catch { showToast("Ошибка JSON", "error"); } };

  const handleTextImport = async () => {
    if (!user || !bulkText.trim()) return;
    try {
      const b = bulkText.split('---').filter(x => x.trim());
      const p = b.map(block => {
        let t = "", c = "Другое", dL = "Низкий", dLns: string[] = [], pD = false;
        block.split('\n').forEach(line => {
          const l = line.toLowerCase();
          if (l.startsWith("название:")) t = line.substring(9).trim();
          else if (l.startsWith("категория:")) { const cat = line.substring(10).trim().toLowerCase(); const f = categories.find(x => x.name.toLowerCase() === cat); c = f ? f.name : "Другое"; }
          else if (l.startsWith("уровень:")) dL = line.substring(8).trim();
          else if (l.startsWith("описание:")) { dLns.push(line.substring(9).trim()); pD = true; }
          else if (pD) dLns.push(line);
        });
        return { title: t, category: c, description: dLns.join('\n').trim(), dangerLevel: dL, is_draft: 0, symbol: "", image: null };
      }).filter(x => x.title && x.description);
      if (p.length === 0) return showToast("Нет корректных записей", "warning");
      const res = await fetch("/api/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      if (res.ok) { const d = await res.json(); showToast(`Добавлено ${d.count}!`, "success"); setBulkText(""); fetchArchive(1); }
    } catch { showToast("Ошибка", "error"); }
  };

  const handleSaveInfoPage = async () => {
    if (!activePage) return;
    const res = await fetch("/api/info-pages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activePage.id, content: editPageContent }) });
    if (res.ok) { showToast("Сохранено", "success"); setIsEditingPage(false); const u = infoPages.map(p => p.id === activePage.id ? { ...p, content: editPageContent } : p); setInfoPages(u); setActivePage({ ...activePage, content: editPageContent }); }
  };

  useEffect(() => {
    if (view === "admin") {
      if (adminTab === "users" && userRole.level >= 2) fetchUsers();
      if (adminTab === "logs") fetchLogs();
      if (adminTab === "dashboard") fetchStats();
      if (adminTab === "media") fetchMedia();
    }
  }, [view, adminTab, userRole.level]);

  const displayedData = showOnlyFavorites ? data.filter(item => favorites.includes(item.id)) : data;

  if (isCheckingAuth) return <main className="min-h-screen bg-[#160d08]"></main>;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#160d08] text-[#e6d5b8] font-sans flex flex-col">
      <div ref={cursorDotRef} className="custom-cursor-dot hidden md:block pointer-events-none" />
      <div ref={trail1Ref} className="custom-cursor-trail trail-1 hidden md:block pointer-events-none" />
      <div ref={trail2Ref} className="custom-cursor-trail trail-2 hidden md:block pointer-events-none" />
      <div ref={trail3Ref} className="custom-cursor-trail trail-3 hidden md:block pointer-events-none" />
      {clicks.map(c => <div key={c.id} className="cursor-click-ripple" style={{ left: c.x, top: c.y }} />)}
      <div className="pixel-stars pointer-events-none"></div>
      <div className="fog-container pointer-events-none"><div className="fog-layer"></div><div className="fog-layer"></div></div>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">{RUNES.slice(0, 6).map((r, i) => <div key={i} className="rune pointer-events-none">{r}</div>)}</div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #a37c49 0%, transparent 70%)" }}></div>

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] animate-smooth-pop pointer-events-none">
          <div className={`px-6 py-4 rounded-lg border-2 shadow-lg flex items-center gap-3 font-pixeloid-mono backdrop-blur-md ${toast.type === 'success' ? 'bg-[#1a2e1c]/95 border-green-500' : toast.type === 'error' ? 'bg-[#2e1a1a]/95 border-red-500' : toast.type === 'warning' ? 'bg-[#2e2a1a]/95 border-orange-500' : 'bg-[#2e1b13]/95 border-[#a37c49]'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} className="text-green-400" /> : toast.type === 'error' ? <Skull size={24} className="text-red-400" /> : toast.type === 'warning' ? <AlertTriangle size={24} className="text-orange-400" /> : <Info size={24} className="text-[#a37c49]" />}
            {toast.msg}
          </div>
        </div>
      )}

      <Modals 
        confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog}
        promptDialog={promptDialog} setPromptDialog={setPromptDialog}
        editingItem={editingItem} setEditingItem={setEditingItem} handleUpdateItem={handleUpdateItem}
        selectedImage={selectedImage} setSelectedImage={setSelectedImage}
        activePage={activePage} setActivePage={setActivePage} isEditingPage={isEditingPage} setIsEditingPage={setIsEditingPage} editPageContent={editPageContent} setEditPageContent={setEditPageContent} handleSaveInfoPage={handleSaveInfoPage}
        showProfile={showProfile} setShowProfile={setShowProfile} user={user} handleUpdateProfile={handleUpdateProfile} handleAvatarUpload={handleAvatarUpload}
        newAccountName={newAccountName} setNewAccountName={setNewAccountName} newUsername={newUsername} setNewUsername={setNewUsername} newPass={newPass} setNewPass={setNewPass} oldPass={oldPass} setOldPass={setOldPass}
        categories={categories} handleImageUpload={handleImageUpload} handleRemoveImage={handleRemoveImage} userRole={userRole}
      />

      <LoginBook 
        isBookOpening={isBookOpening} isBookClosing={isBookClosing} startBookCloseAnim={startBookCloseAnim}
        loginUser={loginUser} setLoginUser={setLoginUser} loginPass={loginPass} setLoginPass={setLoginPass} loginError={loginError} handleLogin={handleLogin}
        isVisible={!user || isBookClosing}
      />

      {user && (
        <div className="flex-grow flex flex-col relative z-10 w-full animate-content-fade">
          <Header user={user} userRole={userRole} infoPages={infoPages} view={view} setView={setView} openProfile={openProfile} handleLogout={handleLogout} setActivePage={setActivePage} playSound={playSound} getRoleColor={getRoleColor} />
          
          <div className="max-w-5xl mx-auto px-6 pb-12 w-full flex flex-col flex-grow -mt-16">
            <header className="flex justify-center mb-8">
              <img src="/logo.png" alt="Сытый Лис" onClick={() => setView("home")} className="w-24 h-24 object-cover rounded-full border-4 border-[#5c3a21] animate-float bg-[#1c110b] hover:scale-105 transition-all cursor-pointer no-select" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </header>

            {view === "home" && (
              <HomeView searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} isLoading={isLoading} displayedData={displayedData} selectedCategory={selectedCategory} favorites={favorites} canEdit={canEdit} canDelete={canDelete} handleToggleFavorite={handleToggleFavorite} setEditingItem={setEditingItem} handleDeleteItem={handleDeleteItem} setSelectedImage={setSelectedImage} playSound={playSound} />
            )}

            {view === "archive" && (
              <ArchiveView categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} showOnlyFavorites={showOnlyFavorites} setShowOnlyFavorites={setShowOnlyFavorites} isLoading={isLoading} displayedData={displayedData} favorites={favorites} canEdit={canEdit} canDelete={canDelete} handleToggleFavorite={handleToggleFavorite} setEditingItem={setEditingItem} handleDeleteItem={handleDeleteItem} setSelectedImage={setSelectedImage} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} playSound={playSound} />
            )}

            {view === "admin" && userRole.level >= 1 && (
              <AdminView 
                user={user} userRole={userRole} roles={roles} setRoles={setRoles} 
                categories={categories} stats={stats} adminTab={adminTab} setAdminTab={setAdminTab} 
                newItems={newItems} setNewItems={setNewItems} handleAddMultipleItems={handleAddMultipleItems} 
                handleImageUpload={handleImageUpload} handleRemoveImage={handleRemoveImage} handleClearDatabase={handleClearDatabase} 
                mediaList={mediaList} handleDeleteMedia={handleDeleteMedia} 
                newCatName={newCatName} setNewCatName={setNewCatName} handleAddCategory={handleAddCategory} handleDeleteCategory={handleDeleteCategory} 
                newRoleName={newRoleName} setNewRoleName={setNewRoleName} newRoleLevel={newRoleLevel} setNewRoleLevel={setNewRoleLevel} handleAddRole={handleAddRole} handleUpdateRole={handleUpdateRole} handleDeleteRole={handleDeleteRole} 
                bulkText={bulkText} setBulkText={setBulkText} handleTextImport={handleTextImport} 
                bulkJson={bulkJson} setBulkJson={setBulkJson} handleBulkImport={handleBulkImport} 
                handleExport={handleExport} handleExportCSV={handleExportCSV} 
                newAcc={newAcc} setNewAcc={setNewAcc} autoUser={autoUser} setAutoUser={setAutoUser} autoPass={autoPass} setAutoPass={setAutoPass} handleCreateUser={handleCreateUser} 
                usersList={usersList} handleDeleteUser={handleDeleteUser} 
                logsList={logsList} handleClearLogs={handleClearLogs} 
                diagResult={diagResult} setDiagResult={setDiagResult} 
                playSound={playSound} getRoleColor={getRoleColor} 
              />
            )}
          </div>
        </div>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 p-3 bg-[#5c3a21] border-2 border-[#a37c49] rounded-full text-white shadow-lg hover:bg-[#7a4f2e] active:scale-90 transition-all z-50" title="Наверх"><ArrowUp size={24} /></button>
      )}
    </main>
  );
}
