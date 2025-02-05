import { useLocation, useNavigate } from "react-router-dom";
import style from "./ProcessDetails.module.scss";
import { Button, Divider, Flex, Tag, Tree, TreeDataNode, TreeProps, Input } from "antd";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { PATHS } from "@/routes";
import { useState } from "react";
import EditableTreeNode from "./EditableTreeNode";
import ButtonActions from "./ButtonActions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const generateProcessData = () => [
  {
    title: "Lựa chọn cây giống",
    key: "0-0",
    children: [
      { title: "Lựa chọn nhà cung cấp", key: "0-0-0" },
      {
        title: "Kiểm tra cây giống khi nhận hàng",
        key: "0-0-1",
        children: [
          { title: "Plowing", key: "0-0-1-0" },
          { title: "Leveling", key: "0-0-1-1" },
        ],
      },
    ],
  },
  {
    title: "Trồng cây con",
    key: "0-1",
    children: [
      { title: "Chuẩn bị trước khi trồng", key: "0-1-0" },
      { title: "Trồng cây", key: "0-1-1" },
    ],
  },
  {
    title: "Chăm sóc sau khi trồng",
    key: "0-2",
    children: [
      { title: "Tưới nước", key: "0-2-0" },
      { title: "Bón phân", key: "0-2-1" },
      { title: "Phòng ngừa sâu bệnh", key: "0-2-2" },
    ],
  },
];

function ProcessDetails() {
  const navigate = useNavigate();
  const [gData, setGData] = useState<TreeDataNode[]>(generateProcessData());
  const [expandedKeys] = useState<string[]>(["0-0", "0-1", "0-2"]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  const onDrop: TreeProps["onDrop"] = (info) => {
    const dropKey = info.node.key.toString();
    const dragKey = info.dragNode.key.toString();
    const dropToGap = info.dropToGap;
    const data = [...gData];

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

    setGData([...data]);
  };
  console.log("newTitle", newTitle);

  const handleSaveNode = () => { };
  const handleCancel = () => { };


  const handleAdd = (parentKey: string) => {
    const newKey = `${parentKey}-${Date.now()}`;
    const newNode: TreeDataNode = {
      title: "New Task",
      key: newKey,
      children: [],
    };

    const updateTree = (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes.map((node) => {
        if (node.key === parentKey) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setGData(updateTree(gData));
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    const node = findNodeByKey(gData, key);
    if (node && typeof node.title === 'string') {
      setNewTitle(node.title);
    } else {
      console.error(`Node with key ${key} not found or title is not a string.`);
    }
  };

  const handleSave = () => {
    if (editingKey !== null) {
      const updatedData = [...gData];
      const node = findNodeByKey(updatedData, editingKey);
      if (node) {
        node.title = newTitle;
      }
      setGData(updatedData);
      setEditingKey(null);
      setNewTitle("");
    }
  };

  const handleDelete = (key: string) => {
    const deleteNode = (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes
        .filter((node) => node.key !== key)
        .map((node) => ({
          ...node,
          children: node.children ? deleteNode(node.children) : undefined,
        }));
    };

    setGData(deleteNode(gData));
  };

  const findNodeByKey = (nodes: TreeDataNode[], key: string): TreeDataNode | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        return nodes[i];
      }
      if (nodes[i].children) {
        const foundNode = findNodeByKey(nodes[i].children!, key);
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

  const handleAddRoot = () => {
    const newKey = `root-${Date.now()}`;
    const newNode: TreeDataNode = {
      title: "New Root Process",
      key: newKey,
      children: [],
    };
  
    setGData((prev) => [...prev, newNode]);
  };
  

  return (
    <div className={style.container}>
      <Flex className={style.extraContent}>
        <Tooltip title="Back to List">
          <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PROCESS.PROCESS_LIST)} />
        </Tooltip>
      </Flex>
      <Divider className={style.divider} />
      <Flex className={style.contentSectionTitleLeft}>
        <p className={style.title}>Caring Process</p>
        <Tooltip title="Hello">
          <Icons.tag className={style.iconTag} />
        </Tooltip>
        <Tag className={`${style.statusTag} ${style.normal}`}>Normal</Tag>
        <div className={style.addButton}>
          <CustomButton
            label="Add Sub Process"
            icon={<Icons.plus />}
            handleOnClick={handleAddRoot} />
        </div>
      </Flex>
      <Divider className={style.divider} />
      <Tree
        defaultExpandedKeys={expandedKeys}
        draggable
        blockNode
        onDrop={onDrop}
        treeData={loopNodes(gData)} />
      <div className={style.buttonGroup}>
        <Button>Cancel</Button>
        <Button className={style.confirmButton}>Save</Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProcessDetails;
