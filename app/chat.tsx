import { useUser } from '@/components/UserContext';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
};

export default function ChatScreen() {
    const { personality, usageDays, lifestyle, coins, addCoin } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const initialMessage = "Hi! I'm your fitness companion. How can I help you today?";
        setMessages([{ id: 'init', text: initialMessage, sender: 'ai' }]);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            let baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
            if (baseUrl && baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }
            if (Platform.OS === 'android' && baseUrl && baseUrl.includes('localhost')) {
                baseUrl = baseUrl.replace('localhost', '10.0.2.2');
            }

            const API_URL = baseUrl
                ? `${baseUrl}/api/chat`
                : (Platform.OS === 'android'
                    ? 'http://10.0.2.2:3000/api/chat'
                    : 'http://localhost:3000/api/chat');

            console.log('Connecting to:', API_URL);

            console.log('Connecting to:', API_URL);
            addCoin();

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    userId: 'user_123',
                    userContext: {
                        personality,
                        usageDays,
                        lifestyle
                    }
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I didn't get a response. Try again?",
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to the server. Make sure the backend is running.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.aiText
            ]}>
                {item.text}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <View style={styles.appBar}>
            </View>

            <View style={styles.chatBackground}>
                {messages.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateTitle}>Ask me anything:</Text>
                        <TouchableOpacity style={styles.chip} onPress={() => setInput("Create a beginner workout plan for 3 days a week")}>
                            <Text style={styles.chipText}>Create a beginner workout plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chip} onPress={() => setInput("What are good warm-up exercises before running?")}>
                            <Text style={styles.chipText}>Warm-up exercises for running</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chip} onPress={() => setInput("How can I stay consistent with workouts?")}>
                            <Text style={styles.chipText}>Tips for consistency</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#075E54" />
                    <Text style={styles.loadingText}>typing...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Message"
                        placeholderTextColor="#999"
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
                        <View style={styles.sendIconCircle}>
                            <Text style={styles.sendButtonText}>➤</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECE5DD',
    },
    appBar: {
        height: 0,
    },
    chatBackground: {
        flex: 1,
        backgroundColor: '#ECE5DD',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    chip: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
    },
    chipText: {
        color: '#075E54',
        fontSize: 14,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // WhatsApp User Bubble (Light Green)
        borderTopRightRadius: 0,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF', // WhatsApp AI Bubble (White)
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#000000',
    },
    userText: {
        color: '#000000',
    },
    aiText: {
        color: '#000000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: 'transparent',
        alignItems: 'center',
        marginBottom: 4,
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
        marginRight: 6,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIconCircle: {
        width: 44,
        height: 44,
        backgroundColor: '#075E54', // Dark Teal Send Button
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 2, // Visual adjustment for arrow arrow
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingBottom: 10,
    },
    loadingText: {
        marginLeft: 8,
        color: '#075E54',
        fontStyle: 'italic',
        fontSize: 12,
    },
});
