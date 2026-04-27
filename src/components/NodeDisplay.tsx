import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "../types/LiveData";
import { NodeGrid } from "./Node";
import { isRegionMatch } from "@/utils/regionHelper";

interface NodeDisplayProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
}

// 节点列表展示: 搜索 + 分组筛选 + 网格列表 (Liquid Glass 主题, 仅保留 grid 视图)
const NodeDisplay: React.FC<NodeDisplayProps> = ({ nodes, liveData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useLocalStorage<string>(
    "nodeSelectedGroup",
    "all",
  );
  const searchRef = useRef<HTMLInputElement>(null);

  // 收集所有非空分组
  const groups = useMemo(() => {
    const groupSet = new Set<string>();
    nodes.forEach((node) => {
      if (node.group && node.group.trim()) {
        groupSet.add(node.group);
      }
    });
    return Array.from(groupSet).sort();
  }, [nodes]);

  const showGroupSelector = groups.length >= 1;

  // 键盘快捷键: "/" 聚焦搜索, ESC 清空
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
      if (e.key === "Escape" && searchTerm) {
        setSearchTerm("");
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm]);

  // 过滤节点: 先按分组, 再按搜索词 (名称/系统/架构/地区/价格/状态)
  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (selectedGroup !== "all") {
      result = result.filter((node) => node.group === selectedGroup);
    }
    if (!searchTerm.trim()) return result;

    const term = searchTerm.toLowerCase().trim();
    return result.filter((node) => {
      const basicMatch =
        node.name.toLowerCase().includes(term) ||
        node.os.toLowerCase().includes(term) ||
        node.arch.toLowerCase().includes(term);
      const regionMatch = isRegionMatch(node.region, term);
      const priceMatch =
        !isNaN(Number(term)) && node.price.toString().includes(term);
      const isOnline = liveData?.online?.includes(node.uuid) || false;
      const statusMatch =
        (term === "online" && isOnline) ||
        (term === "offline" && !isOnline);
      return basicMatch || regionMatch || priceMatch || statusMatch;
    });
  }, [nodes, searchTerm, liveData, selectedGroup]);

  const totalCountInScope =
    selectedGroup === "all"
      ? nodes.length
      : nodes.filter((n) => n.group === selectedGroup).length;
  const onlineInFiltered = filteredNodes.filter((n) =>
    liveData?.online?.includes(n.uuid),
  ).length;

  return (
    <div className="w-full">
      {/* 控制栏: 搜索框 + 分组按钮 */}
      <div className="mt-4 flex flex-col gap-3">
        {/* 搜索框 —— 玻璃风格输入框 */}
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.7)" }}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder='Search by name, region, OS… (press "/")'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-9 rounded-lg outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--brand)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(46,167,224,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                searchRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)" }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 分组选择器 —— pill 样式按钮组, 横向滚动 */}
        {showGroupSelector && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden -mx-1 px-1">
            <GroupPill
              active={selectedGroup === "all"}
              onClick={() => setSelectedGroup("all")}
              label="All"
            />
            {groups.map((group) => (
              <GroupPill
                key={group}
                active={selectedGroup === group}
                onClick={() => setSelectedGroup(group)}
                label={group}
              />
            ))}
          </div>
        )}

        {/* 计数行 */}
        <div
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {searchTerm.trim() ? (
            <>
              Found {filteredNodes.length} of {totalCountInScope} servers
            </>
          ) : selectedGroup === "all" ? (
            <>
              {nodes.length} servers · {liveData?.online?.length || 0} online
            </>
          ) : (
            <>
              {selectedGroup}: {filteredNodes.length} servers ·{" "}
              {onlineInFiltered} online
            </>
          )}
        </div>
      </div>

      {/* 节点显示区域 */}
      {filteredNodes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <p className="text-base mb-2">
            {searchTerm.trim() ? "No matching servers" : "No servers"}
          </p>
          {searchTerm.trim() && (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Try a different keyword
            </p>
          )}
        </div>
      ) : (
        <NodeGrid nodes={filteredNodes} liveData={liveData} />
      )}
    </div>
  );
};

// 分组筛选按钮: 玻璃 pill 样式, active 时反相为白底深字
const GroupPill: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = React.memo(({ active, onClick, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 h-8 inline-flex items-center rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
      style={
        active
          ? {
              background: "rgba(255,255,255,0.95)",
              color: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.95)",
            }
          : {
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }
      }
    >
      {label}
    </button>
  );
});

export default NodeDisplay;
