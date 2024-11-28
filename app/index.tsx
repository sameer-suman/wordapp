import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const [word, setWord] = useState<string | null>(null);
  const [typeOfWord, setTypeOfWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [ipa, setIPA] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);
  
  const router = useRouter();

  // Fetch Word of the Day on component mount
  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  // Function to check if it's a new day
  const isNewDay = () => {
  if (!lastFetchedDate) return true;
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  return currentDate !== lastFetchedDate.split('T')[0]; // Compare dates
  };

  const handleNewWordPress = () => {

      fetchWordOfTheDay();
    
  };

  /**
   * Fetch the Word of the Day from the API
   */
  const fetchWordOfTheDay = async () => {
    try {
      const apiUrl = 'https://wodabk-5ekpn5had-sameer-sumans-projects-4cb0b5be.vercel.app/api/word-of-the-day'; 
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Word of the Day');
      }

      const data = await response.json();

      setWord(data.word);
      setTypeOfWord(data.type_of_word);
      setDefinition(data.meaning);
      setExamples(data.examples || []);
      setIPA(data.ipa);
      setDate(data.date);
      setLastFetchedDate(new Date().toISOString()); // Store the date the word was fetched

      // Save to history
      saveWordToHistory(data);
    } catch (error) {
      console.error('Error fetching Word of the Day:', error);
      Alert.alert('Error', 'Failed to fetch the Word of the Day.');
    }
  };

  const saveWordToHistory = async (data: any) => {
    try {
      const storedHistory = await AsyncStorage.getItem('history');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
  
      // Check if the word already exists in history
      const isWordExist = history.some((item: any) => item.word === data.word);
      if (!isWordExist) {
        history.push({
          word: data.word,
          type_of_word: data.type_of_word,
          meaning: data.meaning,
          examples: data.examples || [],
          ipa: data.ipa,
          date: data.date,
          savedAt: new Date().toISOString(), // Save the date it was added to history
        });
        await AsyncStorage.setItem('history', JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Date */}
      <View style={styles.sectionBox}>
        <Text style={styles.date}>
          {date ? `Date: ${date}` : 'Loading date...'}
        </Text>
      </View>

      {/* Word and related information */}
      <View style={styles.sectionBox}>
        <Text style={styles.word}>
          {word || 'Loading word...'}
        </Text>
        <Text style={styles.typeOfWord}>
          {typeOfWord || 'Loading type...'}
        </Text>
        <Text style={styles.ipa}>
          {ipa || 'Loading pronunciation...'}
        </Text>
        <Text style={styles.definition}>
          {definition || 'Loading definition...'}
        </Text>
      </View>

      {/* Examples */}
      <View style={styles.sectionBox}>
        {examples.length > 0 ? (
          examples.map((example, index) => (
            <Text key={index} style={styles.example}>
              {`Example ${index + 1}: ${example}`}
            </Text>
          ))
        ) : (
          <Text style={styles.example}>Loading examples...</Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.newWordButton]} onPress={handleNewWordPress}  disabled={!isNewDay()} >
          <Text style={styles.buttonText}>{isNewDay() ? "New Word" : "New Word Tomorrow"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.historyButton]} onPress={() => router.push('/history')}>
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f8ff', // Light background color
  },
  sectionBox: {
    width: '90%',
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#ffffff', // White background for sections
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light border color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2', // Blue color for the word
    marginBottom: 4,
  },
  typeOfWord: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#7f8c8d', // Grey color for word type
    marginBottom: 4,
  },
  ipa: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  definition: {
    fontSize: 18,
    color: '#2c3e50', // Darker color for definition
    marginVertical: 8
    },
  examples: {
    marginTop: 12,
  },
  example: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#34495e', // Dark color for example text
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 3,
  },
  newWordButton: {
    backgroundColor: '#27ae60', // Green button for "New Word"
  },
  historyButton: {
    backgroundColor: '#2980b9', // Blue button for "History"
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
