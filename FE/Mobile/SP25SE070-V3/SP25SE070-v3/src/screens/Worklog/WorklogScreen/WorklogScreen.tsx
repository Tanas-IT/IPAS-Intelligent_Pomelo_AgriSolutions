import { GetWorklog, User } from "@/types/worklog";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  Agenda,
  DateData,
  AgendaEntry,
  AgendaSchedule,
  TimelineEventProps,
  Calendar,
} from "react-native-calendars";
import { TimelineCalendar } from "../TimelineCalendar/TimelineCalendar";
import { styles } from "./WorklogScreen.styles";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import theme from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { SegmentedControl, TextCustom } from "@/components";

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

interface AgendaEvent {
  id: number;
  name: string;
  time: string;
  avatars: string[];
  status: string;
  date: string;
}

const formatWorkLogsToEvents = (workLogs: GetWorklog[]) => {
  const events: AgendaEvent[] = [];
  const timelineEvents: { [key: string]: CustomEventt[] } = {};

  const eventDates: string[] = []; // Lưu các ngày có sự kiện

  workLogs.forEach((log) => {
    const date = log.date.split("T")[0];
    const time = `${log.startTime.substring(0, 5)} - ${log.endTime.substring(
      0,
      5
    )}`;
    const avatars = log.users.map((user) => user.avatarURL);

    events.push({
      id: log.workLogId,
      name: log.workLogName,
      time,
      avatars,
      status: log.status,
      date,
    });
    if (!timelineEvents[date]) {
      timelineEvents[date] = [];
      eventDates.push(date);
    }
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
    workLogId: 2,
    workLogName: "Watering on _Plot A",
    workLogCode: "WL-11-638782972525775380",
    date: "2025-03-25T07:00:00",
    status: "Not Started",
    scheduleId: 11,
    startTime: "07:00:00",
    endTime: "08:00:00",
    planId: 11,
    planName: "kế hoạch chăm sóc cây",
    startDate: "2025-03-24T00:00:00",
    endDate: "2025-03-31T00:00:00",
    users: [
      {
        userId: 2,
        fullName: "Jane Smith",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 4,
        fullName: "The Tam",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 6,
        fullName: "Ai Giao",
        isReporter: true,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 10,
        fullName: "Ethan Wilson",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 2,
        fullName: "Jane Smith",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 8,
        fullName: "Charlie Davis",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
    ],
  },
  {
    workLogId: 3,
    workLogName: "Watering on _Plot A",
    workLogCode: "WL-11-638782972525999666",
    date: "2025-03-25T07:00:00",
    status: "Not Started",
    scheduleId: 11,
    startTime: "08:00:00",
    endTime: "09:00:00",
    planId: 11,
    planName: "kế hoạch chăm sóc cây",
    startDate: "2025-03-24T00:00:00",
    endDate: "2025-03-31T00:00:00",
    users: [
      {
        userId: 2,
        fullName: "Jane Smith",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 4,
        fullName: "The Tam",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 6,
        fullName: "Ai Giao",
        isReporter: true,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
      {
        userId: 5,
        fullName: "Phuoc Tan",
        isReporter: false,
        avatarURL:
          "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      },
    ],
  },
];

const MIN_CALENDAR_HEIGHT = 90;
const MAX_CALENDAR_HEIGHT = 350;

export default function WorklogScreen() {
  const [selectedView, setSelectedView] = useState("Agenda");
  const { events, timelineEvents, eventDates } = formatWorkLogsToEvents(data);
  const [selectedDate, setSelectedDate] = useState<string>(
    eventDates[0] || new Date().toISOString().split("T")[0]
  );
  const calendarHeight = useRef(
    new Animated.Value(MIN_CALENDAR_HEIGHT)
  ).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>();

  const getWeekRange = (selectedDate: string) => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0(CN) - 6(t7)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(
      date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    ); // bắt đầu từ t2

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateString = currentDate.toISOString().split("T")[0];
      weekDates.push(dateString);
    }
    return weekDates;
  };

  const weekDates = getWeekRange(selectedDate);

  const statusStyles = {
    notStarted: {
      backgroundColor: "#E1BEE7",
      textColor: "#880E4F",
      borderColor: "#880E4F",
    },
    inProgress: {
      backgroundColor: "#BBDEFB",
      textColor: "#0D47A1",
      borderColor: "#0D47A1",
    },
    overdue: {
      backgroundColor: "#FFCDD2",
      textColor: "#B71C1C",
      borderColor: "#B71C1C",
    },
    reviewing: {
      backgroundColor: "#FFECB3",
      textColor: "#FF6F00",
      borderColor: "#FF6F00",
    },
    done: {
      backgroundColor: "#C8E6C9",
      textColor: "#1B5E20",
      borderColor: "#1B5E20",
    },
  };

  const markedDates = eventDates.reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: theme.colors.primary,
      selected: date === selectedDate,
      selectedColor: theme.colors.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  const renderItem = ({ item }: { item: AgendaEvent }) => {
    console.log("item", item);

    const status = item.status.toLowerCase() as keyof typeof statusStyles;
    const style = statusStyles[status] || statusStyles.notStarted;
    const startTime = item.time.split(" - ")[0];
    const formattedStartTime = new Date(
      `1970-01-01T${startTime}:00`
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <View style={styles.eventRow}>
        <View style={styles.timeColumn}>
          <TextCustom style={styles.timeText}>{formattedStartTime}</TextCustom>
        </View>
        <TouchableOpacity
          style={[styles.eventDetails, { borderLeftColor: style.borderColor }]}
          onPress={() =>
            navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL, {
              worklogId: item.id.toString(),
            })
          }
        >
          <TextCustom style={[styles.eventName, { color: style.textColor }]}>
            {item.name}
          </TextCustom>
          <TextCustom style={styles.eventTime}>{item.time}</TextCustom>
          {item.avatars.length > 0 && (
            <FlatList
              data={item.avatars}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item: avatar }) => (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              )}
              contentContainerStyle={styles.avatarList}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderDayItem = ({ item: date }: { item: string }) => {
    const eventsForDate = events.filter((event) => event.date === date);
    return (
      <View style={{ marginBottom: 20 }}>
        <View style={styles.dateContainer}>
          <TextCustom style={[styles.eventTitle, { marginVertical: 10 }]}>
            {date.split("-")[2]}
          </TextCustom>
          <TextCustom style={styles.date}>
            {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
          </TextCustom>
        </View>
        {eventsForDate.length > 0 ? (
          <FlatList
            data={eventsForDate}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.date}-${index}`}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        ) : (
          <View style={styles.eventRow}>
            <View style={styles.timeColumn}>
              <TextCustom
                style={[styles.timeText, { color: theme.colors.background }]}
              >
                g
              </TextCustom>
            </View>
            <View style={[styles.eventDetails, { borderLeftColor: "white" }]}>
              <TextCustom style={[styles.eventName, { color: "#888" }]}>
                No Activities
              </TextCustom>
            </View>
          </View>
        )}
      </View>
    );
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: {
    nativeEvent: { state: number; translationY: number };
  }) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      const newHeight =
        translationY > 0 ? MAX_CALENDAR_HEIGHT : MIN_CALENDAR_HEIGHT;
      setIsExpanded(newHeight === MAX_CALENDAR_HEIGHT);

      Animated.spring(calendarHeight, {
        toValue: newHeight,
        useNativeDriver: false,
      }).start();

      translateY.setValue(0);
    }
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    // auto collapse khi chọn
    setIsExpanded(false);
    Animated.spring(calendarHeight, {
      toValue: MIN_CALENDAR_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextCustom style={styles.text}>Your Schedule</TextCustom>
      </View>
      <SegmentedControl
        options={["Agenda", "Calendar"]}
        selectedOption={selectedView}
        onOptionPress={setSelectedView}
      />
      {selectedView === "Agenda" ? (
        <View style={styles.agendaWrapper}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[styles.calendarContainer, { height: calendarHeight }]}
            >
              {/* collapse */}
              {!isExpanded && (
                <View style={styles.weekDatesWrapper}>
                  <View style={styles.weekDaysContainer}>
                    {weekDates.map((date) => (
                      <TextCustom key={date} style={styles.weekDay}>
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </TextCustom>
                    ))}
                  </View>
                  <View style={styles.weekDatesContainer}>
                    {weekDates.map((date) => (
                      <View key={date} style={styles.weekDateWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.weekDate,
                            date === selectedDate && styles.selectedWeekDate,
                          ]}
                          onPress={() => handleDayPress({ dateString: date })}
                        >
                          <TextCustom
                            style={[
                              styles.weekDateText,
                              date === selectedDate &&
                                styles.selectedWeekDateText,
                            ]}
                          >
                            {new Date(date).getDate()}
                          </TextCustom>

                          {eventDates.includes(date) && (
                            <View style={styles.eventDot} />
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={styles.dragHandle} />
                </View>
              )}
              {/* expand */}
              {isExpanded && (
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={{
                    selectedDayBackgroundColor: theme.colors.primary,
                    todayTextColor: theme.colors.primary,
                    arrowColor: theme.colors.primary,
                    textDayFontFamily: theme.fonts.regular,
                    textMonthFontFamily: theme.fonts.regular,
                    textDayHeaderFontFamily: theme.fonts.regular,
                  }}
                  current={selectedDate}
                  hideExtraDays={true}
                  style={{ marginTop: 5 }}
                />
              )}
            </Animated.View>
          </PanGestureHandler>

          <FlatList
            data={weekDates}
            renderItem={renderDayItem}
            keyExtractor={(date) => date}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      ) : (
        <TimelineCalendar
          eventsByDate={timelineEvents}
          markedDates={markedDates}
        />
      )}
    </View>
  );
}
