import React from "react";

export const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query || !query.trim()) return <>{text}</>;
  
  // Экранируем спецсимволы, чтобы поиск не ломался
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-500 text-black px-1 rounded shadow-sm">{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
