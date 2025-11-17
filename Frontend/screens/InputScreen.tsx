import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendRequest } from '../services/api';

export default function InputScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthIssues, setHealthIssues] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  //  Load user name
  useEffect(() => {
    AsyncStorage.getItem('userName').then(storedName => {
      if (storedName) setName(storedName);
    });
    loadReportUsage();
  }, []);

  //  Get today's date string
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  //  Load daily usage
  const loadReportUsage = async () => {
    const today = getToday();
    const storedData = await AsyncStorage.getItem('reportUsage');
    let usage = storedData ? JSON.parse(storedData) : { date: today, count: 0 };

    // Reset if old date
    if (usage.date !== today) {
      usage = { date: today, count: 0 };
      await AsyncStorage.setItem('reportUsage', JSON.stringify(usage));
    }

    setReportCount(usage.count);
  };

  //  Validate inputs
  const validateInputs = () => {
    if (!age || !height || !weight) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return false;
    }
    return true;
  };

  //  Check and update report generation count
  const canGenerateReport = async (): Promise<boolean> => {
    const today = getToday();
    const storedData = await AsyncStorage.getItem('reportUsage');
    let usage = storedData ? JSON.parse(storedData) : { date: today, count: 0 };

    // Reset if new day
    if (usage.date !== today) {
      usage = { date: today, count: 0 };
    }

    if (usage.count >= 10) {
      Alert.alert('Limit Reached', 'You can only generate up to 10 reports per day. Please try again tomorrow.');
      return false;
    }

    // Increment and save
    usage.count += 1;
    usage.date = today;
    await AsyncStorage.setItem('reportUsage', JSON.stringify(usage));
    setReportCount(usage.count);
    return true;
  };

  //  Handle submission
  const handleSubmit = async () => {
    if (!validateInputs()) return;
    if (isSubmitting) {
      Alert.alert('Please Wait', 'A request is already in progress.');
      return;
    }

    const allowed = await canGenerateReport();
    if (!allowed) return;

    setLoading(true);
    setIsSubmitting(true);

    const userData = {
      name: name || 'User',
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      healthIssues: healthIssues || 'None',
    };

    try {
      const res = await sendRequest('GenerateSuggestions', userData);

      if (!res.ok) {
        Alert.alert('Error', res.message || 'Failed to fetch AI suggestions.');
        return;
      }

      const fullData = { ...userData, suggestions: res.suggestions };
      await AsyncStorage.setItem('reportData', JSON.stringify(fullData));

      Alert.alert('Success', 'AI health suggestions ready!');
      navigation.navigate('Report');
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Your Health Details</Text>

      <TextInput
        placeholder="Age (years)"
        keyboardType="numeric"
        style={styles.input}
        value={age}
        onChangeText={setAge}
        editable={!loading}
      />
      <TextInput
        placeholder="Height (cm)"
        keyboardType="numeric"
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        editable={!loading}
      />
      <TextInput
        placeholder="Weight (kg)"
        keyboardType="numeric"
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        editable={!loading}
      />
      <TextInput
        placeholder="Health Issues (optional)"
        style={styles.input}
        value={healthIssues}
        onChangeText={setHealthIssues}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get Suggestions</Text>
        )}
      </TouchableOpacity>

      {/* Report counter display */}
      <Text style={styles.counterText}>
        Reports used today: {reportCount} / 10
      </Text>

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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  counterText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#1e90ff',
    fontSize: 16,
  },
});
