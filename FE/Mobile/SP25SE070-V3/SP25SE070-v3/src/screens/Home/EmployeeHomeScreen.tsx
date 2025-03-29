import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmployeeHomeScreen: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = React.useState('Farm 1');

  const tasks = [
    { id: '1', title: 'Watering Plot A', time: '07:00 - 08:00' },
    { id: '2', title: 'Check Pest Plot B', time: '09:00 - 10:00' },
  ];

  const plants = [
    { id: '1', name: 'Tree #101', status: 'Needs Check' },
    { id: '2', name: 'Tree #102', status: 'Healthy' },
  ];

  const pestHistory = [
    { id: '1', date: '25/03/2025', result: '5 trees affected' },
  ];

  const reports = [
    { id: '1', date: '21/03/2025', content: 'Pest check - 5 trees affected' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Xin chào, Jane Smith</Title>
        <Picker
          selectedValue={selectedFarm}
          onValueChange={(itemValue) => setSelectedFarm(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Farm 1" value="Farm 1" />
          <Picker.Item label="Farm 2" value="Farm 2" />
        </Picker>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Công việc hôm nay</Title>
          <Paragraph>{tasks.length} công việc cần hoàn thành</Paragraph>
          <Button mode="contained" onPress={() => {}} style={styles.button}>
            Xem chi tiết
          </Button>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Cây cần kiểm tra</Title>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.smallCard}>
            <Card.Content>
              <Text>{item.name}</Text>
              <Text>{item.status}</Text>
            </Card.Content>
          </Card>
        )}
        numColumns={2}
      />

      <Title style={styles.sectionTitle}>Lịch sử nhận diện sâu bệnh</Title>
      <FlatList
        data={pestHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.smallCard}>
            <Card.Content>
              <Text>{item.date}</Text>
              <Text>{item.result}</Text>
            </Card.Content>
          </Card>
        )}
      />

      <Title style={styles.sectionTitle}>Báo cáo gần đây</Title>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.smallCard}>
            <Card.Content>
              <Text>{item.date}</Text>
              <Text>{item.content}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#388E3C' },
  picker: { width: 150, color: '#388E3C' },
  card: { marginVertical: 8, backgroundColor: '#FFECB3' },
  smallCard: { flex: 1, margin: 4, backgroundColor: '#C8E6C9' },
  sectionTitle: { marginTop: 16, fontSize: 18, color: '#388E3C' },
  button: { marginTop: 8, backgroundColor: '#FFA726' },
});

export default EmployeeHomeScreen;