import React, { useState, useEffect } from 'react';
import { Segmented, Spin, Empty, Pagination, Select, Input, Button } from 'antd';
import { expertService } from '@/services';
import { GetImageResponse, GetReportResponse, GetTagResponse, GetImageRequest } from '@/payloads';
import { toast } from 'react-toastify';
import style from './ImageManagement.module.scss';
import ImageCard from '../components/ImageCard/ImageCard';
import UntaggedImageCard from '../components/UntaggedImageCard/UntaggedImageCard';
import { FilterOutlined, TagsOutlined } from '@ant-design/icons';
import TagManagementModal from '../components/TagManager/TagManager';

const { Search } = Input;
const { Option } = Select;

const ImageManagementScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tagged' | 'untagged'>('tagged');
  const [taggedImages, setTaggedImages] = useState<GetImageResponse[]>([]);
  const [untaggedReports, setUntaggedReports] = useState<GetReportResponse[]>([]);
  const [tags, setTags] = useState<GetTagResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [searchKey, setSearchKey] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(50);
  const [totalImages, setTotalImages] = useState<number>(0);
  const [showTagModal, setShowTagModal] = useState(false);

  const fetchTaggedImages = async () => {
    setLoading(true);
    try {
      const req: GetImageRequest = {
        pageIndex: currentPage,
        pageSize,
        orderBy: 'created',
        tagName: tagFilter,
      };
      const response = await expertService.getAllImage(req);
      console.log('response222222', response);
      
      if (response.statusCode === 200) {
        setTaggedImages(response.data || []);
        setTotalImages(response.data?.length || 0); // Giả định API trả về total, nếu không thì cần điều chỉnh
      }
    } catch (error) {
      toast.warning('Failed to fetch tagged images.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUntaggedReports = async () => {
    setLoading(true);
    try {
      const response = await expertService.getAllReportsWithPagin(
        searchKey,
        'createdDate',
        'desc',
        undefined,
        undefined,
        currentPage,
        pageSize
      );
      if (response.statusCode === 200) {
        const untagged = response.data.list.filter(
          (report) => report.image && !report.isTrainned
        );
        setUntaggedReports(untagged);
        setTotalImages(untagged.length);
      }
    } catch (error) {
      toast.warning('Failed to fetch untagged reports.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (viewMode === 'tagged') {
      fetchTaggedImages();
    } else {
      fetchUntaggedReports();
    }
  }, [viewMode, currentPage, tagFilter, searchKey]);

  const handleRetrain = async () => {
    setLoading(true);
    try {
      // Giả định API retrainCustomVision
      toast.success('Re-training started successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.warning('Failed to start re-training.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.imageManagementScreen}>
      <div className={style.header}>
        <h2>Image Management</h2>
        <Button
          type="primary"
          className={style.retrainButton}
          onClick={handleRetrain}
          loading={loading}
        >
          <FilterOutlined /> Re-train Custom Vision
        </Button>
      </div>

      <Segmented
        className={style.segmented}
        value={viewMode}
        onChange={(value) => setViewMode(value as 'tagged' | 'untagged')}
        options={[
          { label: 'Tagged Images', value: 'tagged' },
          { label: 'Untagged Images', value: 'untagged' },
        ]}
      />

      <div className={style.filterSection}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {viewMode === 'tagged' ? (
            <Select
              value={tagFilter}
              onChange={setTagFilter}
              className={style.filterSelect}
              placeholder="Filter by Tag"
              allowClear
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          ) : (
            <>
              <Search
                placeholder="Search reports..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className={style.searchInput}
              />
              <Button
                type="primary"
                onClick={() => setShowTagModal(true)}
                style={{ borderRadius: '20px' }}
              >
                <TagsOutlined /> Manage Tags
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <Spin size="large" className={style.loader} />
      ) : viewMode === 'tagged' ? (
        taggedImages.length > 0 ? (
          <>
            <div className={style.imageGrid}>
              {taggedImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  tagName={tagFilter || 'Unknown Disease'} // Giả định tagName, nếu API trả về tag thì thay thế
                />
              ))}
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalImages}
              onChange={setCurrentPage}
              className={style.pagination}
              showSizeChanger={false}
            />
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tagged images found"
            className={style.emptyState}
          />
        )
      ) : untaggedReports.length > 0 ? (
        <>
          <div className={style.imageGrid}>
            {untaggedReports.map((report) => (
              <UntaggedImageCard
                key={report.reportID}
                report={report}
                tags={tags}
                onTagAssigned={fetchUntaggedReports}
              />
            ))}
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalImages}
            onChange={setCurrentPage}
            className={style.pagination}
            showSizeChanger={false}
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No untagged images found"
          className={style.emptyState}
        />
      )}

      {showTagModal && (
        <TagManagementModal
          tags={tags}
          onClose={() => setShowTagModal(false)}
          onTagUpdated={() => {
            fetchTags();
            setShowTagModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ImageManagementScreen;