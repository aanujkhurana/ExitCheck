import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, ScrollView, Image, Alert, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_URL } from '../config';

export default function Summary({ route, navigation }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/${reportId}`);
      setReport(res.data);
    } catch (e) {
      setError('Failed to load report. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/reports/${reportId}/generate`);
      Toast.show({ type: 'success', text1: 'PDF generated', text2: res.data.url });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const email = async () => {
    setEmailing(true);
    try {
      await axios.post(`${API_URL}/reports/${reportId}/email`, { to: report.agentEmail });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Report emailed to agent' });
    } catch (e) {
      Alert.alert('Error', 'Failed to email report. Please try again.');
    } finally {
      setEmailing(false);
    }
  };

  const remove = async () => {
    Alert.alert('Delete report', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/reports/${reportId}`);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const upgrade = async () => {
    setPaying(true);
    try {
      const res = await axios.post(`${API_URL}/reports/${reportId}/create-checkout-session`);
      await Linking.openURL(res.data.url);
      Alert.alert('Payment', 'Complete payment in your browser, then come back and tap Refresh.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Payment unavailable. Please try again later.';
      Alert.alert('Error', msg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error)
    return (
      <View style={{ padding: 16 }}>
        <Text>{error}</Text>
      </View>
    );
  if (!report) return null;
  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReport} />}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Summary</Text>
      <Text>{report.address}</Text>
      {!report.paid && (
        <View style={{ backgroundColor: '#fff3cd', padding: 12, marginVertical: 8, borderRadius: 4 }}>
          <Text>Free tier: limited to 3 photos.</Text>
        </View>
      )}
      {report.rooms &&
        report.rooms.map((r, i) => (
          <View key={i} style={{ marginTop: 12, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ fontWeight: '600' }}>{r.name}</Text>
            <Text>Condition: {r.condition}</Text>
            <Text>Notes: {r.notes}</Text>
            {r.photos &&
              r.photos.map((p, pi) => (
                <Image key={pi} source={{ uri: p }} style={{ height: 120, marginTop: 8 }} />
              ))}
          </View>
        ))}
      {report.paid ? (
        <Text style={{ color: 'green', fontWeight: 'bold', marginVertical: 8 }}>Unlimited photos unlocked</Text>
      ) : (
        <Button title={paying ? 'Opening payment...' : 'Unlock unlimited photos'} onPress={upgrade} disabled={paying} />
      )}
      <Button title="Refresh payment status" onPress={fetchReport} />
      <Button
        title={generating ? 'Generating...' : 'Generate PDF'}
        onPress={generate}
        disabled={generating}
      />
      <Button
        title={emailing ? 'Emailing...' : 'Email agent'}
        onPress={email}
        disabled={emailing || !report.agentEmail}
      />
      <View style={{ marginTop: 24 }}>
        <Button title="Delete report" onPress={remove} color="#c00" />
      </View>
    </ScrollView>
  );
}
