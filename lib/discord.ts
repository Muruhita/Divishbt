export async function sendDiscordNotification(action: string, itemTitle: string, userName: string, userRole: string) {
  const webhookUrl = process.env.LOI_DIS;
  if (!webhookUrl) return; // Если вебхука нет, просто выходим

  const colors: Record<string, number> = {
    "СОЗДАНИЕ": 0x00FF00, // Зеленый
    "СОЗДАНИЕ_АККАУНТА": 0x00BFFF, // Голубой
  };

  const embed = {
    title: `📢 Новое событие в Архиве`,
    color: colors[action] || 0x808080,
    fields: [
      { name: "Действие", value: action.replace("_", " "), inline: true },
      { name: "Объект", value: itemTitle, inline: true },
      { name: "Пользователь", value: userName, inline: true },
      { name: "Роль", value: userRole, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Архив Таверны «Сытый лис»" }
  };

  try {
    // Отправляем без await, чтобы не задерживать ответ сервера
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    }).catch(console.error);
  } catch (e) {
    console.error("Discord Webhook error:", e);
  }
}
