import React, { useState } from 'react';
import { Button, Select, Spin } from 'antd';
import { GetReportResponse, GetTagResponse, AssignTagRequest } from '@/payloads';
import { expertService } from '@/services';
import { toast } from 'react-toastify';
import style from './UntaggedImageCard.module.scss';

const { Option } = Select;

interface UntaggedImageCardProps {
  report: GetReportResponse;
  tags: GetTagResponse[];
  onTagAssigned: () => void;
}

const UntaggedImageCard: React.FC<UntaggedImageCardProps> = ({ report, tags, onTagAssigned }) => {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleAssignTag = async () => {
    if (!selectedTag || !report.image?.id) {
      toast.error('Please select a tag to assign.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    // try {
    //   const data: AssignTagRequest = {
    //     imageId: report.image.id,
    //     tagId: selectedTag,
    //   };
    //   const response = await expertService.assignTag(data);
    //   if (response.statusCode === 200) {
    //     toast.success('Tag assigned successfully!', {
    //       position: 'top-right',
    //       autoClose: 3000,
    //     });
    //     onTagAssigned();
    //   }
    // } catch (error) {
    //   toast.error('Failed to assign tag. Please try again.', {
    //     position: 'top-right',
    //     autoClose: 3000,
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className={style.untaggedImageCard}>
      <div className={style.cardImageWrapper}>
        <img
          src={report.image?.thumbnailUri || report.image?.originalImageUri || report.imageURL}
          alt="Untagged Image"
          className={style.cardImage}
        />
      </div>
      <div className={style.cardContent}>
        <div className={style.question}>{report.questionOfUser}</div>
        <div className={style.meta}>
          <span>From: {report.questionerName}</span>
        </div>
        <div className={style.tagSection}>
          <Select
            value={selectedTag}
            onChange={setSelectedTag}
            placeholder="Select a tag"
            className={style.tagSelect}
            dropdownClassName={style.customDropdown}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            className={style.assignButton}
            onClick={handleAssignTag}
            loading={loading}
          >
            Assign Tag
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UntaggedImageCard;