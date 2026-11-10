import { useMemo } from "react";
import { Background, BackgroundVariant, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeState, Workflow } from "@/api/client";
import { layoutWorkflow, statusOf } from "@/lib/studio";
import { AgentNode, type AgentNodeData } from "./AgentNode";

const nodeTypes = { agent: AgentNode };

/** Canvas del workflow REAL: nodos y conexiones salen del plan persistido por el orquestador. */
export function WorkflowCanvas({
  workflow,
  nodeState,
  selected,
  technical,
  onSelect,
}: {
  workflow: Workflow;
  nodeState: Record<string, NodeState>;
  selected: string | null;
  technical: boolean;
  onSelect: (id: string) => void;
}) {
  const pos = useMemo(() => layoutWorkflow(workflow), [workflow]);

  const nodes: Node[] = useMemo(
    () =>
      workflow.nodes.map((n) => ({
        id: n.id,
        type: "agent",
        position: { x: pos[n.id]?.x ?? 0, y: pos[n.id]?.y ?? 0 },
        data: { node: n, state: nodeState[n.id], status: statusOf(n, nodeState[n.id]), selected: selected === n.id, technical } satisfies AgentNodeData,
        draggable: false,
        connectable: false,
      })),
    [workflow, pos, nodeState, selected, technical],
  );

  const edges: Edge[] = useMemo(
    () =>
      workflow.edges.map((e) => {
        const target = workflow.nodes.find((n) => n.id === e.target);
        const st = target ? statusOf(target, nodeState[target.id]) : "PENDING";
        const live = st === "RUNNING";
        const dim = st === "SKIPPED" || st === "CANCELLED";
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label ?? undefined,
          animated: live,
          markerEnd: { type: MarkerType.ArrowClosed, color: live ? "hsl(295 70% 60%)" : "rgba(255,255,255,0.35)" },
          style: { stroke: live ? "hsl(295 70% 60%)" : dim ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.32)", strokeDasharray: dim ? "4 4" : undefined, strokeWidth: live ? 2 : 1.3 },
          labelStyle: { fill: "hsl(220 15% 80%)", fontSize: 11 },
          labelBgStyle: { fill: "hsl(264 40% 10%)" },
        };
      }),
    [workflow, nodeState],
  );

  return (
    <div className="h-full w-full" aria-label="Workflow de agentes de NADF">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, n) => onSelect(n.id)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.08)" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap pannable zoomable className="!bg-[hsl(264_40%_9%)]" maskColor="rgba(10,6,20,0.6)" nodeColor={() => "hsl(220 85% 55% / 0.5)"} />
      </ReactFlow>
    </div>
  );
}
