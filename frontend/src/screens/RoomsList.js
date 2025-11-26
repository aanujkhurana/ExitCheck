
import React, {useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

const defaultRooms = ['Kitchen','Living room','Bedroom 1','Bedroom 2','Bathroom','Balcony'];

export default function RoomsList({route, navigation}){
  const { reportId } = route.params;
  const [rooms, setRooms] = useState([]);

  useEffect(()=>{
    setRooms(defaultRooms.map(name=>({ name, id: name })));
  },[]);

  const goRoom = (room) => navigation.navigate('RoomDetail', { reportId, room });

  return (
    <View style={{padding:16}}>
      <Button title="Add custom room" onPress={()=>{/* quick hack: implement later */}} />
      <FlatList
        data={rooms}
        keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=>goRoom(item)}>
            <View style={{padding:12,borderBottomWidth:1}}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button title="Finish - View Summary" onPress={()=>navigation.navigate('Summary',{reportId})} />
    </View>
  );
}
