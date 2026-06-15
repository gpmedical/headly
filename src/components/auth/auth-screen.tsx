import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import regularSymbolWeight from "expo-symbols/androidWeights/regular";
import { StatusBar } from "expo-status-bar";
import { images } from "@/constants/images";
import { colors, fontFamilies } from "@/theme";

type AuthMode = "sign-up" | "sign-in";

type AuthScreenProps = {
  mode: AuthMode;
};

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type ImageSource = ComponentProps<typeof Image>["source"];

const authCopy = {
  "sign-up": {
    title: "Create account",
    subtitle: "Start tracking your headaches in minutes.",
    primaryLabel: "Sign Up",
    footerText: "Already have an account?",
    footerAction: "Sign in",
    footerHref: "/sign-in",
  },
  "sign-in": {
    title: "Welcome back",
    subtitle: "Log in to continue tracking\nyour headaches.",
    primaryLabel: "Sign In",
    footerText: "Don't have an account?",
    footerAction: "Sign up",
    footerHref: "/sign-up",
  },
} as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const copy = authCopy[mode];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showVerification = () => {
    setIsVerificationVisible(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsVerificationVisible(false);
      router.replace("/");
    }, 3000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 30,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="min-h-full w-full items-center px-6">
          <Image
            source={images.logo}
            className="mt-[74px] h-[65px] w-[190px]"
            contentFit="contain"
          />

          <Text className="mt-6 text-center font-headly-semibold text-[24px] leading-[31px] text-headly-text-primary">
            {copy.title}
          </Text>
          <Text className="mt-2 text-center font-headly text-[15px] leading-[24px] text-headly-text-secondary">
            {copy.subtitle}
          </Text>

          <View className="mt-9 w-full max-w-[318px] gap-3">
            <View className="headly-auth__input">
              <EnvelopeIcon />
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#8B94AA"
                style={{
                  color: colors.neutral.textPrimary,
                  fontFamily: fontFamilies.regular,
                  fontSize: 15,
                  lineHeight: 21,
                  padding: 0,
                }}
                underlineColorAndroid="transparent"
                value={email}
              />
            </View>
            <View className="headly-auth__input">
              <LockIcon />
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#8B94AA"
                secureTextEntry={!isPasswordVisible}
                style={{
                  color: colors.neutral.textPrimary,
                  fontFamily: fontFamilies.regular,
                  fontSize: 15,
                  lineHeight: 21,
                  padding: 0,
                }}
                textContentType={mode === "sign-up" ? "newPassword" : "password"}
                underlineColorAndroid="transparent"
                value={password}
              />
              <TouchableOpacity
                accessibilityLabel={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
                activeOpacity={0.75}
                onPress={() => setIsPasswordVisible((current) => !current)}
              >
                <EyeIcon isPasswordVisible={isPasswordVisible} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            className="headly-auth__primary mt-8"
            onPress={showVerification}
          >
            <Text className="font-headly-semibold text-[15px] leading-5 text-white">
              {copy.primaryLabel}
            </Text>
          </TouchableOpacity>

          <View className="mt-6 w-full max-w-[318px] flex-row items-center gap-5">
            <View className="h-px flex-1 bg-headly-border" />
            <Text className="font-headly text-[14px] leading-5 text-headly-text-secondary">
              or
            </Text>
            <View className="h-px flex-1 bg-headly-border" />
          </View>

          <View className="mt-5 w-full max-w-[318px] gap-3">
            <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
            <SocialButton icon={<AppleIcon />} label="Continue with Apple" />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="font-headly text-[15px] leading-[22px] text-headly-text-secondary">
              {copy.footerText}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              onPress={() => router.push(copy.footerHref as Href)}
            >
              <Text className="font-headly-semibold text-[15px] leading-[22px] text-headly-teal">
                {copy.footerAction}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-auto w-full max-w-[318px] flex-row items-center justify-center gap-3 pt-12">
            <ShieldIcon />
            <Text className="font-headly text-[12px] leading-[19px] text-headly-text-secondary">
              Your data is private and secure.{"\n"}We never share your information.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={isVerificationVisible}>
        <View className="flex-1 items-center justify-center bg-black/30 px-8">
          <View className="w-full max-w-[320px] items-center rounded-[24px] bg-white px-7 py-8">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-full bg-headly-teal-very-light">
              <CheckIcon />
            </View>
            <Text className="text-center font-headly-semibold text-[20px] leading-[26px] text-headly-text-primary">
              Verification complete
            </Text>
            <Text className="mt-3 text-center font-headly text-[14px] leading-[22px] text-headly-text-secondary">
              You have successfully logged in.
            </Text>
            <ActivityIndicator
              className="mt-6"
              color={colors.primary.teal}
              size="small"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      className="headly-auth__social"
    >
      <View className="w-8 items-center">{icon}</View>
      <Text className="font-headly-medium text-[15px] leading-5 text-headly-text-secondary">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EnvelopeIcon() {
  return (
    <AuthSymbol
      fallbackSource={images.envelopeIcon}
      name={{ ios: "envelope", android: "mail", web: "mail" }}
      size={22}
    />
  );
}

function LockIcon() {
  return (
    <AuthSymbol
      fallbackSource={images.lockIcon}
      name={{ ios: "lock", android: "lock", web: "lock" }}
      size={22}
    />
  );
}

function EyeIcon({ isPasswordVisible }: { isPasswordVisible: boolean }) {
  const fallbackSource = isPasswordVisible ? images.eyeIcon : images.eyeSlashIcon;

  return (
    <AuthSymbol
      fallbackSource={fallbackSource}
      name={
        isPasswordVisible
          ? { ios: "eye", android: "visibility", web: "visibility" }
          : { ios: "eye.slash", android: "visibility_off", web: "visibility_off" }
      }
      size={22}
    />
  );
}

function GoogleIcon() {
  return (
    <Image source={images.googleLogo} className="h-[22px] w-[22px]" contentFit="contain" />
  );
}

function AppleIcon() {
  return (
    <Image source={images.appleLogo} className="h-[23px] w-[23px]" contentFit="contain" />
  );
}

function ShieldIcon() {
  return (
    <AuthSymbol
      fallbackClassName="h-8 w-7"
      fallbackSource={images.shieldCheckIcon}
      name={{
        ios: "checkmark.shield",
        android: "verified_user",
        web: "verified_user",
      }}
      size={31}
      tintColor="#0EA5A4"
    />
  );
}

function CheckIcon() {
  return (
    <AuthSymbol
      fallbackClassName="h-7 w-7"
      fallbackSource={images.checkIcon}
      name={{ ios: "checkmark", android: "check", web: "check" }}
      size={28}
      tintColor="#0EA5A4"
    />
  );
}

function AuthSymbol({
  fallbackClassName = "h-[22px] w-[22px]",
  fallbackSource,
  name,
  size,
  tintColor = "#667085",
}: {
  fallbackClassName?: string;
  fallbackSource: ImageSource;
  name: SymbolName;
  size: number;
  tintColor?: string;
}) {
  return (
    <SymbolView
      fallback={
        <Image
          source={fallbackSource}
          className={fallbackClassName}
          contentFit="contain"
        />
      }
      name={name}
      size={size}
      tintColor={tintColor}
      weight={{ ios: "regular", android: regularSymbolWeight }}
    />
  );
}
