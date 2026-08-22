"use client";

import { useMemo } from "react";
import { formatYen } from "@/lib/format";
import type { CashFlowGraph, CashFlowSide } from "@/types/domain";

const KIND_COLOR: Record<CashFlowSide["kind"], string> = {
  income: "#0f9d8a",
  expense: "#e11d48",
  balance: "#6b7280",
  deficit: "#7c3aed",
  loan: "#6b7280",
  repay: "#9ca3af",
  capex: "#0f9d8a",
};

const KIND_RIBBON: Record<CashFlowSide["kind"], string> = {
  income: "rgba(15, 157, 138, 0.28)",
  expense: "rgba(225, 29, 72, 0.28)",
  balance: "rgba(107, 114, 128, 0.28)",
  deficit: "rgba(124, 58, 237, 0.28)",
  loan: "rgba(107, 114, 128, 0.28)",
  repay: "rgba(156, 163, 175, 0.28)",
  capex: "rgba(15, 157, 138, 0.28)",
};

type LaidOut = CashFlowSide & { y: number; h: number };

function layoutGapped(
  nodes: CashFlowSide[],
  total: number,
  startY: number,
  usableH: number,
  gap: number
): LaidOut[] {
  const gapTotal = gap * Math.max(0, nodes.length - 1);
  const scale = total > 0 ? (usableH - gapTotal) / total : 0;
  let y = startY;
  return nodes.map((node) => {
    const h = Math.max(node.amount * scale, 2);
    const laid = { ...node, y, h };
    y += h + gap;
    return laid;
  });
}

function layoutContiguous(
  nodes: CashFlowSide[],
  total: number,
  startY: number,
  usableH: number
): LaidOut[] {
  const scale = total > 0 ? usableH / total : 0;
  let y = startY;
  return nodes.map((node) => {
    const h = node.amount * scale;
    const laid = { ...node, y, h };
    y += h;
    return laid;
  });
}

function ribbon(
  x0: number,
  y0: number,
  h0: number,
  x1: number,
  y1: number,
  h1: number
) {
  const mid = (x0 + x1) / 2;
  return `M ${x0} ${y0}
          C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}
          L ${x1} ${y1 + h1}
          C ${mid} ${y1 + h1}, ${mid} ${y0 + h0}, ${x0} ${y0 + h0} Z`;
}

function percent(amount: number, total: number) {
  if (total <= 0) return "0.0%";
  return `${((amount / total) * 100).toFixed(1)}%`;
}

export function CashFlowSankey({ graph }: { graph: CashFlowGraph }) {
  const layout = useMemo(() => {
    const width = 960;
    const pad = 16;
    const gap = 8;
    const rows = Math.max(graph.left.length, graph.right.length, 1);
    const contentH = Math.max(320, rows * 44);
    const height = pad * 2 + contentH;
    const leftBarX = 168;
    const barW = 14;
    const midX = 468;
    const midW = 22;
    const rightBarX = 778;
    const left = layoutGapped(graph.left, graph.total, pad, contentH, gap);
    const right = layoutGapped(graph.right, graph.total, pad, contentH, gap);
    const leftMid = layoutContiguous(graph.left, graph.total, pad, contentH);
    const rightMid = layoutContiguous(graph.right, graph.total, pad, contentH);

    return {
      width,
      height,
      left,
      right,
      leftMid,
      rightMid,
      leftBarX,
      barW,
      midX,
      midW,
      rightBarX,
      pad,
      usableH: contentH,
    };
  }, [graph]);

  if (graph.total <= 0) {
    return <p className="text-sm text-zinc-500">まだ流れを描ける数字がないよ。</p>;
  }

  return (
    <div>
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full"
          role="img"
          aria-label="収支の流れ"
        >
          {layout.left.map((node, index) => (
            <path
              key={`in-${node.key}`}
              d={ribbon(
                layout.leftBarX + layout.barW,
                node.y,
                node.h,
                layout.midX,
                layout.leftMid[index].y,
                layout.leftMid[index].h
              )}
              fill={KIND_RIBBON[node.kind]}
            />
          ))}
          {layout.right.map((node, index) => (
            <path
              key={`out-${node.key}`}
              d={ribbon(
                layout.midX + layout.midW,
                layout.rightMid[index].y,
                layout.rightMid[index].h,
                layout.rightBarX,
                node.y,
                node.h
              )}
              fill={KIND_RIBBON[node.kind]}
            />
          ))}

          {layout.left.map((node) => (
            <g key={`left-${node.key}`}>
              <title>
                {node.label} {formatYen(node.amount)}（{percent(node.amount, graph.total)}）
              </title>
              <rect
                x={layout.leftBarX}
                y={node.y}
                width={layout.barW}
                height={node.h}
                rx={3}
                fill={KIND_COLOR[node.kind]}
              />
              <NodeLabel
                x={layout.leftBarX - 10}
                y={node.y + node.h / 2}
                h={node.h}
                anchor="end"
                label={node.label}
                amount={node.amount}
                total={graph.total}
              />
            </g>
          ))}

          <rect
            x={layout.midX}
            y={layout.pad}
            width={layout.midW}
            height={layout.usableH}
            rx={4}
            fill="#3f3f46"
          />
          <text
            x={layout.midX + layout.midW / 2}
            y={layout.pad + layout.usableH / 2 - 8}
            textAnchor="middle"
            className="fill-white"
            fontSize={11}
          >
            合計
          </text>
          <text
            x={layout.midX + layout.midW / 2}
            y={layout.pad + layout.usableH / 2 + 8}
            textAnchor="middle"
            className="fill-zinc-200"
            fontSize={10}
          >
            {formatYen(graph.total)}
          </text>

          {layout.right.map((node) => (
            <g key={`right-${node.key}`}>
              <title>
                {node.label} {formatYen(node.amount)}（{percent(node.amount, graph.total)}）
              </title>
              <rect
                x={layout.rightBarX}
                y={node.y}
                width={layout.barW}
                height={node.h}
                rx={3}
                fill={KIND_COLOR[node.kind]}
              />
              <NodeLabel
                x={layout.rightBarX + layout.barW + 10}
                y={node.y + node.h / 2}
                h={node.h}
                anchor="start"
                label={node.label}
                amount={node.amount}
                total={graph.total}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="grid gap-6 md:hidden">
        <FlowList title="収入" nodes={graph.left} total={graph.total} />
        <FlowList title="支出と残高" nodes={graph.right} total={graph.total} />
      </div>
    </div>
  );
}

function NodeLabel({
  x,
  y,
  h,
  anchor,
  label,
  amount,
  total,
}: {
  x: number;
  y: number;
  h: number;
  anchor: "start" | "end";
  label: string;
  amount: number;
  total: number;
}) {
  const detail = `${formatYen(amount)}（${percent(amount, total)}）`;
  if (h < 32) {
    return (
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="fill-zinc-700"
        fontSize={11}
      >
        {label}
      </text>
    );
  }

  return (
    <>
      <text
        x={x}
        y={y - 7}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="fill-zinc-700"
        fontSize={12}
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 8}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="fill-zinc-400"
        fontSize={11}
      >
        {detail}
      </text>
    </>
  );
}

function FlowList({
  title,
  nodes,
  total,
}: {
  title: string;
  nodes: CashFlowSide[];
  total: number;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-500">{title}</p>
      <ul className="space-y-2">
        {nodes.map((node) => (
          <li key={node.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: KIND_COLOR[node.kind] }}
              />
              {node.label}
            </span>
            <span className="tabular-nums text-zinc-600">
              {formatYen(node.amount)}（{percent(node.amount, total)}）
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
