// import { Text } from "@/components/themed-text";
// import { View } from "@/components/themed-view";
import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { COLORS } from "../../../constants/colors";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passVisible, setPassVisible] = useState(false);

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          // Handle session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          // If no session tasks, navigate the signed-in user to the home page
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View className="bg-white flex-1 items-center px-10 pt-16">
        <View>
          <Image
            style={{ width: 300, height: 300 }}
            source={require("@/assets/images/i3.png")}
            resizeMode="cover"
          />
        </View>
        <Text style={{ color: COLORS.text }} className="font-bold text-3xl">
          Verify your account
        </Text>
        <Text
          style={{ color: COLORS.textLight }}
          className="text-lg leading-tight mt-6"
        >
          Weve sent a verifictaion code to
        </Text>
        <Text
          style={{ color: COLORS.textLight }}
          className="text-lg leading-tight mb-6"
        >
          example@gmail.com
        </Text>
        <TextInput
          className="w-full border rounded-lg px-5 mt-2 mb-1.5"
          style={{ borderColor: COLORS.border }}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor={COLORS.textLight}
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        )}
        <TouchableOpacity
          style={{ backgroundColor: COLORS.primary }}
          className="w-full justify-center items-center py-4 rounded-xl mt-3"
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text className="color-white">Sign Up</Text>
        </TouchableOpacity>
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="mt-5"
        >
          <Text style={{ color: COLORS.text }} className="font-bold">
            Back to Sign Up
          </Text>
        </Pressable>
        {/* <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable> */}
      </View>
    );
  }

  return (
    <View className="bg-white flex-1 items-center px-10 pt-16 gap-3">
      <View>
        <Image
          style={{ width: 300, height: 300 }}
          source={require("@/assets/images/i2.png")}
          resizeMode="cover"
        />
      </View>
      <Text style={{ color: COLORS.text }} className="font-bold text-3xl">
        Create Account
      </Text>

      <TextInput
        className="w-full border rounded-lg px-5 mt-2 mb-1.5"
        style={{ borderColor: COLORS.border }}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor={COLORS.textLight}
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
      />
      {errors.fields.emailAddress && (
        <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
      )}
      <View
        style={{ borderColor: COLORS.border }}
        className="flex-row justify-center items-center w-full border gap-10 px-4 rounded-lg"
      >
        <TextInput
          value={password}
          className="flex-1"
          placeholder="Enter password"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={!passVisible}
          autoCapitalize="none"
          onChangeText={(password) => setPassword(password)}
        />
        <Pressable
          onPress={() => {
            setPassVisible(!passVisible);
          }}
        >
          <Ionicons
            name={passVisible ? "eye-outline" : "eye-off-outline"}
            color={COLORS.textLight}
            size={22}
          />
        </Pressable>
      </View>
      {errors.fields.password && (
        <Text style={styles.error}>{errors.fields.password.message}</Text>
      )}

      <TouchableOpacity
        style={{ backgroundColor: COLORS.primary }}
        className="w-full justify-center items-center py-4 rounded-xl mt-3"
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text className="color-white">Sign Up</Text>
      </TouchableOpacity>
      {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
      {/* {errors && (
        <Text style={styles.debug}>{JSON.stringify(errors, null, 2)}</Text>
      )} */}

      <View className="flex-row">
        <Text style={{ color: COLORS.textLight }}>Dont have an account? </Text>
        <Link href="/">
          <Text style={{ color: COLORS.text }} className="font-bold">
            Sign up
          </Text>
        </Link>
      </View>

      {/* Required for sign-up flows on Expo web if your application uses legacy bot sign-up protection.
      Clerk skips the browser CAPTCHA on iOS and Android.
      See https://clerk.com/docs/guides/secure/legacy-bot-protection */}
      <View nativeID="clerk-captcha" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
    alignItems: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: -8,
  },
  debug: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 8,
  },
});
