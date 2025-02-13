import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  createCalendar
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useState } from 'react'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import CustomTimeGridEvent from './CustomTimeGridEvent'
import CustomDateGridEvent from './CustomDateGridEvent'
import HeaderContentAppend from './HeaderContentAppend'
import style from "./Worklog.module.scss"
import "./customScheduleX.scss"
import WorklogFilter from './WorklogFilter/WorklogFilter'
import { useModal } from '@/hooks'
import { CreateWorklogRequest } from '@/payloads/worklog'
import WorklogModal from './WorklogModal/WorklogModal'
import { useNavigate } from 'react-router-dom'


function Worklog() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    createDateFrom: "",
    createDateTo: "",
    processTypes: [] as string[],
    status: [] as string[],
    isConfirm: false,
    employees: [] as string[],
    type: [] as string[],
    plan: [] as string[],
  });
  const addModal = useModal<CreateWorklogRequest>();

  const updateFilters = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // fetchData();
  };

  const handleClear = () => {
    setFilters({
      createDateFrom: "",
      createDateTo: "",
      processTypes: [],
      status: [],
      isConfirm: false,
      employees: [],
      type: [],
      plan: [],
    });
  };

  const fakeWorklogs = [
    {
      id: '1',
      title: 'Tưới nước',
      start: '2025-02-12 02:00',
      end: '2025-02-12 03:00',
      status: 'Completed',
    },
  ];

  // const eventModal = createEventModalPlugin({
  //   renderEventModal: ({ event, closeModal }) => (
  //     <div className="custom-modal">
  //       <h3>{event.title}</h3>
  //       <p>Bắt đầu: {event.start}</p>
  //       <p>Kết thúc: {event.end}</p>
  //       <button onClick={closeModal}>Đóng</button>
  //     </div>
  //   ),
  // });

  


  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: fakeWorklogs.map((log) => ({
      id: log.id,
      title: `${log.title} (${log.status})`,
      start: log.start,
      end: log.end,
    })),
    selectedDate: "2025-02-12",
    plugins: [eventsService],

  })

  useEffect(() => {
    // Giả lập việc lấy dữ liệu từ API
    eventsService.getAll()
  }, [])

  const handleOpenFilter = () => {

  }

  const handleAdd = () => {

  }

  const filterContent = (
    <WorklogFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  return (
    <div>
      <ScheduleXCalendar
        calendarApp={calendar}
        customComponents={{
          timeGridEvent: CustomTimeGridEvent,
          // dateGridEvent: CustomDateGridEvent,
          headerContentRightAppend: () => (
            <HeaderContentAppend filterContent={filterContent} addModal={addModal} />
          )
        }}
         />
      <WorklogModal
        isOpen={addModal.modalState.visible}
        onClose={addModal.hideModal}
        onSave={handleAdd}
      />
    </div>
  )
}

export default Worklog
