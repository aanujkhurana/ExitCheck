import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        ExitCheck
      </Text>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 }}
      />
      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 16, paddingHorizontal: 8 }}
      />
      <Button title={loading ? 'Logging in...' : 'Log in'} onPress={submit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      <View style={{ marginTop: 16 }}>
        <Button title="Create account" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
}
