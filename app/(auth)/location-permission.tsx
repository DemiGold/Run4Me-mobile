import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

const mapImage = require('@/assets/Rectangle.png');
const { width } = Dimensions.get('window');

export default function LocationPermission() {
  const params = useLocalSearchParams<{ role?: string }>();
  const user = useAuthStore((state) => state.user);
  const userRole = params.role || user?.role || 'customer';

  const [requesting, setRequesting] = useState(false);
  const [granted, setGranted] = useState(false);

  // ─── Pulse behind the marker ───
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseStyle = {
    position: 'absolute' as const,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.8],
        }),
      },
    ],
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0],
    }),
  };

  const routeToDashboard = () => {
    if (userRole === 'runner') {
      router.replace('/(runner)');
    } else {
      router.replace('/(customer)');
    }
  };

  const handleAllowLocation = async () => {
    setRequesting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setGranted(true);
        setTimeout(routeToDashboard, 500);
      } else {
        routeToDashboard();
      }
    } catch {
      routeToDashboard();
    } finally {
      setRequesting(false);
    }
  };

  const handleNotNow = () => routeToDashboard();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 justify-center px-6">
        <View className="gap-8">

          {/* ─── MAP CARD ─── */}
          <View
            className="w-full rounded-3xl overflow-hidden border border-border items-center justify-center"
            style={{ height: width * 0.85 }}
          >
            <Image
              source={mapImage}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />

            {/* Marker + pulse */}
            <View className="items-center justify-center">
              {/* Pulse ring centered on the marker's visual body (upper half) */}
              <Animated.View
                style={[
                  pulseStyle,
                  { top: '50%', marginTop: -15 },
                ]}
              />
              <FontAwesome
                name="map-marker"
                size={40}
                color={colors.primary}
              />
            </View>
          </View>

          {/* ─── BADGE ─── */}
          <View className="items-center justify-center">
            <View
              className={`
                flex-row items-center gap-1.5
                border rounded-full px-3 py-1.5
                ${granted
                  ? 'border-status-success/30 bg-status-successLight'
                  : 'border-border bg-background-light'
                }
              `}
            >
              <Feather
                name={granted ? 'check-circle' : 'shield'}
                size={12}
                color={granted ? colors.success : colors.primary}
              />
              <Text
                className={`text-caption font-figtree-bold tracking-wider ${
                  granted ? 'text-status-successDark' : 'text-primary'
                }`}
              >
                {granted ? 'LOCATION ENABLED' : 'SECURE & ACCURATE'}
              </Text>
            </View>
          </View>

          {/* ─── TEXT ─── */}
          <View className="items-center w-full">
            <Text className="text-heading-sm font-gabarito text-ink text-center mb-3">
              Enable your location
            </Text>
            <Text className="text-body-sm font-figtree text-muted text-center">
              Run4Me uses your location to find nearby Errand Runners, secure
              active tasks, and provide real-time accurate delivery estimates.
            </Text>
          </View>

        </View>

        {/* ─── BUTTONS ─── */}
        <View className="w-full mt-10 gap-2">
          <Button
            variant="primary"
            fullWidth
            loading={requesting}
            onPress={handleAllowLocation}
          >
            Allow Location Access
          </Button>

          <Button
            variant="outline"
            fullWidth
            onPress={handleNotNow}
            disabled={requesting}
          >
            Not Now
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}