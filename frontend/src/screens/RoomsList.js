import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';

const defaultRooms = ['Kitchen', 'Living room', 'Bedroom 1', 'Bedroom 2', 'Bathroom', 'Balcony'];

export default function RoomsList({ route, navigation }) {
  const { reportId } = route.params;
  const [rooms, setRooms] = useState([]);
  const [customRoomName, setCustomRoomName] = useState('');

  useEffect(() => {
    setRooms(defaultRooms.map((name) => ({ name, id: name })));
  }, []);

  const goRoom = (room) => navigation.navigate('RoomDetail', { reportId, room });

  const addCustomRoom = () => {
    const name = customRoomName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }
    if (rooms.find((r) => r.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Error', 'Room already exists');
      return;
    }
    setRooms([...rooms, { name, id: `custom-${Date.now()}` }]);
    setCustomRoomName('');
  };

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TextInput
          value={customRoomName}
          onChangeText={setCustomRoomName}
          placeholder="Enter custom room name"
          style={{ borderWidth: 1, flex: 1, marginRight: 8, paddingHorizontal: 8 }}
        />
        <Button title="Add custom room" onPress={addCustomRoom} />
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>
            No rooms yet. Add a room above.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => goRoom(item)}>
            <View style={{ padding: 12, borderBottomWidth: 1 }}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Finish - View Summary"
        onPress={() => navigation.navigate('Summary', { reportId })}
      />
    </View>
  );
}
