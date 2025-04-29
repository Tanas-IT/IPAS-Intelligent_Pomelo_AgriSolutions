import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
    createViewDay,
    createViewMonthAgenda,
    createViewMonthGrid,
    createViewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { useEffect, useState } from 'react';
import style from './EmployeeWorklog.module.scss';
import './customScheduleX.scss';
import { useModal } from '@/hooks';
import { GetWorklog } from '@/payloads/worklog';
import { useNavigate } from 'react-router-dom';
import { worklogService } from '@/services';
import dayjs from 'dayjs';
import HeaderContentAppend from './HeaderContentAppend';
import WorklogFilter from '@/pages/HR/Worklog/WorklogCalendar/WorklogFilter/WorklogFilter';
import CustomTimeGridEvent from './CustomTimeGridEvent';
import { debounce } from 'lodash';
import { getUserId } from '@/utils';

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

function EmployeeWorklog() {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const navigate = useNavigate();
    const [worklog, setWorklog] = useState<Worklog[]>([]);

    const [filters, setFilters] = useState({
        workDateFrom: '',
        workDateTo: '',
        growthStage: [],
        status: [],
        employees: [],
        typePlan: [],
    });

    const updateFilters = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        fetchData();
    };

    const fetchData = async () => {
        try {
            const response = await worklogService.getWorklogByUserId(Number(getUserId()));
            
            if (response) {
                const worklogs = response.data.map((log: GetWorklog) => ({
                    id: log.workLogId.toString(),
                    title: log.workLogName,
                    start: dayjs(`${log.date.split('T')[0]} ${log.startTime}`).format('YYYY-MM-DD HH:mm'),
                    end: dayjs(`${log.date.split('T')[0]} ${log.endTime}`).format('YYYY-MM-DD HH:mm'),
                    status: log.status,
                }));
                setWorklog(worklogs);
            } else {
                console.error('Error fetching worklogs:', response);
            }
        } catch (error) {
            console.error('Error fetching worklogs:', error);
        }
    };

    const debouncedFetchData = debounce(fetchData, 300);
    
      useEffect(() => {
        debouncedFetchData();
        return () => debouncedFetchData.cancel();
      }, [filters]);

    const handleClear = () => {
        const resetFilters = {
          workDateFrom: '',
          workDateTo: '',
          growthStage: [],
          status: [],
          employees: [],
          typePlan: [],
        };
        setFilters(resetFilters);
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
        return mapping[cleanStatus] || 'notStarted';
    };

    useEffect(() => {
        if (eventsService) {
            const formattedEvents = worklog.map((log) => ({
                id: log.id,
                title: `${log.title}`,
                start: log.start,
                end: log.end,
                calendarId: statusToCalendarId(log.status),
            }));
            eventsService.set(formattedEvents);
        }
    }, [eventsService, worklog]);

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
            },
        },
        events: worklog.map((log) => ({
            id: log.id,
            title: `${log.title}`,
            start: log.start,
            end: log.end,
            calendarId: statusToCalendarId(log.status),
        })),
        selectedDate: dayjs().format('YYYY-MM-DD'),
        plugins: [eventsService],
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
                    headerContentRightAppend: () => (
                        <HeaderContentAppend filterContent={filterContent} />
                    ),
                }}
            />
        </div>
    );
}

export default EmployeeWorklog;