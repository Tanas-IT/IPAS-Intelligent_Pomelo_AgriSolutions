import { Flex } from "antd";
import { useState, useEffect, useRef } from "react";
import { CustomButton, ModalForm } from "@/components";
import style from "./PlantList.module.scss";
import { toast } from "react-toastify";

type PlantImportModalProps = {
  isOpen: boolean;
  onClose: (file: File | null) => void;
  onSave: (file: File) => void;
  isLoadingAction?: boolean;
};

const PlantImportModal = ({ isOpen, onClose, onSave, isLoadingAction }: PlantImportModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    handleRemoveFile();
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file!");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input file
  };

  const handleSave = () => {
    if (!selectedFile) {
      toast.error("No file selected!");
      return;
    }
    onSave(selectedFile);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose(selectedFile)}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title={"Import Plants"}
      saveLabel="Apply"
    >
      <Flex className={style.importModal}>
        <div className={style.titleSection}>
          <label>Import Setting</label>
        </div>
        <Flex className={style.importSection}>
          <label>File (csv)</label>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleFileSelect(e)}
          />
          {selectedFile ? (
            <Flex className={style.fileDisplay}>
              <span className={style.fileName}>{selectedFile.name}</span>
              <CustomButton label="Remove" handleOnClick={handleRemoveFile} />
            </Flex>
          ) : (
            <CustomButton label="Select" handleOnClick={() => fileInputRef.current?.click()} />
          )}
        </Flex>
        <Flex className={style.importSection}>
          <label>Import Template</label>
          <a
            href="https://res.cloudinary.com/dgshx4n2c/raw/upload/v1740905615/PlantCSVRecord1_pxgx7f.csv"
            download
            className={style.downloadLink}
          >
            Download
          </a>
        </Flex>
        {/* <label>Duplicate Control</label> */}
      </Flex>
    </ModalForm>
  );
};

export default PlantImportModal;
