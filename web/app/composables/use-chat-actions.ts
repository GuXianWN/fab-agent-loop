import ModalConfirm from '~/components/ModalConfirm.vue';
import ModalRename from '~/components/ModalRename.vue';
import type { ChatVisibility } from '~/types/chat';

export function useChatActions() {
  const api = useApi();
  const route = useRoute();
  const toast = useToast();
  const overlay = useOverlay();
  const { update, remove } = useChats();
  const renameModal = overlay.create(ModalRename);
  const deleteModal = overlay.create(ModalConfirm, {
    props: {
      title: 'Delete chat',
      description: 'Are you sure you want to delete this chat? This cannot be undone.',
      color: 'error',
    },
  });

  async function renameChat(id: string, currentTitle?: string | null) {
    const result = await renameModal.open({ title: currentTitle ?? '' }).result;

    if (!result || result === currentTitle) return null;

    const chat = await api.updateChat(id, { title: result });
    update(id, { label: chat.title || 'Untitled', title: chat.title });
    return chat.title;
  }

  async function updateVisibility(id: string, visibility: ChatVisibility) {
    return api.updateChat(id, { visibility });
  }

  async function deleteChat(id: string) {
    const confirmed = await deleteModal.open().result;

    if (!confirmed) return false;

    await api.removeChat(id);
    remove(id);
    toast.add({ title: 'Chat deleted', icon: 'i-lucide-trash' });

    if (route.params.id === id) await navigateTo('/');
    return true;
  }

  return { renameChat, updateVisibility, deleteChat };
}
