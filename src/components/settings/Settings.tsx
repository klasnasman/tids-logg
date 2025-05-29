import Tune from "@assets/icons/tune";
import { ProfileForm } from "@components/forms/ProfileForm";
import { ModalWrapper } from "@components/modals/ModalWrapper";
import { authStore } from "@lib/stores/auth/authStore";
import { profileStore } from "@lib/stores/auth/profileStore";
import { closeSettingsModal, isSettingsModalOpen, openSettingsModal, showWeekends, toggleWeekends } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";

export function Settings() {
  
  const $show = useStore(showWeekends);
  const $user = useStore(authStore).user;
  const $profile = useStore(profileStore);
  const isOpen = useStore(isSettingsModalOpen);

  const [editingName, setEditingName] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.getAttribute("data-user-theme") === "dark" ? "dark" : "light"
  );
  
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
            <div className="w-full mt-xs">
              <ProfileForm userId={$user.id} />
            </div>
          ) : editingName ? (
            <div className="w-full mt-xs">
              <ProfileForm userId={$user.id} />
            </div>
          ) : (
            <div className="flex items-end justify-between hover:bg-hover transition-colors">
              <span>Namn</span>
              <span className="dot-leaders flex-1 leading-none" />
              <p className="cursor-default">{$profile.full_name}</p>
            </div>
          )}

          <div className="flex items-end justify-between hover:bg-hover transition-colors">
            <span>E-post</span>
            <span className="dot-leaders flex-1 leading-none" />
            <p className="cursor-default">{$user?.email}</p>
          </div>

          <div className="flex items-end justify-between hover:bg-hover transition-colors">
            <span>Tema</span>
            <span className="dot-leaders flex-1 leading-none" />
            <div className="flex gap-3">
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
            </div>
          </div>

          <div className="flex items-end justify-between hover:bg-hover transition-colors">
            <span>Visa helger</span>
            <span className="dot-leaders flex-1 leading-none" />
            <div className="flex gap-3">
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
            </div>
          </div>
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
