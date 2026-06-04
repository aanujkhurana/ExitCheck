import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function PinScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pin.trim()) {
      Alert.alert('Error', 'Please enter the PIN');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/pin`, { pin });
      navigation.replace('Onboarding');
    } catch (e) {
      Alert.alert('Access Denied', e.response?.data?.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        ExitCheck
      </Text>
      <Text style={{ marginBottom: 8 }}>Enter app PIN</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 }}
        placeholder="PIN"
      />
      <Button title={loading ? 'Verifying...' : 'Unlock'} onPress={submit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
    </View>
  );
}
