import { useUser } from '@/components/UserContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { personality, setPersonality, usageDays, lifestyle, coins } = useUser();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate when coins change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [coins]);

  const handleStartChat = () => {
    router.push('/chat');
  };

  const PersonalityOption = ({ id, label, desc }: { id: 'A' | 'B' | 'C', label: string, desc: string }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        personality === id && styles.optionCardSelected
      ]}
      onPress={() => setPersonality(id)}
    >
      <Text style={[styles.optionTitle, personality === id && styles.textSelected]}>{label}</Text>
      <Text style={[styles.optionDesc, personality === id && styles.textSelected]}>{desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Adaptive Fitness</Text>
        <TouchableOpacity onPress={() => router.push('/history')}>
          <Text style={{ fontSize: 24 }}>📜</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Intro Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How I help</Text>
          <Text style={styles.cardText}>• Personalized workout plans</Text>
          <Text style={styles.cardText}>• Tips for posture & wellness</Text>
          <Text style={styles.cardText}>• Motivation & tracking</Text>
          <View style={styles.divider} />
          <Text style={styles.disclaimer}>⚠️ I do not provide medical advice. Consult a doctor for injuries.</Text>
        </View>

        {/* Usage Stats (Dummy) */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{usageDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{lifestyle.exerciseMinutes}</Text>
            <Text style={styles.statLabel}>Active Mins</Text>
          </View>
          <Animated.View style={[styles.statBox, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.statValue}>🪙 {coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </Animated.View>
        </View>

        {/* Personality Selector */}
        <Text style={styles.sectionHeader}>Choose Personality</Text>
        <PersonalityOption
          id="A"
          label="Encouragement Seeker"
          desc="Empathetic, reassuring, frequent nudges."
        />
        <PersonalityOption
          id="B"
          label="Creative Explorer"
          desc="Witty, varies routine, dislikes spoon-feeding."
        />
        <PersonalityOption
          id="C"
          label="Goal Finisher"
          desc="Direct, structured, checklists & plans."
        />

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartChat}>
          <Text style={styles.startButtonIcon}>💬</Text>
          <Text style={styles.startButtonText}>Start Chat</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ... styles remain mostly same, just updating Animated.View specific styles if needed (statBox handles it)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', // WhatsApp Chat Background
  },
  appBar: {
    backgroundColor: '#075E54', // WhatsApp Dark Teal
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#075E54',
  },
  subtitle: {
    fontSize: 18,
    color: '#128C7E',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#075E54',
  },
  cardText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 4,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  disclaimer: {
    fontSize: 13,
    color: '#D32F2F',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#128C7E',
  },
  statLabel: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 10,
    marginLeft: 4,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#DCF8C6', // WhatsApp Light Green selection
    borderLeftColor: '#075E54',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 14,
    color: '#666',
  },
  textSelected: {
    color: '#000',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366', // WhatsApp Bright Green
    borderRadius: 28, // Pill shape
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: 'white',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    display: 'none',
  },
  fabIcon: {
    display: 'none',
  },
});
