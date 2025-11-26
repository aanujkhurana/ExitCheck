
import React, {useState} from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function Onboarding({navigation}){
  const [address, setAddress] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [moveOut, setMoveOut] = useState('');
  const [agentEmail, setAgentEmail] = useState('');

  const create = async () => {
    const res = await axios.post(`${API_URL}/reports`, { address, moveIn, moveOut, agentEmail });
    navigation.replace('RoomsList', { reportId: res.data._id });
  };

  return (
    <View style={{padding:16}}>
      <Text>Property address</Text>
      <TextInput value={address} onChangeText={setAddress} style={{borderWidth:1,marginBottom:8}} />
      <Text>Move-in date</Text>
      <TextInput value={moveIn} onChangeText={setMoveIn} style={{borderWidth:1,marginBottom:8}} placeholder="YYYY-MM-DD" />
      <Text>Move-out date</Text>
      <TextInput value={moveOut} onChangeText={setMoveOut} style={{borderWidth:1,marginBottom:8}} placeholder="YYYY-MM-DD" />
      <Text>Agent email</Text>
      <TextInput value={agentEmail} onChangeText={setAgentEmail} style={{borderWidth:1,marginBottom:8}} />
      <Button title="Create report" onPress={create} />
    </View>
  );
}
