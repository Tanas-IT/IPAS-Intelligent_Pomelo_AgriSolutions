import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const OwnerHomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.header}>Trang trại Bưởi - 28/03/2025</Title>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>1,500</Title>
            <Paragraph>Số lượng cây</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>2,000kg</Title>
            <Paragraph>Sản lượng tháng này</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>5</Title>
            <Paragraph>Công việc đang diễn ra</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>Báo cáo gần nhất</Title>
      <Card style={styles.reportCard}>
        <Card.Content>
          <Paragraph>21/03/2025 - Kiểm tra sâu</Paragraph>
          <Paragraph>5 cây bị ảnh hưởng</Paragraph>
          <Button mode="outlined" onPress={() => {}} style={styles.button}>
            Xem tất cả báo cáo
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 20, color: '#388E3C', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  card: { width: '30%', marginVertical: 8, backgroundColor: '#C8E6C9', alignItems: 'center' },
  cardTitle: { color: '#388E3C', fontSize: 24 },
  sectionTitle: { marginTop: 16, fontSize: 18, color: '#388E3C' },
  reportCard: { marginTop: 8, backgroundColor: '#FFECB3' },
  button: { marginTop: 8, borderColor: '#FFA726' },
});

export default OwnerHomeScreen;