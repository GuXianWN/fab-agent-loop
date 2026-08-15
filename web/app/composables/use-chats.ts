import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import type { ChatNavigationItem, ChatSummary } from '~/types/chat';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const labels = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last week',
  lastMonth: 'Last month',
} as const;

function groupKey(chat: ChatNavigationItem): string {
  const date = dayjs(chat.createdAt);

  if (date.isToday()) return 'today';
  if (date.isYesterday()) return 'yesterday';
  if (date.isAfter(dayjs().subtract(1, 'week'))) return 'lastWeek';
  if (date.isAfter(dayjs().subtract(1, 'month'))) return 'lastMonth';

  return date.format('MMMM YYYY');
}

function toNavigationItem(chat: ChatSummary): ChatNavigationItem {
  return {
    ...chat,
    label: chat.title || 'Untitled',
    to: `/chat/${chat.id}`,
    icon: 'i-lucide-message-circle',
  };
}

export function useChats() {
  const api = useApi();
  const chats = useState<ChatNavigationItem[]>('chats', () => []);

  async function refresh() {
    chats.value = (await api.listChats()).map(toNavigationItem);
  }

  function update(id: string, partial: Partial<ChatNavigationItem>) {
    chats.value = chats.value.map((chat) => chat.id === id ? { ...chat, ...partial } : chat);
  }

  function remove(id: string) {
    chats.value = chats.value.filter((chat) => chat.id !== id);
  }

  const groups = computed(() => {
    const sorted = orderBy(chats.value, 'createdAt', 'desc');
    const grouped = groupBy(sorted, groupKey);

    return Object.entries(grouped).map(([id, items]) => ({
      id,
      label: labels[id as keyof typeof labels] ?? id,
      items,
    }));
  });

  return { chats, groups, refresh, update, remove };
}
