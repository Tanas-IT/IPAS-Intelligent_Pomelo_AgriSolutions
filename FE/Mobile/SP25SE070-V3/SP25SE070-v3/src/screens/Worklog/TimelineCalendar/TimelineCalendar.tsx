import { ROUTE_NAMES } from "@/constants/RouteNames";
import { RootStackNavigationProp } from "@/constants/Types";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import {
  ExpandableCalendar,
  TimelineList as BaseTimelineList,
  CalendarProvider,
  TimelineEventProps,
  TimelineProps,
  TimelineListProps,
} from "react-native-calendars";
import { styles } from "./TimelineCalendar.styles";
import theme from "@/theme";
import { TextCustom } from "@/components";

interface TimelineCalendarProps {
  eventsByDate: { [date: string]: TimelineEventProps[] };
  markedDates: { [date: string]: any };
}

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

interface TimelineListSafeProps
  extends Omit<TimelineListProps, "timelineProps"> {
  timelineKey?: string;
  timelineProps: Omit<TimelineProps, "key">;
}

const TimelineListSafe: React.FC<TimelineListSafeProps> = (props) => {
  const { timelineKey, timelineProps, ...rest } = props;

  return (
    <BaseTimelineList
      key={timelineKey}
      {...rest}
      timelineProps={timelineProps}
    />
  );
};

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  eventsByDate,
  markedDates,
}) => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timelineEvents, setTimelineEvents] = useState(eventsByDate);
  const navigation = useNavigation<RootStackNavigationProp>();

  const onDateChanged = (date: string) => {
    setCurrentDate(date);
  };

  const renderEvent = (
    event: TimelineEventProps & { status?: string; avatars?: string[] }
  ) => {
    const status = (event.status || "notStarted")
      .toLowerCase()
      .replace(" ", "") as keyof typeof statusStyles;
    const style = statusStyles[status] || statusStyles.notStarted;

    return (
      <TouchableOpacity
        onPress={() => {
          if (event.id && event.id !== "draft") {
            navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL, {
              worklogId: event.id,
            });
          }
        }}
        style={[
          styles.eventCard,
          {
            backgroundColor: style.backgroundColor,
            borderLeftColor: style.borderColor,
            width: "100%",
            height: "100%",
          },
        ]}
      >
        <View style={styles.eventHeader}>
          <TextCustom style={[styles.eventTitle, { color: style.textColor }]}>
            {event.title}
          </TextCustom>
          <View style={styles.statusBadge}>
            <TextCustom style={[styles.statusText, { color: style.textColor }]}>
              {event.status}
            </TextCustom>
          </View>
        </View>
        <TextCustom style={styles.eventTime}>
          {event.start.split(" ")[1].substring(0, 5)} -{" "}
          {event.end.split(" ")[1].substring(0, 5)}
        </TextCustom>
        {event.avatars && event.avatars.length > 0 && (
          <FlatList
            data={event.avatars}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: avatar }) => (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            )}
            contentContainerStyle={styles.avatarList}
          />
        )}
      </TouchableOpacity>
    );
  };

  const timelineProps: Omit<TimelineProps, "key"> = {
    events: timelineEvents[currentDate] || [],
    format24h: true,
    // onBackgroundLongPress: createNewEvent,
    // onBackgroundLongPressOut: approveNewEvent,
    unavailableHours: [
      { start: 0, end: 6 },
      { start: 22, end: 24 },
    ],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24,
    renderEvent,
  };

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        showTodayButton
        disabledOpacity={0.6}
      >
        <ExpandableCalendar
          firstDay={1}
          markedDates={markedDates}
          theme={{
            calendarBackground: "white",
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: "white",
            todayTextColor: theme.colors.primary,
            dotColor: theme.colors.primary,
          }}
        />
        <TimelineListSafe
          timelineKey={`timeline-${currentDate}`}
          events={timelineEvents}
          showNowIndicator
          scrollToFirst
          initialTime={{ hour: 9, minutes: 0 }}
          timelineProps={timelineProps}
        />
      </CalendarProvider>
    </View>
  );
};
