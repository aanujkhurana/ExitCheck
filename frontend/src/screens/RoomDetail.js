
import React, {useState} from 'react';
import { View, TextInput, Button, Text, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config';

export default function RoomDetail({route, navigation}){
  const { reportId, room } = route.params;
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('clean');
  const [photos, setPhotos] = useState([]);

  const pick = async () => {
    const p = await ImagePicker.launchCameraAsync({ quality:0.5, base64:false });
    if(!p.cancelled){
      // upload to backend
      const form = new FormData();
      form.append('photo',{ uri: p.uri, name: 'photo.jpg', type: 'image/jpeg' });
      const res = await fetch(`${API_URL}/reports/${reportId}/photos`, { method:'POST', body: form });
      const json = await res.json();
      setPhotos([...photos, json.url]);
    }
  };

  const save = async () => {
    await axios.post(`${API_URL}/reports/${reportId}/rooms`, { name: room.name || room, notes, condition, photos });
    navigation.goBack();
  };

  return (
    <ScrollView style={{padding:16}}>
      <Text style={{fontWeight:'bold',fontSize:18}}>{room.name || room}</Text>
      <Text>Condition</Text>
      <TextInput value={condition} onChangeText={setCondition} style={{borderWidth:1,marginBottom:8}} />
      <Text>Notes</Text>
      <TextInput value={notes} onChangeText={setNotes} style={{borderWidth:1,marginBottom:8}} multiline />
      <Button title="Take photo" onPress={pick} />
      {photos.map((uri,i)=> <Image key={i} source={{uri}} style={{height:150,marginTop:8}} />)}
      <Button title="Save room" onPress={save} />
    </ScrollView>
  );
}
