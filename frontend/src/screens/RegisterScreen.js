import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password required');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
    } catch (e) {
      Alert.alert('Registration failed', e.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Create Account
      </Text>
      <Text>Name (optional)</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 }}
      />
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
      <Button title={loading ? 'Creating...' : 'Create account'} onPress={submit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      <View style={{ marginTop: 16 }}>
        <Button title="Already have an account? Log in" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}
