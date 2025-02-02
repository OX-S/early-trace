import React, { useState, useEffect } from 'react';
import { Linking} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
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
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;

const NavBar = ({ activeRoute, setActiveRoute }) => {
  const theme = useColorScheme();
  const styles = theme === 'dark' ? navDarkStyles : navLightStyles;
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    const routes = ['App', 'About', 'Github'];
    const index = routes.indexOf(activeRoute);
    indicatorPosition.value = withTiming(index * 100, { duration: 300 });
  }, [activeRoute]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${indicatorPosition.value}%` }],
  }));

  return (
    <View style={styles.navContainer}>
      <View style={styles.tabs}>
        {['App', 'About', 'Github'].map((route) => (
          <TouchableOpacity
            key={route}
            style={styles.tab}
            onPress={() => setActiveRoute(route)}
          >
            <Text style={[styles.tabText, activeRoute === route && styles.activeTabText]}>
              {route}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View style={[styles.indicator, animatedStyle]} />
    </View>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState('App');
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
      <View style={{ flex: 1 }}>
        <NavBar activeRoute={activeRoute} setActiveRoute={setActiveRoute} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={styles.container}>
            {activeRoute === 'App' && (
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
                  maxLength={50000}
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
            )}

            {activeRoute === 'App' && result && (
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

            {activeRoute === 'About' && (
              <Animated.View
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
                style={styles.widget}
              >
                <Text style={styles.resultText}>About Screen</Text>
                <Text style={styles.tableLabel}>
                  This is a demo application for dementia prediction analysis.
                </Text>
              </Animated.View>
            )}

// Add this import

{activeRoute === 'Github' && (
  <Animated.View
    entering={FadeIn.duration(500)}
    exiting={FadeOut.duration(500)}
    style={styles.githubContainer}
  >
    <Icon name="github" size={50} color={theme === 'dark' ? '#E9ECEF' : '#2B2D42'} style={styles.githubIcon} />

    <Text style={styles.githubTitle}>GitHub Repository</Text>
    <Text style={styles.githubDescription}>
      Explore the source code and contribute to the project.
    </Text>

    <View style={styles.githubCard}>
      <Text style={styles.githubRepoName}>OX-S / early-trace</Text>
      <Text style={styles.githubRepoDescription}>
        A project for tracking early signs of dementia.
      </Text>

      <TouchableOpacity
        style={styles.githubButton}
        onPress={() => Linking.openURL('https://github.com/OX-S/early-trace')}
      >
        <Icon name="external-link" size={16} color="#FFFFFF" style={styles.githubButtonIcon} />
        <Text style={styles.githubButtonText}>View on GitHub</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
)}





        

          </View>
        </KeyboardAvoidingView>
      </View>
    </GestureHandlerRootView>
  );
}




const navBaseStyles = StyleSheet.create({






  navContainer: {
    height: 50,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '33.333%',
    height: 2,
  },
});


const navLightStyles = StyleSheet.create({
  ...navBaseStyles,
  navContainer: {
    ...navBaseStyles.navContainer,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E9ECEF',
  },
  tabText: {
    ...navBaseStyles.tabText,
    color: '#495057',
  },
  activeTabText: {
    color: '#4D96FF',
  },
  indicator: {
    ...navBaseStyles.indicator,
    backgroundColor: '#4D96FF',
  },
});

const navDarkStyles = StyleSheet.create({
  ...navBaseStyles,
  navContainer: {
    ...navBaseStyles.navContainer,
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#3D3D3D',
  },
  tabText: {
    ...navBaseStyles.tabText,
    color: '#ADB5BD',
  },
  activeTabText: {
    color: '#6366F1',
  },
  indicator: {
    ...navBaseStyles.indicator,
    backgroundColor: '#6366F1',
  },
});

const baseStyles = StyleSheet.create({



  githubIcon: {
    marginBottom: 10,
  },
  
  githubButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row', // Align icon & text
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  githubButtonIcon: {
    marginRight: 8,
  },
  

  githubContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  
  githubTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  githubDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  
  githubCard: {
    width: '90%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  
  githubRepoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  githubRepoDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  
  githubButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  githubButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  




  container: {
    flex: 1,
    padding: isSmallDevice ? 15 : 20,
    paddingTop: Platform.select({
      ios: 70,  // 50px for navbar + 20px for spacing
      android: 65, 
    }),
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

  githubContainer: { ...baseStyles.githubContainer },
  githubTitle: { ...baseStyles.githubTitle, color: '#2B2D42' },
  githubDescription: { ...baseStyles.githubDescription, color: '#495057' },
  
  githubCard: { 
    ...baseStyles.githubCard, 
    backgroundColor: '#FFFFFF',
    borderColor: '#E9ECEF',
    borderWidth: 1,
  },
  
  githubRepoName: { ...baseStyles.githubRepoName, color: '#2B2D42' },
  githubRepoDescription: { ...baseStyles.githubRepoDescription, color: '#495057' },
  
  githubButton: { ...baseStyles.githubButton, backgroundColor: '#4D96FF' },
  githubButtonText: { ...baseStyles.githubButtonText, color: '#FFFFFF' },



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



  githubContainer: { ...baseStyles.githubContainer },
githubTitle: { ...baseStyles.githubTitle, color: '#E9ECEF' },
githubDescription: { ...baseStyles.githubDescription, color: '#ADB5BD' },

githubCard: { 
  ...baseStyles.githubCard, 
  backgroundColor: '#242526',
  borderColor: '#3A3B3C',
  borderWidth: 1,
},

githubRepoName: { ...baseStyles.githubRepoName, color: '#E9ECEF' },
githubRepoDescription: { ...baseStyles.githubRepoDescription, color: '#ADB5BD' },

githubButton: { ...baseStyles.githubButton, backgroundColor: '#6366F1' },
githubButtonText: { ...baseStyles.githubButtonText, color: '#FFFFFF' },

});
