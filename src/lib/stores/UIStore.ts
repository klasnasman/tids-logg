import { atom } from "nanostores";

export const showWeekends = atom(true);
export const toggleWeekends = () => {
  const next = !showWeekends.get();
  showWeekends.set(next);
  localStorage.setItem("showWeekends", JSON.stringify(next));
};

export const isSidebarOpen = atom(false);
export const toggleSidebar = () => {
  isSidebarOpen.set(!isSidebarOpen.get());
};

export const isCalendarModalOpen = atom(false);

export const openCalendarModal = () => isCalendarModalOpen.set(true);
export const closeCalendarModal = () => isCalendarModalOpen.set(false);
export const toggleCalendarModal = () => {
  isCalendarModalOpen.set(!isCalendarModalOpen.get());
};

export const isClientModalOpen = atom(false);

export const openClientModal = () => isClientModalOpen.set(true);
export const closeClientModal = () => isClientModalOpen.set(false);
export const toggleClientModal = () => {
  isClientModalOpen.set(!isClientModalOpen.get());
};

export const isSettingsModalOpen = atom(false);

export const openSettingsModal = () => isSettingsModalOpen.set(true);
export const closeSettingsModal = () => isSettingsModalOpen.set(false);
export const toggleSettingsModal = () => {
  isSettingsModalOpen.set(!isSettingsModalOpen.get());
};

export const isConfirmModalOpen = atom(false);

export const openConfirmModal = () => isConfirmModalOpen.set(true);
export const closeConfirmModal = () => isConfirmModalOpen.set(false);
export const toggleConfirmModal = () => {
  isConfirmModalOpen.set(!isConfirmModalOpen.get());
};
