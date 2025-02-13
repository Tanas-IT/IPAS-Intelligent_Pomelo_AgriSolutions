import { useState } from "react";
import { Timeline, Avatar, Button, Flex, Modal, Image } from "antd";
import style from "./TimelineNotes.module.scss";
import { CustomButton } from "@/components";
import { useStyle } from "@/hooks";
import NoteDetail from "../NoteDetail/NoteDetail";

interface Note {
    id: number;
    user: { name: string; avatar: string };
    date: string;
    issue: string;
    note: string;
    media: { images: string[]; videos: string[] };
}

const notes: Note[] = [
    {
        id: 1,
        user: { name: "Laggg", avatar: "" },
        date: "Sunday, 1st Dec 2024, 8:30 AM",
        issue: "Pest Infestation",
        note: "Cây bị sâu bệnh nặng, cần xử lý ngay lập tức bằng thuốc trừ sâu sinh học.",
        media: {
            images: [
                "https://source.unsplash.com/200x200/?fruit",
                "https://source.unsplash.com/200x200/?tree"
            ],
            videos: [
                "https://www.w3schools.com/html/mov_bbb.mp4"
            ]
        },
    },
    {
        id: 2,
        user: { name: "Nathan David", avatar: "" },
        date: "Sunday, 1st Dec 2024, 8:30 AM",
        issue: "Water Deficiency",
        note: "Cây có dấu hiệu thiếu nước, cần tưới bổ sung 2 lần/ngày trong tuần tới.",
        media: {
            images: ["https://source.unsplash.com/200x200/?water"],
            videos: []
        },
    },
];

const TimelineNotes: React.FC = () => {
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
                {notes.map((note) => (
                    <Timeline.Item key={note.id} className={`${styles.customTimeline}`} color="#326E2F">
                        <Flex vertical={false} gap={12} className={style.timelineContainer}>
                            <Avatar src={note.user.avatar} size={30} shape="circle" />
                            <div className={style.timelineDetail}>
                                <Flex gap={20}>
                                    <span className={style.userName}>{note.user.name}</span>
                                    <span>created this note</span>
                                    <span className={style.createdDate}>{note.date}</span>
                                </Flex>
                                <Flex className={style.infoRow}>
                                    <span className={style.label}>Issue:</span>
                                    <span>{note.issue}</span>
                                </Flex>

                                <Flex className={style.infoRow}>
                                    <span className={style.label}>Notes:</span>
                                    <span className={style.noteContent}>{note.note}</span>
                                </Flex>

                                <Flex justify="space-between">
                                    <Flex className={style.infoRow}>
                                        <span className={style.label}>Media:</span>
                                        <span>
                                            {note.media.images.length} Image | {note.media.videos.length} Video
                                        </span>
                                    </Flex>
                                    <Flex gap={10}>
                                        <CustomButton label="View Details" isCancel={false} isModal={true} handleOnClick={() => handleViewDetails(note)} />
                                        <CustomButton label="Edit" isCancel={true} />
                                    </Flex>
                                </Flex>
                            </div>
                        </Flex>
                    </Timeline.Item>
                ))}
            </Timeline>

            <NoteDetail note={selectedNote} onClose={() => setSelectedNote(null)} />
        </>
    );
};

export default TimelineNotes;
