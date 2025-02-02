import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useColorScheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const simulateAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          result: 'No Dementia',
          prob_dementia: 0.4,
          prob_no_dementia: 0.6,
        });
      }, 1500);
    });
  };

  const handlePress = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await simulateAPI();
      setResult(response);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF',
    decimalPlaces: 2,
    color: (opacity = 1) =>
      theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    propsForLabels: {
      fontSize: isSmallDevice ? 12 : 14
    }
  };

  const pieChartData = result
    ? [
        { name: 'Dementia', population: result.prob_dementia, color: '#FF6384' },
        { name: 'No Dementia', population: result.prob_no_dementia, color: '#36A2EB' },
      ]
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.container}>
          <Animated.View
            style={styles.widget}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter your text here..."
              placeholderTextColor={theme === 'dark' ? '#BBB' : '#666'}
              multiline
              value={input}
              onChangeText={setInput}
              editable={!loading}
              blurOnSubmit
              returnKeyType="done"
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.loadingButton]}
              onPress={handlePress}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Analyze Text</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {result && (
            <Animated.View
              style={styles.resultContainer}
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            >
              <Text style={styles.resultText}>{result.result}</Text>

              {pieChartData.length > 0 && (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieChartData}
                    width={Math.min(screenWidth - 40, 400)}
                    height={isSmallDevice ? 180 : 220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend={false}
                  />
                </View>
              )}

              <View style={styles.table}>
                {pieChartData.map((item, index) => (
                  <Animated.View
                    key={index}
                    style={styles.tableRow}
                    entering={FadeIn.delay(index * 100).duration(300)}
                  >
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                    <Text style={styles.tableLabel}>{item.name}</Text>
                    <Text style={styles.tablePercentage}>
                      {(item.population * 100).toFixed(1)}%
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isSmallDevice ? 15 : 20,
    paddingTop: Platform.select({ ios: 20, android: 15 }),
  },
  widget: {
    padding: isSmallDevice ? 15 : 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 15,
  },
  input: {
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: isSmallDevice ? 15 : 16,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingButton: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resultContainer: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  resultText: {
    fontSize: isSmallDevice ? 19 : 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 8,
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  tableLabel: {
    flex: 2,
    fontSize: isSmallDevice ? 14 : 15,
    marginRight: 8,
  },
  tablePercentage: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    textAlign: 'right',
  },
});

const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: '#F8F9FA' },
  widget: { ...baseStyles.widget, backgroundColor: '#FFFFFF' },
  input: {
    ...baseStyles.input,
    borderColor: '#E9ECEF',
    color: '#212529',
    backgroundColor: '#FFFFFF',
  },
  button: { ...baseStyles.button, backgroundColor: '#4D96FF' },
  buttonText: { ...baseStyles.buttonText, color: '#FFFFFF' },
  resultText: { ...baseStyles.resultText, color: '#2B2D42' },
  tableRow: {
    ...baseStyles.tableRow,
    backgroundColor: '#F8F9FA',
    borderBottomColor: '#E9ECEF',
  },
  tableLabel: { ...baseStyles.tableLabel, color: '#495057' },
  tablePercentage: { ...baseStyles.tablePercentage, color: '#2B2D42' },
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: '#121212' },
  widget: { ...baseStyles.widget, backgroundColor: '#1E1E1E' },
  input: {
    ...baseStyles.input,
    borderColor: '#2D2D2D',
    color: '#E9ECEF',
    backgroundColor: '#2B2B2B',
  },
  button: { ...baseStyles.button, backgroundColor: '#6366F1' },
  buttonText: { ...baseStyles.buttonText, color: '#FFFFFF' },
  resultText: { ...baseStyles.resultText, color: '#E9ECEF' },
  tableRow: {
    ...baseStyles.tableRow,
    backgroundColor: '#2B2B2B',
    borderBottomColor: '#3D3D3D',
  },
  tableLabel: { ...baseStyles.tableLabel, color: '#ADB5BD' },
  tablePercentage: { ...baseStyles.tablePercentage, color: '#E9ECEF' },
});