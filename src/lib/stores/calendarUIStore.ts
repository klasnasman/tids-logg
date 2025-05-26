import { atom } from "nanostores";

// Weekends toggle state
export const showWeekends = atom(true);
export const toggleWeekends = () => {
  const next = !showWeekends.get();
  showWeekends.set(next);
  localStorage.setItem("showWeekends", JSON.stringify(next));
};

// Sidebar toggle state
export const isSidebarOpen = atom(false);
export const toggleSidebar = () => {
  isSidebarOpen.set(!isSidebarOpen.get());
};