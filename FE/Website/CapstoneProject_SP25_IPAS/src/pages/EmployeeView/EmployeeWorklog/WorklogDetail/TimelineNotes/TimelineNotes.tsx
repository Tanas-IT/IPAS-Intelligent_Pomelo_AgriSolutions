import { useState } from "react";
import { Timeline, Avatar, Button, Flex, Modal, Image } from "antd";
import style from "./TimelineNotes.module.scss";
import { CustomButton } from "@/components";
import { useStyle } from "@/hooks";
import NoteDetail from "../NoteDetail/NoteDetail";
import { Images } from "@/assets";

interface Note {
    issue: string;
    notes: string;
    fullName: string;
    avatarURL: string;
    userId: number;
    listResources: {
        resourceID: number;
        resourceCode: string;
        resourceURL: string;
    }[];
}

interface TimelineNotesProps {
    notes: Note[];
    onAddNote?: () => void;
    currentUserId: number;
}

const TimelineNotes: React.FC<TimelineNotesProps> = ({ notes, onAddNote, currentUserId }) => {
    const { styles } = useStyle();
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const handleViewDetails = (note: Note) => {
        setSelectedNote(note);
    };

    const handleCloseModal = () => {
        setSelectedNote(null);
    };

    const hasCurrentUserCreatedNote = notes.some(note => note.userId === currentUserId);

    return (
        <>
            {notes.length === 0 ? (
                <Flex vertical align="center" className={style.emptyNotesContainer} gap={20}>
                    <img src={Images.emptyNote} alt="Empty Note" />
                    <p className={style.noNotesText}>Don’t have any notes on this task yet.</p>
                    <p className={style.noNotesTextDes}>Start creating your notes below.</p>
                    <Button type="primary" onClick={onAddNote}>Add Notes</Button>
                </Flex>
            ) : (
                <Flex vertical gap={20}>
                    <Timeline>
                        {notes.map((note, index) => {
                            const images = note.listResources.filter(resource =>
                                resource.resourceURL.match(/\.(jpeg|jpg|gif|png)$/i)
                            ).map(resource => resource.resourceURL);

                            const videos = note.listResources.filter(resource =>
                                resource.resourceURL.match(/\.(mp4|mov|avi)$/i)
                            ).map(resource => resource.resourceURL);

                            return (
                                <Timeline.Item key={index} className={styles.customTimeline} color="#326E2F">
                                    <Flex vertical={false} gap={12} className={style.timelineContainer}>
                                        <Avatar src={note.avatarURL} size={30} shape="circle" crossOrigin="anonymous" />
                                        <div className={style.timelineDetail}>
                                            <Flex gap={20}>
                                                <span className={style.userName}>{note.fullName}</span>
                                                <span>created this note</span>
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
                                                </Flex>
                                            </Flex>
                                        </div>
                                    </Flex>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>

                    {/* Hiển thị nút "Add Notes" nếu người dùng hiện tại chưa tạo note */}
                    {!hasCurrentUserCreatedNote && (
                        <Flex justify="center">
                            <Button type="primary" onClick={onAddNote}>Add Your Note</Button>
                        </Flex>
                    )}
                </Flex>
            )}

            {/* Modal hiển thị chi tiết note */}
            <NoteDetail note={selectedNote} onClose={handleCloseModal} />
        </>
    );
};

export default TimelineNotes;