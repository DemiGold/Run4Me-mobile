import React from 'react';
import { View, Text } from 'react-native';

export default function RunnerErrands() {
  return (
    <View className="flex-1 items-center justify-center bg-background-subtle">
      <Text className="text-text-gray font-figtree text-[16px]">My Errands</Text>
      <Text className="text-text-light font-figtree text-[13px] mt-1">Your active errands will appear here</Text>
    </View>
  );
}