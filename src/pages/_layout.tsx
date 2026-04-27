import { LiveDataProvider } from "@/contexts/LiveDataContext";
import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";
import { NodeListProvider } from "@/contexts/NodeListContext";
import DynamicBackground from "../components/DynamicBackground";
import LiquidGlassEffect from "../components/LiquidGlassEffect";

// 液态玻璃主题布局：DynamicBackground 已经处理桌面/移动端背景图与随机图回退
const IndexLayout = () => {
  const InnerLayout = () => {
    return (
      <div className="layout flex flex-col w-full min-h-screen relative">
        <DynamicBackground />
        <LiquidGlassEffect />
        <main className="main-content w-full px-3 md:px-4 pb-8 relative z-10 flex-1">
          {/* NavBar 仅占 5xl 宽度居中显示, 各路由自己决定内容宽度 */}
          <div className="w-full max-w-5xl mx-auto">
            <NavBar />
          </div>
          <Outlet />
        </main>
      </div>
    );
  };

  return (
    <LiveDataProvider>
      <NodeListProvider>
        <InnerLayout />
      </NodeListProvider>
    </LiveDataProvider>
  );
};

export default IndexLayout;
