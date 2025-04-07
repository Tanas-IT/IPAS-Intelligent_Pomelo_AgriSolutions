import React, { useState } from 'react';
import './TagManager.module.scss';
import { motion } from 'framer-motion';
import { AssignTagRequest, GetTagResponse } from '@/payloads';

interface TagManagerProps {
  tags: GetTagResponse[];
  selectedTags: GetTagResponse[];
  onTagSelect: (request: AssignTagRequest) => void;
  onAddTag: (name: string) => void;
  onUpdateTag: (id: string, name: string) => void;
  onDeleteTag: (id: string) => void;
  onClose: () => void;
  reportId: number;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onClose,
  reportId,
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <motion.div
      className="tag-manager-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="tag-manager-content"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h3>Manage Tags</h3>
        <input
          className="tag-input"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add new tag..."
        />
        <button className="add-button" onClick={handleAddTag}>
          Add
        </button>
        <div className="tag-list">
          {tags.map(tag => (
            <div key={tag.id} className="tag-item">
              <span
                className={selectedTags.some(t => t.id === tag.id) ? 'selected' : ''}
                onClick={() => onTagSelect({ reportId, tagId: tag.id })}
              >
                {tag.name} ({tag.imageCount})
              </span>
              <div className="tag-actions">
                <button onClick={() => onUpdateTag(tag.id, prompt('New name:', tag.name) || tag.name)}>
                  Edit
                </button>
                <button onClick={() => onDeleteTag(tag.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TagManager;