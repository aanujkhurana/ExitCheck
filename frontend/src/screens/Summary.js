
import React, {useEffect, useState} from 'react';
import { View, Text, Button, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function Summary({route}){
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await axios.get(`${API_URL}/reports/${reportId}`);
        setReport(res.data);
      } catch (e) {
        setError('Failed to load report. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/reports/${reportId}/generate`);
      Alert.alert('Success', 'PDF generated: ' + res.data.url);
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
      Alert.alert('Success', 'Report emailed to agent');
    } catch (e) {
      Alert.alert('Error', 'Failed to email report. Please try again.');
    } finally {
      setEmailing(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{marginTop:40}} />;
  if (error) return <View style={{padding:16}}><Text>{error}</Text></View>;
  if(!report) return null;
  return (
    <ScrollView style={{padding:16}}>
      <Text style={{fontSize:20,fontWeight:'bold'}}>Summary</Text>
      <Text>{report.address}</Text>
      {report.rooms && report.rooms.map((r,i)=>(
        <View key={i} style={{marginTop:12,borderBottomWidth:1,paddingBottom:8}}>
          <Text style={{fontWeight:'600'}}>{r.name}</Text>
          <Text>Condition: {r.condition}</Text>
          <Text>Notes: {r.notes}</Text>
          {r.photos && r.photos.map((p,pi)=>(<Image key={pi} source={{uri:p}} style={{height:120,marginTop:8}} />))}
        </View>
      ))}
      <Button title={generating ? 'Generating...' : 'Generate PDF'} onPress={generate} disabled={generating} />
      <Button title={emailing ? 'Emailing...' : 'Email agent'} onPress={email} disabled={emailing || !report.agentEmail} />
    </ScrollView>
  );
}
