import SidebarClose from "@assets/icons/sidebarClose";
import SidebarOpen from "@assets/icons/sidebarOpen";
import { Settings } from "@components/settings/Settings";
import { authStore } from "@lib/stores/auth/authStore";
import { isSidebarOpen, toggleSidebar } from "@lib/stores/UIStore";
import { useStore } from "@nanostores/react";

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
            <form
              id="auth-form"
              method="POST"
              action="/api/auth/signin"
              className="flex flex-col justify-between items-center gap-md">
              <div className="flex flex-col items-baseline gap-md">
                <input
                  type="email"
                  name="email"
                  placeholder="E-post"
                  className="w-[220px] border-b border-dashed"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Lösenord"
                  className="w-[220px] border-b border-dashed"
                  required
                />
              </div>
              <div className="repel mt-lg" data-reverse>
                <button type="submit" name="auth-action" value="login" className="button" data-variant="white">
                  Logga in
                </button>
                <button type="submit" name="auth-action" value="register" className="button" data-variant="text">
                  Ny användare
                </button>
              </div>
            </form>
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
        <div id="profile-area" className="flex items-center gap-md">
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
