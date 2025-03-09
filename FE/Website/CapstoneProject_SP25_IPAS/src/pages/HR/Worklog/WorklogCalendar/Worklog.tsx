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
import { CreateWorklogRequest, GetWorklog } from '@/payloads/worklog'
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

type CalendarEvent = {
  id: string | number;
  title: string;
  start: string;
  end: string;
  calendarId: string;
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
      console.log(response);
      
      if (response) {
        const worklogs = response.map((log: GetWorklog) => ({
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

  const statusToCalendarId = (status: string): string => {
    const cleanStatus = status.trim().toLowerCase(); 
    const mapping: Record<string, string> = {
      "not started": "notStarted",
      "in progress": "inProgress",
      "overdue": "overdue",
      "reviewing": "reviewing",
      "done": "done",
    };
    const result = mapping[cleanStatus] || "notStarted";
    return result;
  };

  useEffect(() => {
    if (eventsService) {
      const formattedEvents = worklog.map((log) => {
        const calendarId = statusToCalendarId(log.status);
        return {
          id: log.id,
          title: `${log.title}`,
          start: log.start,
          end: log.end,
          calendarId, 
        };
      });
      const groupedEvents = groupEventsByTime(formattedEvents);
      eventsService.set(formattedEvents);
    }
  }, [eventsService, worklog]);

  const groupEventsByTime = (events: CalendarEvent[]): CalendarEvent[][] => {
    const grouped: Record<string, CalendarEvent[]> = {};
  
    events.forEach((event) => {
      if (!grouped[event.start]) {
        grouped[event.start] = [];
      }
      grouped[event.start].push(event);
    });
  
    return Object.values(grouped);
  };

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    calendars: {
      notStarted: {
        colorName: 'notStarted',
        lightColors: {
          main: '#B0BEC5',
          container: '#ECEFF1',
          onContainer: '#37474F',
        },
        darkColors: {
          main: '#90A4AE',
          container: '#455A64',
          onContainer: '#CFD8DC',
        },
      },
      inProgress: {
        colorName: 'inProgress',
        lightColors: {
          main: '#42A5F5',
          container: '#BBDEFB',
          onContainer: '#0D47A1',
        },
        darkColors: {
          main: '#64B5F6',
          container: '#1E3A8A',
          onContainer: '#E3F2FD',
        },
      },
      overdue: {
        colorName: 'overdue',
        lightColors: {
          main: '#E53935',
          container: '#FFCDD2',
          onContainer: '#B71C1C',
        },
        darkColors: {
          main: '#EF5350',
          container: '#7F1D1D',
          onContainer: '#FFEBEE',
        },
      },
      reviewing: {
        colorName: 'reviewing',
        lightColors: {
          main: '#FFB300',
          container: '#FFE082',
          onContainer: '#795548',
        },
        darkColors: {
          main: '#FFCA28',
          container: '#5D4037',
          onContainer: '#FFF3E0',
        },
      },
      done: {
        colorName: 'done',
        lightColors: {
          main: '#4CAF50',
          container: '#A5D6A7',
          onContainer: '#1B5E20',
        },
        darkColors: {
          main: '#66BB6A',
          container: '#2E7D32',
          onContainer: '#E8F5E9',
        },
      }
    },
    events: worklog.map((log) => ({
      id: log.id,
      title: `${log.title}`,
      start: log.start,
      end: log.end,
      calendarId: statusToCalendarId(log.status),
    })),
    selectedDate: dayjs().format("YYYY-MM-DD"),
    plugins: [eventsService],
    
  })
  

  useEffect(() => {
    eventsService.getAll()
  }, []);

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