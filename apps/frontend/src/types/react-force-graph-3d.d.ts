declare module 'react-force-graph-3d' {
  import type { ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface ForceGraph3DProps<NodeType = object, LinkType = object> {
    width?: number;
    height?: number;
    graphData?: {
      nodes: NodeType[];
      links: LinkType[];
    };
    backgroundColor?: string;
    nodeRelSize?: number;
    nodeId?: string;
    nodeLabel?: string | ((node: NodeType) => string);
    nodeVal?: string | ((node: NodeType) => number);
    nodeColor?: string | ((node: NodeType) => string);
    nodeAutoColorBy?: string | ((node: NodeType) => string);
    onNodeClick?: (node: NodeType, event: MouseEvent) => void;
    onNodeRightClick?: (node: NodeType, event: MouseEvent) => void;
    onNodeHover?: (node: NodeType | null, prevNode: NodeType | null) => void;
    onNodeDrag?: (node: NodeType, translate: { x: number; y: number; z: number }) => void;
    onNodeDragEnd?: (node: NodeType, translate: { x: number; y: number; z: number }) => void;
    linkSource?: string;
    linkTarget?: string;
    linkLabel?: string | ((link: LinkType) => string);
    linkVisibility?: boolean | ((link: LinkType) => boolean);
    linkColor?: string | ((link: LinkType) => string);
    linkAutoColorBy?: string | ((link: LinkType) => string);
    linkWidth?: number | ((link: LinkType) => number);
    linkOpacity?: number;
    linkCell?: string | ((link: LinkType) => string); // Added missing prop
    forceEngine?: 'd3' | 'ngraph';
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    warmupTicks?: number;
    cooldownTicks?: number;
    cooldownTime?: number;
    enableNodeDrag?: boolean;
    enableNavigationControls?: boolean;
    enablePointerInteraction?: boolean;
    controlType?: 'trackball' | 'orbit' | 'fly';
    rendererConfig?: Record<string, unknown>;
    extraRenderers?: unknown[];
    nodeThreeObject?: (node: NodeType) => unknown;
    nodeThreeObjectExtend?: boolean | ((node: NodeType) => boolean);
  }

  const ForceGraph3D: ForwardRefExoticComponent<
    ForceGraph3DProps & RefAttributes<HTMLElement | null>
  >;

  export default ForceGraph3D;
}
