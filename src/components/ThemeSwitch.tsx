import { IconButton } from "@radix-ui/themes";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useSystemTheme } from "../hooks/useSystemTheme";

// 主题切换按钮：单击在 light / dark 之间切换；默认亮色
const ThemeSwitch = () => {
  const { appearance, setAppearance } = useContext(ThemeContext);
  const resolved = useSystemTheme(appearance);
  const toggle = () => setAppearance(resolved === "dark" ? "light" : "dark");

  return (
    <IconButton
      variant="ghost"
      onClick={toggle}
      aria-label="Toggle theme"
      style={{ color: "white" }}
    >
      {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
};

export default ThemeSwitch;
