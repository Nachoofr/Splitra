import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { settlementApi } from "../app/api/settelmentApi";
import type { EsewaPaymentRequest } from "../app/api/settelmentApi";

interface EsewaPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toName: string;
  toUserId: number;
  groupId: number;
  amount: number;
}

const EsewaPaymentModal = ({
  visible,
  onClose,
  onConfirm,
  toName,
  toUserId,
  groupId,
  amount,
}: EsewaPaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<EsewaPaymentRequest | null>(
    null,
  );
  const [showWebView, setShowWebView] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const data = await settlementApi.initiateEsewaPayment(
        groupId,
        toUserId,
        amount,
      );
      setPaymentData(data);
      setShowWebView(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to initiate eSewa payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const buildEsewaForm = (data: EsewaPaymentRequest) => {
    return `
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form">
            <input type="hidden" name="amount" value="${data.amount}" />
            <input type="hidden" name="tax_amount" value="${data.taxAmount}" />
            <input type="hidden" name="total_amount" value="${data.totalAmount}" />
            <input type="hidden" name="transaction_uuid" value="${data.transactionUuid}" />
            <input type="hidden" name="product_code" value="${data.productCode}" />
            <input type="hidden" name="product_service_charge" value="${data.productServiceCharge}" />
            <input type="hidden" name="product_delivery_charge" value="${data.productDeliveryCharge}" />
            <input type="hidden" name="success_url" value="${data.successUrl}" />
            <input type="hidden" name="failure_url" value="${data.failureUrl}" />
            <input type="hidden" name="signed_field_names" value="${data.signedFieldNames}" />
            <input type="hidden" name="signature" value="${data.signature}" />
          </form>
          <p>Redirecting to eSewa...</p>
        </body>
      </html>
    `;
  };

  const handleWebViewNavigation = async (url: string) => {
    if (url.includes("success") && paymentData) {
      setShowWebView(false);
      try {
        await settlementApi.verifyEsewaPayment(
          paymentData.productCode,
          paymentData.transactionUuid,
          paymentData.totalAmount,
        );
        Alert.alert("Success", "eSewa payment verified!", [
          { text: "OK", onPress: onConfirm },
        ]);
      } catch (err: any) {
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Payment verification failed.",
        );
      }
    } else if (url.includes("failure")) {
      setShowWebView(false);
      Alert.alert("Failed", "eSewa payment failed. Please try again.");
    }
  };

  if (showWebView && paymentData) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
          setPaymentData(null);
        }}
      >
        <View className="flex-1">
          <View className="flex-row items-center px-4 pt-14 pb-3 bg-white border-b border-gray-200">
            <Pressable
              onPress={() => {
                setShowWebView(false);
                setPaymentData(null);
              }}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-4"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">
              eSewa Payment
            </Text>
          </View>

          <WebView
            source={{ html: buildEsewaForm(paymentData) }}
            onNavigationStateChange={(navState) => {
              handleWebViewNavigation(navState.url);
            }}
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#60BB46" />
              </View>
            )}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-900">
              Pay with eSewa
            </Text>
            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </Pressable>
          </View>

          <View className="bg-green-50 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-700 font-bold text-base">
                  {toName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs">Paying to</Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {toName}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">Amount</Text>
              <Text className="text-2xl font-bold text-gray-900">
                NPR {amount.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-2 mb-6 bg-blue-50 rounded-2xl p-4">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#3B82F6"
            />
            <Text className="text-blue-600 text-sm flex-1">
              You will be redirected to eSewa to complete the payment inside the
              app.
            </Text>
          </View>

          <Pressable
            onPress={handlePay}
            disabled={loading}
            className="bg-[#60BB46] rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="white"
                />
                <Text className="text-white text-lg font-bold">
                  Pay NPR {amount.toFixed(2)} with eSewa
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default EsewaPaymentModal;
