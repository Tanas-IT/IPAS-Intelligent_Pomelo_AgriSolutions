import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Tree, TreeDataNode, TreeProps } from "antd";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { processService } from "@/services";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";

interface SubProcess {
  subProcessId: number;
  subProcessName: string;
  parentSubProcessId?: number;
  listSubProcessData?: SubProcess[];
}

const mapSubProcessesToTree = (subProcesses: SubProcess[], parentId?: number): TreeDataNode[] => {
  return subProcesses
    .filter(sp => sp.parentSubProcessId === parentId)
    .map(sp => ({
      title: sp.subProcessName,
      key: sp.subProcessId.toString(),
      children: mapSubProcessesToTree(subProcesses, sp.subProcessId),
    }));
};

function ProcessDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.error("Missing id");
      return;
    }

    const fetchProcessDetails = async () => {
      try {
        const data = await processService.getProcessDetail(id);
        console.log("data", data);

        setTreeData(mapSubProcessesToTree(data.subProcesses));
      } catch (error) {
        console.error("Failed to fetch process details", error);
      }
    };

    fetchProcessDetails();
  }, [id]);
  console.log("tree data", treeData);


  const handleAdd = (parentKey: string) => {
    const newKey = `${parentKey}-${Date.now()}`;
    const newNode: TreeDataNode = {
      title: "New Task",
      key: newKey,
      children: [],
    };

    const updateTree = (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes.map(node => {
        if (node.key === parentKey) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setTreeData(updateTree(treeData));
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    const node = findNodeByKey(treeData, key);
    if (node && typeof node.title === "string") {
      setNewTitle(node.title);
    }
  };

  const handleSave = () => {
    if (editingKey !== null) {
      const updatedData = [...treeData];
      const node = findNodeByKey(updatedData, editingKey);
      if (node) {
        node.title = newTitle;
      }
      setTreeData(updatedData);
      setEditingKey(null);
      setNewTitle("");
    }
  };

  const handleDelete = (key: string) => {
    const deleteNode = (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes
        .filter(node => node.key !== key)
        .map(node => ({
          ...node,
          children: node.children ? deleteNode(node.children) : undefined,
        }));
    };

    setTreeData(deleteNode(treeData));
  };

  const handleCancel = () => {

  }

  const handleSaveNode = () => {

  }

  const findNodeByKey = (nodes: TreeDataNode[], key: string): TreeDataNode | null => {
    for (let node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const foundNode = findNodeByKey(node.children, key);
        if (foundNode) return foundNode;
      }
    }
    return null;
  };

  const loopNodes = (nodes: any[]): TreeDataNode[] => {

    return nodes.map((node) => ({
      title: (
        <div
          onMouseEnter={() => setHoveredKey(node.key.toString())}
          onMouseLeave={() => setHoveredKey(null)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <EditableTreeNode
            isEditing={editingKey === node.key}
            title={editingKey === node.key ? newTitle : node.title}
            onChange={(e) => setNewTitle(e)}
            onBlur={handleSave}
          />

          {hoveredKey === node.key && (
            <ButtonActions
              editingKey={editingKey}
              nodeKey={node.key}
              onSave={handleSaveNode}
              onCancel={handleCancel}
              onEdit={() => handleEdit(node.key)}
              onDelete={() => handleDelete(node.key)}
              onAdd={() => handleAdd(node.key)}
            />
          )}
        </div>
      ),
      key: node.key,
      children: node.children ? loopNodes(node.children) : undefined,
    }));
  };

  const onDrop: TreeProps["onDrop"] = (info) => {
    const dropKey = info.node.key.toString();
    const dragKey = info.dragNode.key.toString();
    const dropToGap = info.dropToGap;
    const data = [...treeData];

    let dragObj: TreeDataNode | undefined;

    const loop = (nodes: TreeDataNode[], key: string, callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key === key) {
          return callback(nodes[i], i, nodes);
        }
        if (nodes[i].children) {
          loop(nodes[i].children!, key, callback);
        }
      }
    };

    // xoa node cu
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      // tha vao 1 node khac
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.push(dragObj!);
      });
    } else {
      // tha cung cap
      loop(data, dropKey, (item, index, arr) => {
        arr.splice(index + (info.dropPosition > 0 ? 1 : 0), 0, dragObj!);
      });
    }

    console.log("Updated Tree:", data);

    setTreeData([...data]);
  };

  return (
    <div className={style.container}>
      <div className={style.extraContent}>
        <Tooltip title="Back to List">
          <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PROCESS.PROCESS_LIST)} />
        </Tooltip>
      </div>
      <Divider className={style.divider} />
      <div className={style.contentSectionTitleLeft}>
        <p className={style.title}>Caring Process</p>
        <div className={style.addButton}>
          <CustomButton label="Add Sub Process" icon={<Icons.plus />} handleOnClick={() => handleAdd("root")} />
        </div>
      </div>
      <Divider className={style.divider} />
      <Tree
        draggable
        blockNode
        onDrop={onDrop}
        treeData={loopNodes(treeData)}
      />
      <div className={style.buttonGroup}>
        <Button>Cancel</Button>
        <Button className={style.confirmButton}>Save</Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProcessDetails;



