import { Modal, Avatar, Flex, Image } from "antd";
import style from "./NoteDetail.module.scss";
import { Images } from "@/assets";

interface Note {
    id: number;
    user: { name: string; avatar: string };
    date: string;
    issue: string;
    note: string;
    media: { images: string[]; videos: string[] };
}

interface NoteDetailProps {
    note: Note | null;
    onClose: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose }) => {
    if (!note) return null;

    return (
        <Modal title="Note Details" open={!!note} onCancel={onClose} footer={null}>
            <div>
                <Flex vertical={false} gap={12} className={style.modalHeader}>
                    <Avatar src={note.user.avatar} size={40} shape="circle" />
                    <div>
                        <h4 className={style.name}>{note.user.name}</h4>
                        <p className={style.createdDate}>{note.date}</p>
                    </div>
                </Flex>

                <Flex className={style.modalInfoRow}>
                    <span className={style.label}>Issue:</span>
                    <span>{note.issue}</span>
                </Flex>

                <Flex className={style.modalInfoRow}>
                    <span className={style.label}>Notes:</span>
                    <p>{note.note}</p>
                </Flex>

                <Flex className={style.modalInfoRow} vertical>
                    <span className={style.label}>Media:</span>
                    {note.media.images.length === 0 && note.media.videos.length === 0 ? (
                        <p className={style.noMedia}>Employee chưa up hình lên</p>
                    ) : (
                        <div className={style.mediaContainer}>
                            {note.media.images.length > 0 && (
                                <>
                                    <Flex gap={15}>
                                        <Image src={Images.imgImg} width={25} />
                                        <span className={style.mediaLabel}>Images:</span>

                                    </Flex>
                                    <div className={style.imageGrid}>
                                        {note.media.images.map((img, index) => (
                                            <Image key={index} src={img} width={100} height={100} style={{ borderRadius: "5px" }} />
                                        ))}
                                    </div>
                                </>
                            )}
                            {note.media.videos.length > 0 && (
                                <>
                                    <Flex gap={15}>
                                        <Image src={Images.videoImg} width={25} />
                                        <span className={style.mediaLabel}>Videos:</span>

                                    </Flex>
                                    <div className={style.videoGrid}>
                                        {note.media.videos.map((vid, index) => (
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
