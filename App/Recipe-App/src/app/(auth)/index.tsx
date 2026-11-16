import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passVisible, setPassVisible] = useState(false);

  const [pendingVerification, setPendingVerification] = useState(false);
  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.warn(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
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
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === "needs_client_trust") {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/device-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        setPendingVerification(true);
      }
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
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
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust" && pendingVerification) {
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
          {emailAddress}
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
          <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -8 }}>
            {errors.fields.code.message}
          </Text>
        )}
        <TouchableOpacity
          style={{ backgroundColor: COLORS.primary }}
          className="w-full justify-center items-center py-4 rounded-xl mt-3"
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text className="color-white">Sign In</Text>
        </TouchableOpacity>
        <Pressable
          onPress={() => {
            setPendingVerification(false);
            setCode("");
          }}
          className="mt-5"
        >
          <Text style={{ color: COLORS.text }} className="font-bold">
            Back to Sign In
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
    <View className="bg-white flex-1 pt-16 items-center px-10 gap-3">
      <View>
        <Image
          style={{ width: 300, height: 300 }}
          source={require("@/assets/images/i1.png")}
          resizeMode="cover"
        />
      </View>
      <Text style={{ color: COLORS.text }} className="font-bold text-3xl">
        Welcome Back
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
      {errors.fields.identifier && (
        <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -6 }}>
          {errors.fields.identifier.message}
        </Text>
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
        <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -6 }}>
          {errors.fields.password.message}
        </Text>
      )}
      <TouchableOpacity
        style={{ backgroundColor: COLORS.primary }}
        className="w-full justify-center items-center py-4 rounded-xl mt-4"
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text className="color-white">Continue</Text>
      </TouchableOpacity>
      {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
      {/* {errors && (
        <Text style={styles.debug}>{JSON.stringify(errors, null, 2)}</Text>
      )} */}
      <View className="flex-row">
        <Text style={{ color: COLORS.textLight }}>Dont have an account? </Text>
        <Link href="/sign-up">
          <Text style={{ color: COLORS.text }} className="font-bold">
            Sign up
          </Text>
        </Link>
      </View>
    </View>
  );
}
