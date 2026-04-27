import { Callout, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import React, { useEffect, Suspense } from "react";
const NodeDisplay = React.lazy(() => import("../components/NodeDisplay"));
import { formatBytes } from "@/utils/unitHelper";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import {
  SummaryCardSkeleton,
  NodeListSkeleton,
} from "@/components/Skeletons";

// Intelligent speed formatting function
const formatSpeed = (bytes: number): string => {
  if (bytes === 0) return "0 B/s";
  const units = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  // Adaptive decimal places
  let decimals = 2;
  if (i >= 3) decimals = 1; // GB and above: 1 decimal
  if (i <= 1) decimals = 0; // B and KB: no decimals
  if (size >= 100) decimals = 0; // 100+ of any unit: no decimals

  return `${size.toFixed(decimals)} ${units[i]}`;
};

const Index = () => {
  const InnerLayout = () => {
    const [t] = useTranslation();
    const { live_data } = useLiveData();
    const [currentTime, setCurrentTime] = React.useState(
      new Date().toLocaleTimeString(),
    );
    //document.title = t("home_title");
    //#region 节点数据
    const { nodeList, isLoading, error, refresh } = useNodeList();

    // 独立的时间更新定时器
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    // 顶部 5 个状态卡: 时间 / 在线数 / 地区数 / 总流量 / 实时网速
    const statusCards = [
      {
        key: "currentTime",
        title: t("current_time"),
        getValue: () => currentTime,
      },
      {
        key: "currentOnline",
        title: t("current_online"),
        getValue: () =>
          `${live_data?.data?.online.length ?? 0} / ${nodeList?.length ?? 0}`,
      },
      {
        key: "regionOverview",
        title: t("region_overview"),
        getValue: () =>
          nodeList
            ? Object.entries(
                nodeList.reduce(
                  (acc, item) => {
                    if (live_data?.data.online.includes(item.uuid)) {
                      acc[item.region] = (acc[item.region] || 0) + 1;
                    }
                    return acc;
                  },
                  {} as Record<string, number>,
                ),
              ).length
            : 0,
      },
      {
        key: "trafficOverview",
        title: t("traffic_overview"),
        getValue: () => {
          const data = live_data?.data?.data;
          const online = live_data?.data?.online;
          if (!data || !online) return "↑ 0B / ↓ 0B";
          const onlineSet = new Set(online);
          const values = Object.entries(data)
            .filter(([uuid]) => onlineSet.has(uuid))
            .map(([, node]) => node);
          const up = values.reduce(
            (acc, node) => acc + (node.network.totalUp || 0),
            0,
          );
          const down = values.reduce(
            (acc, node) => acc + (node.network.totalDown || 0),
            0,
          );
          return `↑ ${formatBytes(up)} / ↓ ${formatBytes(down)}`;
        },
      },
      {
        key: "networkSpeed",
        title: t("network_speed"),
        getValue: () => {
          const data = live_data?.data?.data;
          const online = live_data?.data?.online;
          if (!data || !online) return "↑ 0 B/s / ↓ 0 B/s";
          const onlineSet = new Set(online);
          const values = Object.entries(data)
            .filter(([uuid]) => onlineSet.has(uuid))
            .map(([, node]) => node);
          const up = values.reduce(
            (acc, node) => acc + (node.network.up || 0),
            0,
          );
          const down = values.reduce(
            (acc, node) => acc + (node.network.down || 0),
            0,
          );
          return `↑ ${formatSpeed(up)} / ↓ ${formatSpeed(down)}`;
        },
      },
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        refresh();
      }, 5000);
      return () => clearInterval(interval);
    }, [nodeList]);

    // 渐进加载: 首次加载时直接渲染骨架壳, 数据到位后无缝替换为真组件, 避免白屏闪烁
    if (error) {
      return <div className="text-red-400 mt-4 px-2">Error: {error}</div>;
    }

    // 节点列表未到位前: summary 卡 + 节点列表都用骨架
    if (isLoading || !nodeList) {
      return (
        <>
          <Callouts />
          <SummaryCardSkeleton />
          <NodeListSkeleton count={4} />
        </>
      );
    }

    //#endregion

    return (
      <>
        <Callouts />
        <div className="summary-card liquid-glass rounded-xl p-4 mt-4 md:text-base text-sm relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {statusCards.map((card) => (
              <TopCard
                key={card.key}
                title={card.title}
                value={card.getValue()}
              />
            ))}
          </div>
        </div>
        <Suspense fallback={<NodeListSkeleton count={4} />}>
          <NodeDisplay
            nodes={nodeList ?? []}
            liveData={live_data?.data ?? { online: [], data: {} }}
          />
        </Suspense>
      </>
    );
  };
  return <InnerLayout />;
};

//#region Callouts
const Callouts = () => {
  const [t] = useTranslation();
  const { showCallout } = useLiveData();
  const ishttps = window.location.protocol === "https:";
  return (
    <Flex direction="column" gap="2" className="m-2">
      <Callout.Root m="2" hidden={ishttps} color="red">
        <Callout.Icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M10.03 3.659c.856-1.548 3.081-1.548 3.937 0l7.746 14.001c.83 1.5-.255 3.34-1.969 3.34H4.254c-1.715 0-2.8-1.84-1.97-3.34zM12.997 17A.999.999 0 1 0 11 17a.999.999 0 0 0 1.997 0m-.259-7.853a.75.75 0 0 0-1.493.103l.004 4.501l.007.102a.75.75 0 0 0 1.493-.103l-.004-4.502z"
            />
          </svg>
        </Callout.Icon>
        <Callout.Text>
          <Text size="2" weight="medium">
            {t("warn_https")}
          </Text>
        </Callout.Text>
      </Callout.Root>
      <Callout.Root m="2" hidden={showCallout} id="callout" color="tomato">
        <Callout.Icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M21.707 3.707a1 1 0 0 0-1.414-1.414L18.496 4.09a4.25 4.25 0 0 0-5.251.604l-1.068 1.069a1.75 1.75 0 0 0 0 2.474l3.585 3.586a1.75 1.75 0 0 0 2.475 0l1.068-1.068a4.25 4.25 0 0 0 .605-5.25zm-11 8a1 1 0 0 0-1.414-1.414l-1.47 1.47l-.293-.293a.75.75 0 0 0-1.06 0l-1.775 1.775a4.25 4.25 0 0 0-.605 5.25l-1.797 1.798a1 1 0 1 0 1.414 1.414l1.798-1.797a4.25 4.25 0 0 0 5.25-.605l1.775-1.775a.75.75 0 0 0 0-1.06l-.293-.293l1.47-1.47a1 1 0 0 0-1.414-1.414l-1.47 1.47l-1.586-1.586z"
            />
          </svg>
        </Callout.Icon>
        <Callout.Text>
          <Text size="2" weight="medium">
            {t("warn_websocket")}
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
};
// #endregion Callouts
export default Index;

type TopCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

const TopCard: React.FC<TopCardProps> = React.memo(
  ({ title, value, description }) => {
    return (
      <div className="min-w-52 md:max-w-72 w-full">
        <Flex direction="column" gap="1">
          <label className="text-muted-foreground text-sm">{title}</label>
          <label className="font-medium -mt-2 text-md">{value}</label>
          {description && (
            <Text size="2" color="gray">
              {description}
            </Text>
          )}
        </Flex>
      </div>
    );
  },
);

