import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Onboarding({ navigation }) {
  const [address, setAddress] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [moveOut, setMoveOut] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!address.trim()) return 'Property address is required';
    if (!moveIn.trim()) return 'Move-in date is required';
    if (!DATE_RE.test(moveIn.trim())) return 'Move-in date must be YYYY-MM-DD';
    if (!moveOut.trim()) return 'Move-out date is required';
    if (!DATE_RE.test(moveOut.trim())) return 'Move-out date must be YYYY-MM-DD';
    if (!agentEmail.trim()) return 'Agent email is required';
    if (!EMAIL_RE.test(agentEmail.trim())) return 'Invalid email format';
    return null;
  };

  const create = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/reports`, { address, moveIn, moveOut, agentEmail });
      navigation.replace('RoomsList', { reportId: res.data._id });
    } catch (e) {
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Failed to create report. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Property address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        style={{ borderWidth: 1, marginBottom: 8 }}
      />
      <Text>Move-in date</Text>
      <TextInput
        value={moveIn}
        onChangeText={setMoveIn}
        style={{ borderWidth: 1, marginBottom: 8 }}
        placeholder="YYYY-MM-DD"
      />
      <Text>Move-out date</Text>
      <TextInput
        value={moveOut}
        onChangeText={setMoveOut}
        style={{ borderWidth: 1, marginBottom: 8 }}
        placeholder="YYYY-MM-DD"
      />
      <Text>Agent email</Text>
      <TextInput
        value={agentEmail}
        onChangeText={setAgentEmail}
        style={{ borderWidth: 1, marginBottom: 8 }}
      />
      <Button
        title={loading ? 'Creating...' : 'Create report'}
        onPress={create}
        disabled={loading}
      />
    </View>
  );
}
