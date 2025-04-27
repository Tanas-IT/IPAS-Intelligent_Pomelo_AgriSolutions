import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  createCalendar,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useMemo, useState } from 'react';
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
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

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
  const addModal = useModal<CreateWorklogRequest>();

  const [filters, setFilters] = useState({
    workDateFrom: "",
    workDateTo: "",
    growthStage: [],
    status: [],
    employees: [],
    typePlan: [],
  });

  const fetchData = async () => {
    try {

      const response = await worklogService.getWorklog(filters);
      if (response) {
        const worklogs = response.map((log: GetWorklog) => ({
          id: log.workLogId.toString(),
          title: log.workLogName,
          start: dayjs(`${log.date.split("T")[0]} ${log.startTime}`).format("YYYY-MM-DD HH:mm"),
          end: dayjs(`${log.date.split("T")[0]} ${log.endTime}`).format("YYYY-MM-DD HH:mm"),
          status: log.status,
        }));
        setWorklog(worklogs);
      }
    } catch (error) {
      console.error("Error fetching worklogs:", error);
    }
  };

  const debouncedFetchData = debounce(fetchData, 300);

  useEffect(() => {
    debouncedFetchData();
    return () => debouncedFetchData.cancel();
  }, [filters]);

  const handleClear = () => {
    const resetFilters = {
      workDateFrom: "",
      workDateTo: "",
      growthStage: [],
      status: [],
      employees: [],
      typePlan: [],
    };
    setFilters(resetFilters);
  };

  const handleApply = () => {
    // fetchData();
  };

  const statusToCalendarId = (status: string): string => {
    const cleanStatus = status.trim().toLowerCase();
    const mapping: Record<string, string> = {
      "not started": "notStarted",
      "in progress": "inProgress",
      overdue: "overdue",
      reviewing: "reviewing",
      done: "done",
    };
    const result = mapping[cleanStatus] || "notStarted";
    return result;
  };

  const formattedEvents = useMemo(() => {
    return worklog.map((log) => {
      const calendarId = statusToCalendarId(log.status);
      return {
        id: log.id,
        title: `${log.title}`,
        start: log.start,
        end: log.end,
        calendarId,
      };
    });
  }, [worklog]);

  const hadleAddWorklog = async (worklog: CreateWorklogRequest) => {
    const res = await worklogService.addWorklog(worklog);
    if (res.statusCode === 200) {
      toast.success(res.message);
      addModal.hideModal();
      fetchData();
    } else {
      toast.error(res.message);
    }
  }
  

  useEffect(() => {
    if (eventsService && formattedEvents.length > 0) {
      eventsService.set(formattedEvents);
    }
  }, [eventsService, formattedEvents]);

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: formattedEvents,
    selectedDate: dayjs().format("YYYY-MM-DD"),
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
        onSave={hadleAddWorklog}
      />
    </div>
  );
}

export default Worklog;
