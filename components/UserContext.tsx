import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Types
type Personality = 'A' | 'B' | 'C';
type LifestyleData = {
    steps: number;
    exerciseMinutes: number;
    sleepHours: number;
};

interface UserContextType {
    personality: Personality;
    setPersonality: (p: Personality) => void;
    usageDays: number;
    lifestyle: LifestyleData;
    isLoading: boolean;
    resetUserdata: () => Promise<void>;
    coins: number;
    addCoin: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Dummy Lifestyle Data
const DUMMY_LIFESTYLE: LifestyleData = {
    steps: 4200,
    exerciseMinutes: 25,
    sleepHours: 5.5,
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const [personality, setPersonality] = useState<Personality>('A');
    const [usageDays, setUsageDays] = useState<number>(0);
    const [coins, setCoins] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedPersonality = await AsyncStorage.getItem('user_personality');
            const firstOpenDate = await AsyncStorage.getItem('first_open_date');
            const storedCoins = await AsyncStorage.getItem('user_coins');

            if (storedPersonality) {
                setPersonality(storedPersonality as Personality);
            }

            if (storedCoins) {
                setCoins(parseInt(storedCoins, 10));
            }

            let startTimestamp;
            if (firstOpenDate) {
                startTimestamp = parseInt(firstOpenDate, 10);
            } else {
                startTimestamp = Date.now();
                await AsyncStorage.setItem('first_open_date', startTimestamp.toString());
            }

            // Calculate days difference
            const msPerDay = 1000 * 60 * 60 * 24;
            const days = Math.floor((Date.now() - startTimestamp) / msPerDay);
            setUsageDays(days);

        } catch (e) {
            console.error('Failed to load user data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const savePersonality = async (p: Personality) => {
        setPersonality(p);
        await AsyncStorage.setItem('user_personality', p);
    };

    const addCoin = async () => {
        const newCoins = coins + 1;
        setCoins(newCoins);
        await AsyncStorage.setItem('user_coins', newCoins.toString());
    };

    // For debugging/demo: Reset function
    const resetUserdata = async () => {
        await AsyncStorage.removeItem('user_personality');
        await AsyncStorage.removeItem('first_open_date');
        await AsyncStorage.removeItem('user_coins');
        setPersonality('A');
        setUsageDays(0);
        setCoins(0);
        await AsyncStorage.setItem('first_open_date', Date.now().toString());
    }

    return (
        <UserContext.Provider
            value={{
                personality,
                setPersonality: savePersonality,
                usageDays,
                lifestyle: DUMMY_LIFESTYLE,
                isLoading,
                resetUserdata,
                coins,
                addCoin
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
