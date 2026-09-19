import React from 'react';
import { View, Text } from 'react-native';

export default function RunnerInbox() {
  return (
    <View className="flex-1 items-center justify-center bg-background-light">
      <Text className="text-text-gray font-figtree text-[16px]">Inbox</Text>
      <Text className="text-text-light font-figtree text-[13px] mt-1">
        Your messages will appear here
      </Text>
    </View>
  );
}