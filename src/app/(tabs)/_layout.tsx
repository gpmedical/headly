import { Tabs } from "expo-router";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";

export default function TabLayout() {
  return (
    <Tabs tabBar={() => <BottomTabBar />} screenOptions={{ headerShown: false, animation: "none" }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

