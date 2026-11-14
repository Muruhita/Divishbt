import { CategoryItem, RoleItem, InfoPage, NewArchiveItem } from "@/types";

export const DANGER_LEVELS = ["Низкий", "Средний", "Высокий", "Смертельный"];
export const INITIAL_NEW_ITEM: NewArchiveItem = { title: "", category: "Комбинации Цифр", description: "", symbol: "", dangerLevel: "Низкий", images: [], is_draft: 0 };
export const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛈ", "ᛇ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"];

export const DEFAULT_CATEGORIES: CategoryItem[] = ["Комбинации Цифр", "Слова", "Термины", "Аббревиатура", "Символика", "Картинки", "Другое"].map((name, i) => ({ id: i + 1, name }));

export const DEFAULT_ROLES: RoleItem[] = [
  { id: "owner", name: "Овнер (Dev)", level: 4 },
  { id: "creator", name: "Создатель Сервера", level: 3 },
  { id: "guardian", name: "Хранитель", level: 2 },
  { id: "high", name: "Хай Стафф", level: 1 },
  { id: "low", name: "Лоу Стафф", level: 0 }
];

export const DEFAULT_INFO_PAGES: InfoPage[] = [
  { id: 'pharma', title: 'ЗАПРЕЩЕННЫЕ ФАРМАЦЕВТИЧЕСКИЕ ПРЕПАРАТЫ И ПИЩЕВЫЕ ДОБАВКИ', content: 'Текст правил от Хранителя/Овнера будет здесь...' },
  { id: 'offensive', title: 'НЕПРИЕМЛЕМЫЙ/ОСКОРБИТЕЛЬНЫЙ КОНТЕНТ', content: 'Текст правил от Хранителя/Овнера будет здесь...' },
  { id: 'dangerous', title: 'ОПАСНЫЕ ТОВАРЫ', content: 'Текст правил от Хранителя/Овнера будет здесь...' }
];
