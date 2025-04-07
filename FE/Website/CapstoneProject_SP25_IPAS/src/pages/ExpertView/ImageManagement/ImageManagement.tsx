import React, { useState, useEffect } from 'react';
import './ImageManagement.module.scss';
import { expertService } from '@/services';
import { AssignTagRequest, GetImageRequest, GetImageResponse, GetTagResponse } from '@/payloads';
import ImageCard from '../components/ImageCard/ImageCard';
import TrainingButton from '../components/TrainingButton/TrainingButton';
import TagManager from '../components/TagManager/TagManager';

const ImageManagement = () => {
  const [taggedImages, setTaggedImages] = useState<(GetImageResponse & { tags: GetTagResponse[] })[]>([]);
  const [untaggedImages, setUntaggedImages] = useState<(GetImageResponse & { tags: GetTagResponse[] })[]>([]);
  const [tags, setTags] = useState<GetTagResponse[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  
  // Filter states
  const [tagNameFilter, setTagNameFilter] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('created'); // Mặc định sắp xếp theo ngày tạo
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(50); // Mặc định 50 theo BE
  const [totalImages, setTotalImages] = useState<number>(0); // Để tính tổng số trang

  useEffect(() => {
    fetchData();
  }, [tagNameFilter, orderBy, pageIndex]);

  const fetchData = async () => {
    const prop: GetImageRequest = {
        tagName: tagNameFilter,
        orderBy,
        pageIndex,
        pageSize,
    }
    const imageResponse = await expertService.getAllImage(prop);
    const tagResponse = await expertService.getTags();
    if (imageResponse.statusCode === 200 && tagResponse.statusCode === 200) {
      // Giả định BE không trả tag trong image, thêm tags rỗng
      const images = imageResponse.data.map(img => ({ ...img, tags: [] }));
      setTaggedImages(images.filter(img => img.tags.length > 0));
      setUntaggedImages(images.filter(img => img.tags.length === 0));
      setTags(tagResponse.data);
      setTotalImages(imageResponse.data.length); // Giả định BE trả total, cần điều chỉnh nếu có API metadata
    }
  };

  const handleTagImage = (id: string) => {
    const image = untaggedImages.find(img => img.id === id);
    if (image) {
      setSelectedImageId(id);
      setSelectedReportId(Math.floor(Math.random() * 1000)); // Giả lập, thay bằng logic thật từ BE
    }
  };

  const handleTagSelect = async (request: AssignTagRequest) => {
    if (selectedImageId) {
      const response = await expertService.assignTag(request);
      if (response.statusCode === 200) {
        const tag = tags.find(t => t.id === request.tagId);
        if (tag) {
          const image = untaggedImages.find(img => img.id === selectedImageId);
          if (image) {
            const updatedImage = { ...image, tags: [...image.tags, tag] };
            setUntaggedImages(untaggedImages.filter(img => img.id !== selectedImageId));
            setTaggedImages([...taggedImages, updatedImage]);
          }
        }
      }
    }
  };

  const handleAddTag = async (name: string) => {
    const response = await expertService.addTag(name);
    if (response.statusCode === 200) {
      setTags([...tags, { id: Date.now().toString(), name, type: 'disease', imageCount: 0 }]);
    }
  };

  const handleUpdateTag = async (id: string, name: string) => {
    const response = await expertService.updateTag(id, name);
    if (response.statusCode === 200) {
      setTags(tags.map(tag => (tag.id === id ? { ...tag, name } : tag)));
    }
  };

  const handleDeleteTag = async (id: string) => {
    const response = await expertService.deleteTag(id);
    if (response.statusCode === 200) {
      setTags(tags.filter(tag => tag.id !== id));
    }
  };

  const handleTrain = async () => {
    // const response = await expertService.trainModel();
    // if (response.statusCode === 200) {
    //   console.log('Model trained successfully');
    // }
  };

  const totalPages = Math.ceil(totalImages / pageSize);

  return (
    <div className="custom-vision-management-screen">
      <div className="filter-section">
        <h1 className="main-title">Custom Vision Management</h1>
        <div className="filters">
          <input
            type="text"
            className="filter-input"
            placeholder="Filter by tag name..."
            value={tagNameFilter}
            onChange={(e) => setTagNameFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
          >
            <option value="created">Sort by Created Date</option>
            <option value="width">Sort by Width</option>
            <option value="height">Sort by Height</option>
          </select>
        </div>
      </div>

      <section className="section">
        <h2 className="title">Tagged Images ({taggedImages.length})</h2>
        <div className="image-grid">
          {taggedImages.map(image => (
            <ImageCard key={image.id} image={image} onTag={handleTagImage} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="title">Untagged Images ({untaggedImages.length})</h2>
        <div className="image-grid">
          {untaggedImages.map(image => (
            <ImageCard key={image.id} image={image} onTag={handleTagImage} />
          ))}
        </div>
      </section>

      <div className="pagination">
        <button
          className="pagination-button"
          disabled={pageIndex === 1}
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          Previous
        </button>
        <span className="pagination-info">Page {pageIndex} of {totalPages}</span>
        <button
          className="pagination-button"
          disabled={pageIndex === totalPages}
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          Next
        </button>
      </div>

      {selectedImageId && selectedReportId && (
        <TagManager
          tags={tags}
          selectedTags={untaggedImages.find(img => img.id === selectedImageId)?.tags || []}
          onTagSelect={handleTagSelect}
          onAddTag={handleAddTag}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
          onClose={() => {
            setSelectedImageId(null);
            setSelectedReportId(null);
          }}
          reportId={selectedReportId}
        />
      )}
      <TrainingButton onTrain={handleTrain} />
    </div>
  );
};

export default ImageManagement;