import {
  isClerkAPIResponseError,
  useAuth,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/expo";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { Redirect, useRouter } from "expo-router";
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
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingAfterAuth, setIsNavigatingAfterAuth] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isFetching =
    isSubmitting ||
    signInFetchStatus === "fetching" ||
    signUpFetchStatus === "fetching";
  const isIOS = Platform.OS === "ios";

  if (!isAuthLoaded) {
    return null;
  }

  if (isSignedIn && !isNavigatingAfterAuth) {
    return <Redirect href="/" />;
  }

  const navigateAfterAuth = () => {
    setIsNavigatingAfterAuth(true);
    router.replace("/onboarding");
  };

  const finalizeSignIn = async () => {
    setIsNavigatingAfterAuth(true);

    const { error } = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const destination = decorateUrl("/onboarding");

        if (Platform.OS === "web" && destination.startsWith("http")) {
          window.location.href = destination;
          return;
        }

        router.replace(destination as Href);
      },
    });

    if (error) {
      setIsNavigatingAfterAuth(false);
      setMessage(getClerkErrorMessage(error));
      return;
    }

    navigateAfterAuth();
  };

  const finalizeSignUp = async () => {
    setIsNavigatingAfterAuth(true);

    const { error } = await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        const destination = decorateUrl("/onboarding");

        if (Platform.OS === "web" && destination.startsWith("http")) {
          window.location.href = destination;
          return;
        }

        router.replace(destination as Href);
      },
    });

    if (error) {
      setIsNavigatingAfterAuth(false);
      setMessage(getClerkErrorMessage(error));
      return;
    }

    navigateAfterAuth();
  };

  const handleEmailAuth = async () => {
    const emailAddress = email.trim();

    if (!emailAddress || !password) {
      setMessage("Enter your email address and password to continue.");
      return;
    }

    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error } = await signIn.password({ emailAddress, password });

        if (error) {
          setMessage(getClerkErrorMessage(error));
          return;
        }

        if (signIn.status === "complete") {
          await finalizeSignIn();
          return;
        }

        setMessage("Additional verification is required to complete sign in.");
        return;
      }

      const { error } = await signUp.password({ emailAddress, password });

      if (error) {
        setMessage(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        setMessage(getClerkErrorMessage(verificationError));
        return;
      }

      setVerificationCode("");
      setIsVerificationVisible(true);
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = verificationCode.trim();

    if (!code) {
      setMessage("Enter the verification code sent to your email.");
      return;
    }

    setMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        setMessage(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      setMessage("Verification is not complete yet. Check the code and try again.");
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setMessage(null);
    setIsSubmitting(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId && setActive) {
        setIsNavigatingAfterAuth(true);
        await setActive({ session: createdSessionId });
        router.replace("/onboarding");
        return;
      }
    } catch (error) {
      setMessage(getClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
            <View nativeID="clerk-captcha" className="h-0 w-0" />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            className="headly-auth__primary mt-8"
            disabled={isFetching}
            onPress={handleEmailAuth}
            style={{ opacity: isFetching ? 0.72 : 1 }}
          >
            {isFetching ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="font-headly-semibold text-[15px] leading-5 text-white">
                {copy.primaryLabel}
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 w-full max-w-[318px] flex-row items-center gap-5">
            <View className="h-px flex-1 bg-headly-border" />
            <Text className="font-headly text-[14px] leading-5 text-headly-text-secondary">
              or
            </Text>
            <View className="h-px flex-1 bg-headly-border" />
          </View>

          <View className="mt-5 w-full max-w-[318px] gap-3">
            <SocialButton
              disabled={isFetching}
              icon={<GoogleIcon />}
              label="Continue with Google"
              onPress={() => handleSocialAuth("oauth_google")}
            />
            {isIOS ? (
              <SocialButton
                disabled={isFetching}
                icon={<AppleIcon />}
                label="Continue with Apple"
                onPress={() => handleSocialAuth("oauth_apple")}
              />
            ) : null}
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
              <EnvelopeIcon />
            </View>
            <Text className="text-center font-headly-semibold text-[20px] leading-[26px] text-headly-text-primary">
              Verify your email
            </Text>
            <Text className="mt-3 text-center font-headly text-[14px] leading-[22px] text-headly-text-secondary">
              Enter the code Clerk sent to your email address.
            </Text>
            <TextInput
              accessibilityLabel="Verification code"
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-6 h-12 w-full rounded-[14px] border border-headly-border px-4 text-center"
              keyboardType="number-pad"
              onChangeText={setVerificationCode}
              placeholder="Verification code"
              placeholderTextColor="#8B94AA"
              style={{
                color: colors.neutral.textPrimary,
                fontFamily: fontFamilies.regular,
                fontSize: 15,
                lineHeight: 21,
              }}
              underlineColorAndroid="transparent"
              value={verificationCode}
            />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              className="mt-5 h-12 w-full items-center justify-center rounded-[14px] bg-headly-teal"
              disabled={isSubmitting}
              onPress={handleVerifyEmail}
              style={{ opacity: isSubmitting ? 0.72 : 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="font-headly-semibold text-[15px] leading-5 text-white">
                  Verify
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              className="mt-4 min-h-8 justify-center px-3"
              disabled={isSubmitting}
              onPress={() => setIsVerificationVisible(false)}
            >
              <Text className="font-headly-medium text-[14px] leading-5 text-headly-teal">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={message !== null}>
        <View className="flex-1 items-center justify-center bg-black/30 px-8">
          <View className="w-full max-w-[320px] items-center rounded-[24px] bg-white px-7 py-8">
            <Text className="text-center font-headly-semibold text-[20px] leading-[26px] text-headly-text-primary">
              Authentication
            </Text>
            <Text className="mt-3 text-center font-headly text-[14px] leading-[22px] text-headly-text-secondary">
              {message}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              className="mt-6 h-12 w-full items-center justify-center rounded-[14px] bg-headly-teal"
              onPress={() => setMessage(null)}
            >
              <Text className="font-headly-semibold text-[15px] leading-5 text-white">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SocialButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      className="headly-auth__social"
      disabled={disabled}
      onPress={onPress}
      style={{ opacity: disabled ? 0.72 : 1 }}
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

function getClerkErrorMessage(error: unknown) {
  if (isClerkAPIResponseError(error)) {
    const firstError = error.errors[0];

    return (
      firstError?.longMessage ??
      firstError?.message ??
      "Authentication failed. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
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
