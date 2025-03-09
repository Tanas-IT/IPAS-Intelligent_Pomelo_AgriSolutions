import { Modal, Avatar, Flex, Image } from "antd";
import style from "./NoteDetail.module.scss";
import { Images } from "@/assets";

interface Note {
    notes: string;
    fullName: string;
    avatarURL: string;
    listResources: {
        resourceID: number;
        resourceCode: string;
        resourceURL: string;
    }[];
}

interface NoteDetailProps {
    note: Note | null;
    onClose: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose }) => {
    if (!note) return null;
    // Phân loại resources thành images và videos
    const images = note.listResources.filter(resource =>
        resource.resourceURL.match(/\.(jpeg|jpg|gif|png)$/i)
    ).map(resource => resource.resourceURL);

    const videos = note.listResources.filter(resource =>
        resource.resourceURL.match(/\.(mp4|mov|avi)$/i)
    ).map(resource => resource.resourceURL);

    return (
        <Modal title="Note Details" open={!!note} onCancel={onClose} footer={null}>
            <div>
                <Flex vertical={false} gap={12} className={style.modalHeader}>
                    <Avatar src={note.avatarURL} size={40} shape="circle" crossOrigin="anonymous" />
                    <div>
                        <h4 className={style.name}>{note.fullName}</h4>
                    </div>
                </Flex>

                <Flex className={style.modalInfoRow}>
                    <span className={style.label}>Notes:</span>
                    <p>{note.notes}</p>
                </Flex>

                <Flex className={style.modalInfoRow} vertical>
                    <span className={style.label}>Media:</span>
                    {images.length === 0 && videos.length === 0 ? (
                        <p className={style.noMedia}>Employee haven't uploaded any images or videos.</p>
                    ) : (
                        <div className={style.mediaContainer}>
                            {images.length > 0 && (
                                <>
                                    <Flex gap={15}>
                                        <Image src={Images.imgImg} width={25} crossOrigin="anonymous" />
                                        <span className={style.mediaLabel}>Images:</span>
                                    </Flex>
                                    <div className={style.imageGrid}>
                                        {images.map((img, index) => (
                                            <Image key={index} src={img} width={100} height={100} style={{ borderRadius: "5px" }} crossOrigin="anonymous" />
                                        ))}
                                    </div>
                                </>
                            )}
                            {videos.length > 0 && (
                                <>
                                    <Flex gap={15}>
                                        <Image src={Images.videoImg} width={25} crossOrigin="anonymous" />
                                        <span className={style.mediaLabel}>Videos:</span>
                                    </Flex>
                                    <div className={style.videoGrid}>
                                        {videos.map((vid, index) => (
                                            <video key={index} width="200" controls style={{ borderRadius: "5px", marginTop: "10px" }}>
                                                <source src={vid} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Flex>
            </div>
        </Modal>
    );
};

export default NoteDetail;
