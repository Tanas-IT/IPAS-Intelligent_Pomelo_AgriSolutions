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
import { worklogService } from '@/services'
import dayjs from 'dayjs'

type Worklog = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
};


function Worklog() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const navigate = useNavigate();
  const [worklog, setWorklog] = useState<Worklog[]>([]);

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

  const fetchData = async () => {
    try {
      const response = await worklogService.getWorklog();
      if (response) {
        const worklogs = response.data.list.map((log) => ({
          id: log.workLogId.toString(),
          title: log.workLogName,
          start: dayjs(`${log.date.split('T')[0]} ${log.startTime}`).format('YYYY-MM-DD HH:mm'),
          end: dayjs(`${log.date.split('T')[0]} ${log.endTime}`).format('YYYY-MM-DD HH:mm'),
          status: log.status,
        }));
        setWorklog(worklogs);
      } else {
        console.error('errorrr', response);
      }
    } catch (error) {
      console.error('errorrr:', error);
    }
  };

  console.log('worklogsssssssss', worklog);

  useEffect(() => {
    fetchData();
  }, []);

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

  useEffect(() => {
    if (eventsService) {
      eventsService.set(
        worklog.map((log) => ({
          id: log.id,
          title: `${log.title} (${log.status})`,
          start: log.start,
          end: log.end,
        }))
      );
    }
  }, [worklog, eventsService]);
  

  useEffect(() => {
    console.log("Worklog sau khi fetch:", worklog);
  }, [worklog]);

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: worklog.map((log) => ({
      id: log.id,
      title: `${log.title}`,
      start: log.start,
      end: log.end,
    })),
    selectedDate: dayjs().format("YYYY-MM-DD"),
    plugins: [eventsService],

  })

  useEffect(() => {
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