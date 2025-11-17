import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function ReportScreen({ navigation }: any) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await AsyncStorage.getItem('reportData');
        const userName = await AsyncStorage.getItem('userName');
        if (data)
          setReportData({ ...JSON.parse(data), name: userName || 'User' });
      } catch (err) {
        console.error('Failed to load report data:', err);
      }
    };
    loadReport();
  }, []);

  const handleDownloadReport = async () => {
    if (!reportData) {
      Alert.alert('No Data', 'No report data found.');
      return;
    }

    try {
      setLoading(true);

      // Convert report to HTML for PDF
      const htmlContent = `
        <h1 style="text-align:center;color:#1e90ff;">Personalized Health Report</h1>
        <h2>User Details</h2>
        <p><strong>Name:</strong> ${reportData.name}</p>
        <p><strong>Age:</strong> ${reportData.age} years</p>
        <p><strong>Height:</strong> ${reportData.height} cm</p>
        <p><strong>Weight:</strong> ${reportData.weight} kg</p>
        <p><strong>Health Issues:</strong> ${reportData.healthIssues || 'None'}</p>
        ${
          reportData.suggestions
            ? `<h2>AI Health Suggestions</h2>
               <p>${reportData.suggestions.replace(/\n/g, '<br/>')}</p>`
            : ''
        }
      `;

      // Generate PDF offline
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Move PDF to documentDirectory for persistent access
      const fileUri = FileSystem.documentDirectory + 'health_report.pdf';
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      // Share PDF
      await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf' });

      setLoading(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ marginTop: 10 }}>Loading report...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health Report</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Details</Text>
        <Text>Name: {reportData.name || 'User'}</Text>
        <Text>Age: {reportData.age} years</Text>
        <Text>Height: {reportData.height} cm</Text>
        <Text>Weight: {reportData.weight} kg</Text>
        <Text>Health Issues: {reportData.healthIssues || 'None'}</Text>
      </View>

      {reportData.suggestions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Health Suggestions</Text>
          {reportData.suggestions.split('\n').map((line: string, idx: number) => {
            if (!line.trim()) return null;
            return <Text key={idx} style={styles.suggestionText}>{line.trim()}</Text>;
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDownloadReport}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate PDF</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
    color: '#333',
  },
  suggestionText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 5,
  },
  backButtonText: {
    color: '#1e90ff',
    fontSize: 16,
  },
});
