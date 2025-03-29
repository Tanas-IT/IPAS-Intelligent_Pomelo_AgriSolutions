import { GetWorklog, User } from '@/types/worklog';
import { SegmentedControl } from 'components/SegmentedControl.tsx';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Agenda, DateData, AgendaEntry, AgendaSchedule, TimelineEventProps } from 'react-native-calendars';
import { TimelineCalendar } from './TimelineCalendar';

interface CustomEventt {
  id?: string;
    start: string;
    end: string;
    title: string;
    summary?: string;
    color?: string;
    status?: string;
    avatars?: string[];
}


const formatWorkLogsToEvents = (workLogs: GetWorklog[]) => {
  const events: Record<string, { name: string; time: string; avatars: string[]; status: string }[]> = {};
  // const timelineEvents: { [key: string]: TimelineEventProps[] } = {};
  const timelineEvents: { [key: string]: CustomEventt[] } = {};

  const eventDates: string[] = []; // Lưu các ngày có sự kiện

  workLogs.forEach((log) => {
    const date = log.date.split('T')[0];
    const time = `${log.startTime.substring(0, 5)} - ${log.endTime.substring(0, 5)}`;
    const avatars = log.users.map((user) => user.avatarURL);

    if (!events[date]) {
      events[date] = [];
      timelineEvents[date] = [];
      eventDates.push(date);
    }

    events[date].push({
      name: log.workLogName,
      time,
      avatars,
      status: log.status,
    });

    timelineEvents[date].push({
      id: log.workLogId.toString(),
      start: `${date} ${log.startTime.substring(0, 5)}:00`,
      end: `${date} ${log.endTime.substring(0, 5)}:00`,
      title: log.workLogName,
      // color: '#4ca784',
      status: log.status,
      avatars: avatars,
    });
  });

  return { events, timelineEvents, eventDates };
};
const data: GetWorklog[] = [
  {
    "workLogId": 2,
    "workLogName": "Watering on _Plot A",
    "workLogCode": "WL-11-638782972525775380",
    "date": "2025-03-25T07:00:00",
    "status": "Not Started",
    "scheduleId": 11,
    "startTime": "07:00:00",
    "endTime": "08:00:00",
    "planId": 11,
    "planName": "kế hoạch chăm sóc cây",
    "startDate": "2025-03-24T00:00:00",
    "endDate": "2025-03-31T00:00:00",
    "users": [
      {
        "userId": 2,
        "fullName": "Jane Smith",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 4,
        "fullName": "The Tam",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 6,
        "fullName": "Ai Giao",
        "isReporter": true,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 10,
        "fullName": "Ethan Wilson",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 2,
        "fullName": "Jane Smith",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 8,
        "fullName": "Charlie Davis",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      }
    ]
  },
  {
    "workLogId": 3,
    "workLogName": "Watering on _Plot A",
    "workLogCode": "WL-11-638782972525999666",
    "date": "2025-03-25T07:00:00",
    "status": "Not Started",
    "scheduleId": 11,
    "startTime": "08:00:00",
    "endTime": "09:00:00",
    "planId": 11,
    "planName": "kế hoạch chăm sóc cây",
    "startDate": "2025-03-24T00:00:00",
    "endDate": "2025-03-31T00:00:00",
    "users": [
      {
        "userId": 2,
        "fullName": "Jane Smith",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 4,
        "fullName": "The Tam",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 6,
        "fullName": "Ai Giao",
        "isReporter": true,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      },
      {
        "userId": 5,
        "fullName": "Phuoc Tan",
        "isReporter": false,
        "avatarURL": "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg"
      }
    ]
  }
]

export default function WorklogScreen() {
  const [selectedView, setSelectedView] = useState('Agenda');
  const { events: initialEvents, timelineEvents, eventDates } = formatWorkLogsToEvents(data);
  const [events, setEvents] = useState(initialEvents);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      const today = new Date();
      loadItemsForMonth({
        year: today.getFullYear(),
        month: today.getMonth() + 1
      });
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const statusStyles = {
    notStarted: {
      backgroundColor: '#E1BEE7',
      textColor: '#880E4F',
      borderColor: '#880E4F'
    },
    inProgress: {
      backgroundColor: '#BBDEFB',
      textColor: '#0D47A1',
      borderColor: '#0D47A1'
    },
    overdue: {
      backgroundColor: '#FFCDD2',
      textColor: '#B71C1C',
      borderColor: '#B71C1C'
    },
    reviewing: {
      backgroundColor: '#FFECB3',
      textColor: '#FF6F00',
      borderColor: '#FF6F00'
    },
    done: {
      backgroundColor: '#C8E6C9',
      textColor: '#1B5E20',
      borderColor: '#1B5E20'
    }
  };

  const markedDates = eventDates.reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: '#064944' };
    return acc;
  }, {} as Record<string, any>);

  const renderItem = (item: any) => {
    const status = item.status.toLowerCase() as keyof typeof statusStyles;
    const style = statusStyles[status] || statusStyles.notStarted;

    return (
      <View style={[
        styles.eventCard,
        {
          backgroundColor: 'white',
          borderLeftColor: style.borderColor,
        }
      ]}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: style.textColor }]}>
            {item.name}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: style.textColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.eventTime}>
          {item.time}
        </Text>
        {item.avatars.length > 0 && (
          <FlatList
            data={item.avatars}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: avatar }) => (
              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />
            )}
            contentContainerStyle={styles.avatarList}
          />
        )}
      </View>
    );
  };

  const loadItemsForMonth = (month: { year: number; month: number }) => {
    const newEvents = { ...events };
    const startDate = new Date(month.year, month.month - 1, 1);
    const endDate = new Date(month.year, month.month, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!newEvents[dateStr]) {
        newEvents[dateStr] = []; // [] cho ngày k event
      }
    }

    setEvents(newEvents);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Your Schedule</Text>
      </View>
      <SegmentedControl
        options={['Agenda', 'Calendar']}
        selectedOption={selectedView}
        onOptionPress={setSelectedView}
      />
      {selectedView === 'Agenda' ? (
        <View style={styles.agendaWrapper}>
          <Agenda
            items={events}
            markedDates={markedDates}
            renderItem={renderItem}
            renderEmptyDate={() => {
              return (
                <View style={styles.emptyDate}>
                  <Text>No Activities</Text>
                </View>
              );
            }}
            selected={new Date().toISOString().split("T")[0]}
            theme={{
              calendarBackground: 'white',
              agendaKnobColor: '#064944',
              selectedDayBackgroundColor: '#064944',
              selectedDayTextColor: 'white',
              todayTextColor: '#064944',
              dotColor: '#064944',
              backgroundColor: '#fffcee',
              agendaBackgroundColor: '#fffcee',
              agendaTodayColor: '#064944',
              agenda: {
                list: {
                  backgroundColor: '#fffcee',
                }
              }
            }}
            contentContainerStyle={{
              backgroundColor: '#fffcee',
            }}
            style={{
              borderRadius: 10,
              backgroundColor: '#fffcee',
            }}
            loadItemsForMonth={loadItemsForMonth}

          />
        </View>
      ) : (
        <TimelineCalendar eventsByDate={timelineEvents} markedDates={markedDates} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#064944',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#fffcee'
  },
  agenda: {
    borderRadius: 10,
    backgroundColor: '#fffcee',
  },
  eventCard: {
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    marginTop: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  eventTime: {
    fontSize: 13,
    marginTop: 5,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  avatarList: {
    marginTop: 10,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyDate: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 10,
    marginTop: 20,
  },
  emptyText: {
    color: '#888',
  },
  agendaWrapper: {
    flex: 1,
    backgroundColor: '#fffcee',
    borderRadius: 10,
    overflow: 'hidden',
  },
});