import React, { useCallback, useMemo } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, Panel, ConnectionLineType, NodeTypes, MarkerType, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import { Tag } from 'antd';
import { Icons } from '@/assets';
import { PlanNodes, ProcessByPlanResponse, SubProcessNodes } from '@/payloads';
import style from './ProcessFlow.module.scss';
import dagre from 'dagre';
import { Loading } from '@/components';

interface PlanNodeData {
  type: 'plan';
  planData: PlanNodes;
  isCurrent: boolean;
  [key: string]: unknown;
}

interface SubProcessNodeData {
  type: 'subProcess';
  subProcessData: SubProcessNodes;
  hasChildren: boolean;
  [key: string]: unknown;
}

interface ProcessNodeData {
  type: 'process';
  processData: Omit<ProcessByPlanResponse, 'plans' | 'subProcesses'>;
  [key: string]: unknown;
}

type CustomNodeData = PlanNodeData | SubProcessNodeData | ProcessNodeData;
type CustomNode = Node<CustomNodeData>;

const ProcessNode = ({ data }: { data: ProcessNodeData }) => (
  <div className={style.processNode}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Icons.process className={style.nodeIcon} />
    <h3>{data.processData.processName}</h3>
    <Tag color="blue">Process</Tag>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const PlanNode = ({ data }: { data: PlanNodeData }) => (
  <div className={`${style.planNode} ${data.isCurrent ? style.current : ''}`}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Icons.plan className={style.leafIcon} />
    <div className={style.nodeContent}>
      <h4>{data.planData.planName}</h4>
      {data.planData.startDate && (
        <Tag color={data.isCurrent ? 'green' : 'purple'}>
          {new Date(data.planData.startDate).toLocaleDateString()}
        </Tag>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const SubProcessNode = ({ data }: { data: SubProcessNodeData }) => (
  <div className={style.subprocessNode}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Icons.process className={style.nodeIcon} />
    <div className={style.nodeContent}>
      <h4>{data.subProcessData.subProcessName}</h4>
      <Tag color="#1890ff">Order: {data.subProcessData.order}</Tag>
    </div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const getLayoutedElements = (nodes: CustomNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y
    };
  });

  return { nodes, edges };
};

// 4. Main Component
interface ProcessFlowProps {
  data: ProcessByPlanResponse | null;
  currentPlanId: number;
  onNodeClick?: (node: PlanNodes | SubProcessNodes) => void;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({
  data,
  currentPlanId,
  onNodeClick
}) => {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      process: ProcessNode,
      plan: PlanNode,
      subProcess: SubProcessNode
    }),
    []
  );

  const generateNodesAndEdges = useCallback(
    (
      parentId: string,
      parentType: 'process' | 'subProcess',
      items: (PlanNodes | SubProcessNodes)[],
      level: number = 1
    ) => {
      const nodes: CustomNode[] = [];
      const edges: Edge[] = [];

      items.forEach((item, index) => {
        const isSubProcess = 'subProcessID' in item;
        const nodeId = isSubProcess ? `sub-${item.subProcessID}` : `plan-${item.planId}`;

        nodes.push({
          id: nodeId,
          type: isSubProcess ? 'subProcess' : 'plan',
          position: { x: 0, y: 0 },
          data: isSubProcess
            ? {
                type: 'subProcess',
                subProcessData: item,
                hasChildren: item.children.length > 0 || item.plans.length > 0,
                [Symbol.iterator]: undefined
              }
            : {
                type: 'plan',
                planData: item,
                isCurrent: item.planId === currentPlanId,
                [Symbol.iterator]: undefined
              }
        });

        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: ConnectionLineType.SmoothStep,
            animated: !isSubProcess && (item as PlanNodes).isSelected,
            style: {
              stroke: !isSubProcess && (item as PlanNodes).isSelected ? '#52c41a' : '#333',
              strokeWidth: 2
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: !isSubProcess && (item as PlanNodes).isSelected ? '#52c41a' : '#333'
            }
          });
        }

        if (isSubProcess) {
          const subProcess = item as SubProcessNodes;
          const childResults = generateNodesAndEdges(
            nodeId,
            'subProcess',
            [...subProcess.children, ...subProcess.plans],
            level + 1
          );
          nodes.push(...childResults.nodes);
          edges.push(...childResults.edges);
        }
      });

      return { nodes, edges };
    },
    [currentPlanId]
  );

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodes: CustomNode[] = [
      {
        id: `process-${data.processId}`,
        type: 'process',
        position: { x: 0, y: 0 },
        data: {
          type: 'process',
          processData: {
            processId: data.processId,
            processName: data.processName
          },
          [Symbol.iterator]: undefined
        }
      }
    ];
    const edges: Edge[] = [];

    const { nodes: childNodes, edges: childEdges } = generateNodesAndEdges(
      `process-${data.processId}`,
      'process',
      [...data.plans, ...data.subProcesses]
    );

    const allNodes = [...nodes, ...childNodes];
    const allEdges = [...edges, ...childEdges];

    return getLayoutedElements(allNodes, allEdges);
  }, [data, generateNodesAndEdges]);

  const onNodeClickHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const customNode = node as unknown as CustomNode; // Safe type casting
      if (!onNodeClick) return;

      if (customNode.data.type === 'plan') {
        onNodeClick(customNode.data.planData);
      } else if (customNode.data.type === 'subProcess') {
        onNodeClick(customNode.data.subProcessData);
      }
    },
    [onNodeClick]
  );

  if (!data) {
    return <Loading />;
  }

  return (
    <div className={style.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClickHandler}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={false}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: '8px' }}>
            <Tag color="green">Current Plan</Tag>
            <Tag color="blue">Process: <Icons.process className={style.nodeIcon} /></Tag>
            <Tag color="purple">Plan: <Icons.plan className={style.leafIcon} /></Tag>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ProcessFlow;