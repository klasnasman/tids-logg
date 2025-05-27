import { atom } from "nanostores";

export const selectedDateAtom = atom<Date>(new Date());
export const selectedWeekAtom = atom<number | null>(null);