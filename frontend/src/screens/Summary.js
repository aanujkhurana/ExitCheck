
import React, {useEffect, useState} from 'react';
import { View, Text, Button, ScrollView, Image } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function Summary({route}){
  const { reportId } = route.params;
  const [report, setReport] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const res = await axios.get(`${API_URL}/reports/${reportId}`);
      setReport(res.data);
    })();
  },[]);

  const generate = async () => {
    const res = await axios.post(`${API_URL}/reports/${reportId}/generate`);
    // res.data.url is PDF
    alert('PDF generated: ' + res.data.url);
  };

  const email = async () => {
    await axios.post(`${API_URL}/reports/${reportId}/email`, { to: report.agentEmail });
    alert('Emailed to agent');
  };

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
      <Button title="Generate PDF" onPress={generate} />
      <Button title="Email agent" onPress={email} />
    </ScrollView>
  );
}
