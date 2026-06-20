import { Text, View } from "react-native";

import { MainScreen } from "./main-screen";

type BlankTabScreenProps = {
  title: string;
};

export function BlankTabScreen({ title }: BlankTabScreenProps) {
  return (
    <MainScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-headly-semibold text-[24px] leading-[31px] text-headly-text-primary">
          {title}
        </Text>
      </View>
    </MainScreen>
  );
}
