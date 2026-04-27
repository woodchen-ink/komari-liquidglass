import ThemeSwitch from "./ThemeSwitch";
import LoginDialog from "./Login";
import { Link } from "react-router-dom";
import { usePublicInfo } from "@/contexts/PublicInfoContext";

const NavBar = () => {
  const { publicInfo } = usePublicInfo();
  return (
    <nav className="nav-bar flex items-center gap-2 md:gap-3 max-h-16 justify-end min-w-full p-2 px-4 mt-2">
      <div className="mr-auto flex items-center min-w-0">
        <Link to="/" className="flex items-center min-w-0">
          <span
            className="font-bold text-[clamp(1.25rem,5vw,1.875rem)] whitespace-nowrap truncate leading-tight"
            style={{
              color: "white",
              textShadow:
                "0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(0,0,0,0.2)",
            }}
          >
            {publicInfo?.sitename}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeSwitch />
        {publicInfo?.private_site && !document.cookie.includes("temp_key") ? (
          <LoginDialog
            autoOpen={
              publicInfo?.private_site && !document.cookie.includes("temp_key")
            }
            info="This is a private site, please login to view."
            onLoginSuccess={() => {
              window.location.reload();
            }}
          />
        ) : (
          <LoginDialog />
        )}
      </div>
    </nav>
  );
};

export default NavBar;
