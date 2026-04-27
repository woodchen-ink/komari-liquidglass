// 骨架屏组件: 替代加载转圈, 减少白屏闪烁感
// 结构尽量贴近真实组件, 让数据到位时无视觉跳变

// 顶部状态格骨架 (Index summary card 内部, 5 列)
export const TopCardSkeleton = () => (
  <div className="min-w-0 w-full flex flex-col gap-2 py-1">
    <div className="skeleton h-3 w-20" />
    <div className="skeleton h-5 w-28" />
  </div>
);

// 顶部整行 5 列骨架, 配合 .summary-card 的玻璃外壳一起渲染
export const SummaryCardSkeleton = () => (
  <div className="summary-card liquid-glass rounded-xl p-4 mt-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <TopCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// 单张节点卡骨架: 顶部行 + 6 模块网格, 与真实 Node card 同形
export const NodeCardSkeleton = () => (
  <div className="liquid-glass rounded-xl w-full p-4">
    {/* 顶部: flag + name + 元信息 + 分组 */}
    <div className="flex items-center justify-between mb-3 gap-2">
      <div className="flex items-center gap-2">
        <div className="skeleton h-4 w-6" />
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="skeleton h-5 w-14 rounded-full" />
    </div>

    {/* 6 模块 2x3 */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-muted/60 backdrop-blur-sm rounded-md p-2 border border-border"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="skeleton h-3 w-12" />
            <div className="skeleton h-3 w-8" />
          </div>
          <div className="skeleton h-1.5 w-full mb-2" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      ))}
    </div>

    {/* 底部价格行 */}
    <div className="mt-3 pt-2 flex items-center justify-between gap-2">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-3 w-28" />
    </div>
  </div>
);

// 节点列表骨架: N 张节点骨架按真实间距排列
export const NodeListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="w-full mt-4 flex flex-col" style={{ rowGap: "1rem" }}>
    {Array.from({ length: count }).map((_, i) => (
      <NodeCardSkeleton key={i} />
    ))}
  </div>
);
