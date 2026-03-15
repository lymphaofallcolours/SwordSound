import { createStore } from 'zustand/vanilla';

export type ModalType = 'create-session' | 'import-session' | 'add-track' | 'confirm-delete' | null;

export type UiState = {
  sidebarOpen: boolean;
  widgetPanelOpen: boolean;
  activeModal: ModalType;
  modalData: Record<string, unknown>;

  toggleSidebar: () => void;
  toggleWidgetPanel: () => void;
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
};

export function createUiStore() {
  return createStore<UiState>((set) => ({
    sidebarOpen: true,
    widgetPanelOpen: false,
    activeModal: null,
    modalData: {},

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    toggleWidgetPanel: () => set((s) => ({ widgetPanelOpen: !s.widgetPanelOpen })),
    openModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: {} }),
  }));
}
