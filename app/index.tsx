import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-primary text-5xl font-bold tracking-tight">
        Run4Me
      </Text>
      <Text className="text-neutral-500 text-lg mt-2 font-medium">
        Styles and Router Configured!
      </Text>
      <Text className="text-accent text-2xl font-black mt-6 tracking-wide uppercase">
        Lets Fucking Go
      </Text>
    </View>
  );
}
