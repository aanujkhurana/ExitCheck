import React, { useState } from 'react';
import { TextInput, Button, Text, Image, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config';

export default function RoomDetail({ route, navigation }) {
  const { reportId, room } = route.params;
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('clean');
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const p = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: false });
    if (!p.cancelled) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append('photo', { uri: p.uri, name: 'photo.jpg', type: 'image/jpeg' });
        const res = await fetch(`${API_URL}/reports/${reportId}/photos`, {
          method: 'POST',
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          Alert.alert('Photo Limit', json.message || 'Upload failed', [
            { text: 'OK' },
            { text: 'Unlock unlimited', onPress: () => navigation.navigate('Summary', { reportId }) },
          ]);
          return;
        }
        setPhotos([...photos, json.url]);
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const save = async () => {
    if (!condition.trim()) {
      Alert.alert('Validation Error', 'Condition is required');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/reports/${reportId}/rooms`, {
        name: room.name || room,
        notes,
        condition,
        photos,
      });
      Toast.show({ type: 'success', text1: 'Room saved' });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save room. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{room.name || room}</Text>
      <Text>Condition</Text>
      <TextInput
        value={condition}
        onChangeText={setCondition}
        style={{ borderWidth: 1, marginBottom: 8 }}
      />
      <Text>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, marginBottom: 8 }}
        multiline
      />
      <Button
        title={uploading ? 'Uploading...' : 'Take photo'}
        onPress={pick}
        disabled={uploading}
      />
      {photos.map((uri, i) => (
        <Image key={i} source={{ uri }} style={{ height: 150, marginTop: 8 }} />
      ))}
      <Button title={saving ? 'Saving...' : 'Save room'} onPress={save} disabled={saving} />
    </ScrollView>
  );
}
