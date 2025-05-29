import SidebarClose from "@assets/icons/sidebarClose";
import SidebarOpen from "@assets/icons/sidebarOpen";
import { Settings } from "@components/settings/Settings";
import { authStore } from "@lib/stores/auth/authStore";
import { isSidebarOpen, toggleSidebar } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";
import { LoginForm } from "@components/forms/LoginForm";

export default function Header() {
  const user = useStore(authStore).user;
  const $isSidebarOpen = useStore(isSidebarOpen);

  if (!user) {
    return (
      <>
        <div className="fixed inset-0 bg-black/5  backdrop-blur-xs z-modal">
          <header
            className="fixed top-1/2 left-1/2 w-fit h-fit 
          -translate-x-1/2 -translate-y-1/2 bg-global-background border border-global-text
          flex flex-col justify-around items-center p-base gap-16"
            data-nowrap>
            <div>
              <p className="text-logo p-xs border border-logo border-dashed rounded-[1px]">TIDS:LOGG</p>
            </div>
            <LoginForm />
          </header>
        </div>
        <span className="fixed bg-global-background border-b border-global-text z-40 top-0 left-0 right-0 h-header" />
      </>
    );
  }

  return (
    <header
      className="fixed reel bg-global-background border-b border-global-text z-40 top-0 left-0 right-0 repel h-header px-sm flex justify-between items-center"
      data-nowrap>
      <span className="text-logo p-xs border border-logo border-dashed rounded-[1px]">TIDS:LOGG</span>

      <div className="flex items-center gap-md h-full">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-base">
            <Settings />
            <button
              className={`dashboard-sidebar-toggle ${$isSidebarOpen ? "open" : "closed"}`}
              onClick={toggleSidebar}
              aria-label={$isSidebarOpen ? "Stäng sidopanel" : "Visa sidopanel"}>
              {$isSidebarOpen ? <SidebarClose /> : <SidebarOpen />}
              {/* {$isSidebarOpen ? "Stäng" : "Meny"} */}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
