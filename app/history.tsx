import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Determine API URL based on platform
const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/history'
    : 'http://localhost:3000/api/history';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            } else {
                throw new Error("Backend unavailable");
            }
        } catch (error) {
            console.warn('Backend unavailable. Showing offline state.');
            // Optional: Set mock history for demo purposes fallback
            setHistory([
                { sender: 'ai', message: 'History unavailable in offline mode.', timestamp: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.historyItem}>
            <Text style={styles.role}>{item.sender === 'user' ? '👤 You' : '🤖 AI'}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.timestamp || Date.now()).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#075E54" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No history found.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECE5DD',
    },
    header: {
        padding: 20,
        backgroundColor: '#075E54',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    listContent: {
        padding: 16,
    },
    historyItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
    },
    role: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#075E54',
        marginBottom: 4,
    },
    message: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#999',
        alignSelf: 'flex-end',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 16,
    }
});
