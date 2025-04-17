import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { TextCustom } from '@/components';
import dayjs from 'dayjs';
import theme from '@/theme';
import { TaskFeedback } from '@/types';

interface FeedbackSectionProps {
  feedbacks: TaskFeedback[];
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedbacks }) => {
  const renderFeedbackItem = ({ item }: { item: TaskFeedback }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <View style={styles.avatarPlaceholder}>
          {item.avatarURL ? (
            <Image source={{ uri: item.avatarURL }} style={styles.avatar} />
          ) : (
            <TextCustom style={styles.avatarText}>
              {item.fullName.charAt(0).toUpperCase()}
            </TextCustom>
          )}
        </View>
        <View style={styles.feedbackInfo}>
          <TextCustom style={styles.feedbackName}>{item.fullName}</TextCustom>
          <TextCustom style={styles.feedbackDate}>
            {dayjs(item.createDate).format('DD/MM/YYYY HH:mm')}
          </TextCustom>
        </View>
      </View>
      
      <View style={styles.feedbackContentContainer}>
        <TextCustom style={styles.feedbackContent}>{item.content}</TextCustom>
        {item.reason && (
          <View style={styles.reasonContainer}>
            <TextCustom style={styles.reasonLabel}>Reason:</TextCustom>
            <TextCustom style={styles.reasonText}>{item.reason}</TextCustom>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {feedbacks.length > 0 ? (
        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.taskFeedbackId.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <TextCustom style={styles.emptyText}>No feedback available</TextCustom>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  feedbackItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feedbackInfo: {
    flex: 1,
  },
  feedbackName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  feedbackContentContainer: {
    paddingLeft: 52, // Match avatar width + margin
  },
  feedbackContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reasonContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#EF4444',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingTop: 4,
  },
});

export default FeedbackSection;