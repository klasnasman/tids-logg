import Tune from "@assets/icons/tune";
import { ProfileForm } from "@components/forms/ProfileForm";
import { ModalWrapper } from "@components/modals/ModalWrapper";
import { authStore } from "@lib/stores/auth/authStore";
import { profileStore } from "@lib/stores/auth/profileStore";
import {
  closeSettingsModal,
  isSettingsModalOpen,
  openSettingsModal,
  showWeekends,
  toggleWeekends,
} from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { SettingsItem } from "./SettingsItem";

export function Settings() {
  const $show = useStore(showWeekends);
  const $user = useStore(authStore).user;
  const $profile = useStore(profileStore);
  const isOpen = useStore(isSettingsModalOpen);

  const [editingName, setEditingName] = useState(false); // Not implemented
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.getAttribute("data-user-theme") === "dark" ? "dark" : "light"
  );
  const [font, setFont] = useState(() => document.body.getAttribute("data-user-font") || "mono");

  const setFontAndPersist = (newFont: "mono" | "serif" | "sans") => {
    setFont(newFont);
    document.body.setAttribute("data-user-font", newFont);
    localStorage.setItem("font", newFont);
  };

  useEffect(() => {
    const storedWeekends = localStorage.getItem("showWeekends");
    if (storedWeekends !== null) {
      const shouldShow = storedWeekends === "true";
      const currentShow = showWeekends.get();
      if (currentShow !== shouldShow) {
        toggleWeekends();
      }
    }
  }, []);

  const setThemeAndPersist = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-user-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleToggleWeekends = () => {
    toggleWeekends();
    const current = showWeekends.get();
    localStorage.setItem("showWeekends", current.toString());
  };

  return (
    <>
      <button onClick={openSettingsModal} aria-label="Open settings">
        <Tune />
      </button>

      <ModalWrapper isOpen={isOpen} onClose={closeSettingsModal} modalClassName="w-modal-width-sm">
        <div className="flex justify-start items-center w-full">
          <p>Inställningar</p>
        </div>

        <div className="flex flex-col">
          {!$profile?.full_name ? (
            <ProfileForm userId={$user.id} />
          ) : editingName ? (
            <ProfileForm userId={$user.id} />
          ) : (
            <SettingsItem label="Namn">
              <p className="cursor-default">{$profile.full_name}</p>
            </SettingsItem>
          )}

          <SettingsItem label="Epost">
            <p className="cursor-default">{$user?.email}</p>
          </SettingsItem>

          <SettingsItem label="Tema">
            <button
              onClick={() => theme === "dark" && setThemeAndPersist("light")}
              className={`${theme === "light" ? "decoration underline text-global-text" : "hover:underline"}`}
              aria-pressed={theme === "light"}>
              Ljust
            </button>
            <button
              onClick={() => theme === "light" && setThemeAndPersist("dark")}
              className={`${theme === "dark" ? "decoration underline text-global-text" : "hover:underline"}`}
              aria-pressed={theme === "dark"}>
              Mörkt
            </button>
          </SettingsItem>

          <SettingsItem label="Visa helger">
            <button
              onClick={() => $show && handleToggleWeekends()}
              className={`${!$show ? "decoration underline text-global-text" : "hover:underline"}`}
              aria-pressed={!$show}>
              Av
            </button>
            <button
              onClick={() => !$show && handleToggleWeekends()}
              className={`${$show ? "decoration underline text-global-text" : "hover:underline"}`}
              aria-pressed={$show}>
              På
            </button>
          </SettingsItem>

          <SettingsItem label="Typsnitt">
            <button
              onClick={() => setFontAndPersist("mono")}
              className={font === "mono" ? "underline text-global-text" : "hover:underline"}
              aria-pressed={font === "mono"}>
              Mono
            </button>
            <button
              onClick={() => setFontAndPersist("serif")}
              className={font === "serif" ? "underline text-global-text" : "hover:underline"}
              aria-pressed={font === "serif"}>
              Serif
            </button>
            <button
              onClick={() => setFontAndPersist("sans")}
              className={font === "sans" ? "underline text-global-text" : "hover:underline"}
              aria-pressed={font === "sans"}>
              Sans
            </button>
          </SettingsItem>
        </div>

        <div className="repel mt-lg" data-reverse>
          <button type="button" onClick={closeSettingsModal} className="button" data-variant="white">
            Stäng
          </button>
          <form method="GET" action="/api/auth/signout">
            <button type="submit" className="button" data-variant="text">
              Logga ut
            </button>
          </form>
        </div>
      </ModalWrapper>
    </>
  );
}
