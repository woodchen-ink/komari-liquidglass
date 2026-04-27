import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicInfo } from "@/contexts/PublicInfoContext";

// 动态背景层：液态玻璃主题专用
// - 优先使用主题配置的桌面/移动背景图
// - 未配置时回退到随机图 API（与 nezha-dash-v1 一致）
// - 暗色叠加层用于增强前景对比度
export default function DynamicBackground() {
  const { publicInfo } = usePublicInfo();
  const isMobile = useIsMobile();

  const desktopBg = publicInfo?.theme_settings?.backgroundImageUrlDesktop;
  const mobileBg = publicInfo?.theme_settings?.backgroundImageUrlMobile;
  const themedBg = isMobile ? mobileBg || desktopBg : desktopBg;

  const [randomImage, setRandomImage] = useState<string | null>(null);

  useEffect(() => {
    if (!themedBg) {
      setRandomImage(`https://random-api.czl.net/pic/ecy?timestamp=${Date.now()}`);
    } else {
      setRandomImage(null);
    }
  }, [themedBg]);

  const finalBackgroundImage = themedBg || randomImage;

  return (
    <>
      {finalBackgroundImage && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${finalBackgroundImage})`,
            // 直接降低背景图本身的亮度与饱和度, 让玻璃前景文字更清晰
            filter: "brightness(0.55) saturate(0.85)",
          }}
        />
      )}
      {/* 暗色叠加层 - 进一步压低画面对比, 强化前景白字可读性 */}
      <div className="fixed inset-0 -z-10 bg-black/45 dark:bg-black/60" />
    </>
  );
}
