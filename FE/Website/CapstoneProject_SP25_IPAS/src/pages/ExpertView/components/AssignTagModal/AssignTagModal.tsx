import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Spin, Flex } from 'antd';
import { GetTagResponse, AssignTagRequest } from '@/payloads';
import { expertService } from '@/services';
import { toast } from 'react-toastify';
import style from './AssignTagModal.module.scss';
import { CustomButton, InfoField } from '@/components';
import { getUserId } from '@/utils';

interface AssignTagModalProps {
    reportId: number;
    onClose: () => void;
    onTagAssigned: () => void;
}

const AssignTagModal: React.FC<AssignTagModalProps> = ({ reportId, onClose, onTagAssigned }) => {
    const [tags, setTags] = useState<GetTagResponse[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>();

    const [loading, setLoading] = useState(false);

    const fetchTags = async () => {
        try {
            const response = await expertService.getTags();
            if (response.statusCode === 200) {
                setTags(response.data || []);
            }
        } catch (error) {
            toast.warning('Failed to fetch tags.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleAssignTag = async () => {
        if (!selectedTag) {
            toast.warning('Please select a tag to assign.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            const data: AssignTagRequest = {
                reportId: reportId,
                tagId: selectedTag,
            };
            const response = await expertService.assignTag(data, Number(getUserId()));
            if (response.statusCode === 200) {
                toast.success('Tag assigned successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                onTagAssigned();
                onClose();
            } else {
                toast.warning('Failed to assign tag. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.warning('Failed to assign tag. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Assign Tag to Report"
            open={true}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            maskClosable={false}
            destroyOnClose
            className={style.assignTagModal}
        >
            <Spin spinning={loading}>
                <div className={style.tagSection}>
                    <InfoField
                        name='tags'
                        type='select'
                        label="Select Tag"
                        value={selectedTag}
                        onChange={setSelectedTag}
                        placeholder="Select a tag"
                        options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
                    />
                    <Flex gap={10} justify='flex-end' className={style.formActions}>
                        <CustomButton
                            label='Assign Tag'
                            handleOnClick={handleAssignTag}
                        />
                        <Button className={style.cancelButton} onClick={onClose}>
                            Cancel
                        </Button>
                    </Flex>
                </div>
            </Spin>
        </Modal>
    );
};

export default AssignTagModal;