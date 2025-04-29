import React, { useState } from 'react';
import { Modal, Input, Button, Table, Spin } from 'antd';
import { GetTagResponse } from '@/payloads';
import { expertService } from '@/services';
import { toast } from 'react-toastify';
import style from './TagManager.module.scss';

interface TagManagementModalProps {
  tags: GetTagResponse[];
  onClose: () => void;
  onTagUpdated: () => void;
}

const TagManagementModal: React.FC<TagManagementModalProps> = ({ tags, onClose, onTagUpdated }) => {
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.warning('Please enter a tag name.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await expertService.addTag(newTag);
      if (response.statusCode === 200) {
        toast.success('Tag added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onTagUpdated();
        setNewTag('');
      }
    } catch (error) {
      toast.warning('Failed to add tag. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editingTagName.trim()) {
      toast.warning('Please enter a new tag name.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await expertService.updateTag(tagId, editingTagName);
      if (response.statusCode === 200) {
        toast.success('Tag updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onTagUpdated();
        setEditingTag(null);
        setEditingTagName('');
      }
    } catch (error) {
      toast.warning('Failed to update tag. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await expertService.deleteTag(tagId);
      if (response.statusCode === 200) {
        toast.success('Tag deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onTagUpdated();
      }
    } catch (error) {
      toast.warning('Failed to delete tag. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tag Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: GetTagResponse) =>
        editingTag === record.id ? (
          <Input
            value={editingTagName}
            onChange={(e) => setEditingTagName(e.target.value)}
            className={style.tagInput}
          />
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: 'Image Count',
      dataIndex: 'imageCount',
      key: 'imageCount',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GetTagResponse) => (
        <div className={style.tagActions}>
          {editingTag === record.id ? (
            <>
              <Button
                type="primary"
                className={style.saveButton}
                onClick={() => handleUpdateTag(record.id)}
              >
                Save
              </Button>
              <Button
                className={style.cancelButton}
                onClick={() => {
                  setEditingTag(null);
                  setEditingTagName('');
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                className={style.editButton}
                onClick={() => {
                  setEditingTag(record.id);
                  setEditingTagName(record.name);
                }}
              >
                Edit
              </Button>
              <Button
                danger
                className={style.deleteButton}
                onClick={() => handleDeleteTag(record.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Manage Tags"
      open={true}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      maskClosable={false}
      destroyOnClose
      className={style.tagManagementModal}
    >
      <Spin spinning={loading}>
        <div className={style.addTagSection}>
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter new tag name"
            className={style.tagInput}
          />
          <Button
            type="primary"
            className={style.addButton}
            onClick={handleAddTag}
          >
            Add Tag
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={false}
          className={style.tagTable}
        />
      </Spin>
    </Modal>
  );
};

export default TagManagementModal;