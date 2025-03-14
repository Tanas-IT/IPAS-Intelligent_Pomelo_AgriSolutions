import { useState } from "react";
import { Timeline, Avatar, Button, Flex, Modal, Image } from "antd";
import style from "./TimelineNotes.module.scss";
import { CustomButton } from "@/components";
import { useStyle } from "@/hooks";
import NoteDetail from "../NoteDetail/NoteDetail";

interface Note {
    issue: string;
    notes: string;
    fullName: string;
    avatarURL: string;
    listResources: {
        resourceID: number;
        resourceCode: string;
        resourceURL: string;
    }[];
}

interface TimelineNotesProps {
    notes: Note[];
}

const TimelineNotes: React.FC<TimelineNotesProps> = ({ notes }) => {
    const { styles } = useStyle();
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const handleViewDetails = (note: Note) => {
        setSelectedNote(note);
    };

    const handleCloseModal = () => {
        setSelectedNote(null);
    };

    return (
        <>
            <Timeline>
                {notes.map((note, index) => {
                    // Phân loại resources thành images và videos
                    const images = note.listResources.filter(resource =>
                        resource.resourceURL.match(/\.(jpeg|jpg|gif|png)$/i)
                    ).map(resource => resource.resourceURL);

                    const videos = note.listResources.filter(resource =>
                        resource.resourceURL.match(/\.(mp4|mov|avi)$/i)
                    ).map(resource => resource.resourceURL);

                    return (
                        <Timeline.Item key={index} className={`${styles.customTimeline}`} color="#326E2F">
                            <Flex vertical={false} gap={12} className={style.timelineContainer}>
                                <Avatar src={note.avatarURL} size={30} shape="circle" crossOrigin="anonymous" />
                                <div className={style.timelineDetail}>
                                    <Flex gap={20}>
                                        <span className={style.userName}>{note.fullName}</span>
                                        <span>created this note</span>
                                        {/* <span className={style.createdDate}>{note.date}</span> */}
                                    </Flex>
                                    <Flex className={style.infoRow}>
                                        <span className={style.label}>Issues:</span>
                                        <span className={style.noteContent}>{note.issue}</span>
                                    </Flex>
                                    <Flex className={style.infoRow}>
                                        <span className={style.label}>Notes:</span>
                                        <span className={style.noteContent}>{note.notes}</span>
                                    </Flex>

                                    <Flex justify="space-between">
                                        <Flex className={style.infoRow}>
                                            <span className={style.label}>Media:</span>
                                            <span>
                                                {images.length} Image | {videos.length} Video
                                            </span>
                                        </Flex>
                                        <Flex gap={10}>
                                            <CustomButton
                                                label="View Details"
                                                isCancel={false}
                                                isModal={true}
                                                handleOnClick={() => handleViewDetails(note)}
                                            />
                                            {/* Nếu có chức năng Edit, bạn có thể thêm vào đây */}
                                            {/* <CustomButton label="Edit" isCancel={true} /> */}
                                        </Flex>
                                    </Flex>
                                </div>
                            </Flex>
                        </Timeline.Item>
                    );
                })}
            </Timeline>

            <NoteDetail note={selectedNote} onClose={handleCloseModal} />
        </>
    );
};

export default TimelineNotes;