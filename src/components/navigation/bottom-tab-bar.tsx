import { Image, type ImageProps } from "expo-image";
import { type Href, router, usePathname } from "expo-router";
import { Pressable, Text, type ViewStyle, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { images } from "@/constants/images";

type MainTab = {
  href: "/" | "/history" | "/stats" | "/reminders" | "/settings";
  label: string;
  icon: ImageProps["source"];
  activeIcon: ImageProps["source"];
};

const tabs: MainTab[] = [
  {
    href: "/",
    label: "Home",
    icon: images.tabHome,
    activeIcon: images.tabHomeActive,
  },
  {
    href: "/history",
    label: "History",
    icon: images.tabHistory,
    activeIcon: images.tabHistoryActive,
  },
  {
    href: "/stats",
    label: "Stats",
    icon: images.tabStats,
    activeIcon: images.tabStatsActive,
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: images.tabReminders,
    activeIcon: images.tabRemindersActive,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: images.tabSettings,
    activeIcon: images.tabSettingsActive,
  },
];

const pressedTabStyle: ViewStyle = { opacity: 0.74, transform: [{ scale: 0.96 }] };

function tabFeedback({ pressed }: { pressed: boolean }) {
  return pressed ? pressedTabStyle : undefined;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="headly-dashboard__tabbar"
      style={{
        height: 66 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 4),
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Pressable
            key={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            className="h-[48px] flex-1 cursor-pointer items-center justify-center gap-[3px] rounded-[12px] hover:bg-[#F2F7F7] active:bg-[#E6F6F5]"
            onPress={() => {
              if (!isActive) {
                router.replace(tab.href as Href);
              }
            }}
            style={tabFeedback}
          >
            <Image
              source={isActive ? tab.activeIcon : tab.icon}
              contentFit="contain"
              style={{ height: 20, width: 20 }}
            />
            <Text
              className={
                isActive
                  ? "font-headly-medium text-[10px] leading-[13px] text-headly-teal"
                  : "font-headly-medium text-[10px] leading-[13px] text-[#7A8192]"
              }
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
