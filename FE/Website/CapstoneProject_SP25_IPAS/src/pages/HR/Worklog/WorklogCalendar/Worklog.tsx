// import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
// import {
//   createViewDay,
//   createViewMonthAgenda,
//   createViewMonthGrid,
//   createViewWeek,
//   createCalendar
// } from '@schedule-x/calendar'
// import { createEventsServicePlugin } from '@schedule-x/events-service'
// import '@schedule-x/theme-default/dist/index.css'
// import { useEffect, useState } from 'react'
// import { createEventModalPlugin } from '@schedule-x/event-modal'
// import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
// import CustomTimeGridEvent from './CustomTimeGridEvent'
// import CustomDateGridEvent from './CustomDateGridEvent'
// import HeaderContentAppend from './HeaderContentAppend'
// import style from "./Worklog.module.scss"
// import "./customScheduleX.scss"
// import WorklogFilter from './WorklogFilter/WorklogFilter'
// import { useModal } from '@/hooks'
// import { CreateWorklogRequest, GetWorklog } from '@/payloads/worklog'
// import WorklogModal from './WorklogModal/WorklogModal'
// import { useNavigate } from 'react-router-dom'
// import { worklogService } from '@/services'
// import dayjs from 'dayjs'

// type Worklog = {
//   id: string;
//   title: string;
//   start: string;
//   end: string;
//   status: string;
// };

// type CalendarEvent = {
//   id: string | number;
//   title: string;
//   start: string;
//   end: string;
//   calendarId: string;
// };


// function Worklog() {
//   const eventsService = useState(() => createEventsServicePlugin())[0];
//   const navigate = useNavigate();
//   const [worklog, setWorklog] = useState<Worklog[]>([]);
//   const eventModal = createEventModalPlugin();

//   const [filters, setFilters] = useState({
//     workDateFrom: "",
//     workDateTo: "",
//     growthStage: [],
//     status: [],
//     employees: [],
//     plan: [],
//     processTypes: [],
//   });
//   const addModal = useModal<CreateWorklogRequest>();

//   const updateFilters = (key: string, value: any) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleApply = () => {
//     // fetchData();
//   };

//   const fetchData = async () => {
//     try {
//       const response = await worklogService.getWorklog();
//       console.log(response);
      
//       if (response) {
//         const worklogs = response.map((log: GetWorklog) => ({
//           id: log.workLogId.toString(),
//           title: log.workLogName,
//           start: dayjs(`${log.date.split('T')[0]} ${log.startTime}`).format('YYYY-MM-DD HH:mm'),
//           end: dayjs(`${log.date.split('T')[0]} ${log.endTime}`).format('YYYY-MM-DD HH:mm'),
//           status: log.status,
//         }));
//         setWorklog(worklogs);
//       } else {
//         console.error('errorrr', response);
//       }
//     } catch (error) {
//       console.error('errorrr:', error);
//     }
//   };

//   console.log('worklogsssssssss', worklog);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleClear = () => {
//     setFilters({
//       workDateFrom: "",
//       workDateTo: "",
//       growthStage: [],
//       status: [],
//       employees: [],
//       plan: [],
//       processTypes: [],
//     });
//   };

//   const statusToCalendarId = (status: string): string => {
//     const cleanStatus = status.trim().toLowerCase(); 
//     const mapping: Record<string, string> = {
//       "not started": "notStarted",
//       "in progress": "inProgress",
//       "overdue": "overdue",
//       "reviewing": "reviewing",
//       "done": "done",
//     };
//     const result = mapping[cleanStatus] || "notStarted";
//     return result;
//   };

//   useEffect(() => {
//     if (eventsService) {
//       const formattedEvents = worklog.map((log) => {
//         const calendarId = statusToCalendarId(log.status);
//         return {
//           id: log.id,
//           title: `${log.title}`,
//           start: log.start,
//           end: log.end,
//           calendarId, 
//         };
//       });
//       const groupedEvents = groupEventsByTime(formattedEvents);
//       eventsService.set(formattedEvents);
//     }
//   }, [eventsService, worklog]);

//   const groupEventsByTime = (events: CalendarEvent[]): CalendarEvent[][] => {
//     const grouped: Record<string, CalendarEvent[]> = {};
  
//     events.forEach((event) => {
//       if (!grouped[event.start]) {
//         grouped[event.start] = [];
//       }
//       grouped[event.start].push(event);
//     });
  
//     return Object.values(grouped);
//   };

//   const calendar = useCalendarApp({
//     views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
//     events: worklog.map((log) => ({
//       id: log.id,
//       title: `${log.title}`,
//       start: log.start,
//       end: log.end,
//       calendarId: statusToCalendarId(log.status),
//     })),
//     selectedDate: dayjs().format("YYYY-MM-DD"),
//     plugins: [eventsService, eventModal],
    
//   })
  

//   useEffect(() => {
//     eventsService.getAll()
//   }, []);

//   const handleAdd = () => {

//   }

//   const filterContent = (
//     <WorklogFilter
//       filters={filters}
//       updateFilters={updateFilters}
//       onClear={handleClear}
//       onApply={handleApply}
//     />
//   );

//   return (
//     <div>
//       <ScheduleXCalendar
//         calendarApp={calendar}
//         customComponents={{
//           timeGridEvent: CustomTimeGridEvent,
//           // dateGridEvent: CustomDateGridEvent,
//           monthGridEvent: CustomDateGridEvent,
//           headerContentRightAppend: () => (
//             <HeaderContentAppend filterContent={filterContent} addModal={addModal} />
//           )
//         }}
//       />
//       <WorklogModal
//         isOpen={addModal.modalState.visible}
//         onClose={addModal.hideModal}
//         onSave={handleAdd}
//       />
//     </div>
//   )
// }

// export default Worklog
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  createCalendar,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useState } from 'react';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import CustomTimeGridEvent from './CustomTimeGridEvent';
import CustomDateGridEvent from './CustomDateGridEvent';
import HeaderContentAppend from './HeaderContentAppend';
import style from './Worklog.module.scss';
import './customScheduleX.scss';
import WorklogFilter from './WorklogFilter/WorklogFilter';
import { useModal } from '@/hooks';
import { CreateWorklogRequest, GetWorklog } from '@/payloads/worklog';
import WorklogModal from './WorklogModal/WorklogModal';
import { useNavigate } from 'react-router-dom';
import { worklogService } from '@/services';
import dayjs from 'dayjs';

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
  const eventModal = createEventModalPlugin();

  const [filters, setFilters] = useState({
    workDateFrom: '',
    workDateTo: '',
    growthStage: [],
    status: [],
    employees: [],
    plan: [],
    processTypes: [],
  });

  const addModal = useModal<CreateWorklogRequest>();

  // Fetch dữ liệu khi filters thay đổi
  const fetchData = async () => {
    try {
      const response = await worklogService.getWorklog();
      if (response) {
        const worklogs = response.map((log: GetWorklog) => ({
          id: log.workLogId.toString(),
          title: log.workLogName,
          start: dayjs(`${log.date.split('T')[0]} ${log.startTime}`).format('YYYY-MM-DD HH:mm'),
          end: dayjs(`${log.date.split('T')[0]} ${log.endTime}`).format('YYYY-MM-DD HH:mm'),
          status: log.status,
        }));
        setWorklog(worklogs);
      }
    } catch (error) {
      console.error('Error fetching worklogs:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleClear = () => {
    setFilters({
      workDateFrom: '',
      workDateTo: '',
      growthStage: [],
      status: [],
      employees: [],
      plan: [],
      processTypes: [],
    });
  };

  const handleApply = () => {
    fetchData(); // Gọi lại API với filters mới
  };

  const statusToCalendarId = (status: string): string => {
    const cleanStatus = status.trim().toLowerCase();
    const mapping: Record<string, string> = {
      'not started': 'notStarted',
      'in progress': 'inProgress',
      overdue: 'overdue',
      reviewing: 'reviewing',
      done: 'done',
    };
    const result = mapping[cleanStatus] || 'notStarted';
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
      eventsService.set(formattedEvents);
    }
  }, [eventsService, worklog]);

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: worklog.map((log) => ({
      id: log.id,
      title: `${log.title}`,
      start: log.start,
      end: log.end,
      calendarId: statusToCalendarId(log.status),
    })),
    selectedDate: dayjs().format('YYYY-MM-DD'),
    plugins: [eventsService, eventModal],
  });

  const filterContent = (
    <WorklogFilter
      filters={filters}
      updateFilters={setFilters}
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
          monthGridEvent: CustomDateGridEvent,
          headerContentRightAppend: () => (
            <HeaderContentAppend filterContent={filterContent} addModal={addModal} />
          ),
        }}
      />
      <WorklogModal
        isOpen={addModal.modalState.visible}
        onClose={addModal.hideModal}
        onSave={() => {}}
      />
    </div>
  );
}

export default Worklog;