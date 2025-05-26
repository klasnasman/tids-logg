import { atom } from "nanostores";

export interface Profile {
  full_name: string | null;
  email: string | null;
}

export const profileStore = atom<Profile | null>(null);
