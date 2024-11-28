import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WordData {
  word: string;
  type_of_word: string;
  ipa: string;
  meaning: string;
  examples: string[];
  date: string;
  savedAt: string;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<WordData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load history');
    }
  };

  const clearHistory = async () => {
    try {
      if (history.length > 1) {
        const latestWord = history[history.length - 1]; // Get the latest word (last in the list)
        await AsyncStorage.setItem('history', JSON.stringify([latestWord])); // Keep only the latest word
        setHistory([latestWord]); // Update the state to reflect only the latest word
      } else {
        await AsyncStorage.removeItem('history');
        setHistory([]); // Clear history if there's only one word left
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clear history');
    }
  };
  
  

  const renderItem = ({ item }: { item: WordData }) => (
    <TouchableOpacity onPress={() => showWordDetails(item)}>
      <View style={styles.historyItem}>
        <Text style={styles.word}>{item.word}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const showWordDetails = (item: WordData) => {
    setSelectedWord(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWord(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Clear History" onPress={clearHistory} />

      {/* Modal for showing word details */}
      {selectedWord && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.date}>{selectedWord.date ? `Date: ${new Date(selectedWord.date).toLocaleDateString()}` : 'Loading date...'}</Text>
              <Text style={styles.word}>{selectedWord.word || 'Loading word...'}</Text>
              <Text style={styles.typeOfWord}>{selectedWord.type_of_word || 'Loading type...'}</Text>
              <Text style={styles.ipa}>{selectedWord.ipa || 'Loading pronunciation...'}</Text>
              <Text style={styles.definition}>{selectedWord.meaning || 'Loading definition...'}</Text>
              <View style={styles.examples}>
                {selectedWord.examples.length > 0 ? (
                  selectedWord.examples.map((ex, idx) => (
                    <Text key={idx} style={styles.example}>{`Example ${idx + 1}: ${ex}`}</Text>
                  ))
                ) : (
                  <Text style={styles.example}>Loading examples...</Text>
                )}
              </View>

              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  historyItem: {
    marginBottom: 16,
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: 'gray',
  },
  typeOfWord: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  ipa: {
    fontSize: 16,
    marginBottom: 8,
  },
  definition: {
    fontSize: 18,
    marginVertical: 8,
  },
  examples: {
    marginTop: 12,
  },
  example: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
});

export default HistoryScreen;
