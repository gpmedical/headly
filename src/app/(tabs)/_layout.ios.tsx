import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/theme";

const tabs = [
  { name: "index", label: "Home", icon: "house", selected: "house.fill" },
  { name: "history", label: "History", icon: "clock", selected: "clock.fill" },
  { name: "stats", label: "Stats", icon: "chart.bar", selected: "chart.bar.fill" },
  { name: "reminders", label: "Reminders", icon: "bell", selected: "bell.fill" },
  { name: "settings", label: "Settings", icon: "gearshape", selected: "gearshape.fill" },
] as const;

// The system supplies Liquid Glass on iOS 26 and native material on older iOS.
export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={colors.neutral.textSecondary}
      iconColor={{ default: "#7A8192", selected: "#14A4A1" }}
      labelStyle={{ default: { color: "#7A8192" }, selected: { color: "#14A4A1" } }}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
    >
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={{ default: tab.icon, selected: tab.selected }} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

