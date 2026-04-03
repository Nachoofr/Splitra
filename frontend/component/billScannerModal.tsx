import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { billScanApi, BillScanResult } from '../app/api/billScanApi';

interface BillScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (result: BillScanResult) => void;
}

const BillScannerModal = ({
  visible,
  onClose,
  onScanComplete,
}: BillScannerModalProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<BillScanResult | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      setResult(null);
      await scanImage(
        `data:image/jpeg;base64,${picked.assets[0].base64}`,
        picked.assets[0].mimeType ?? 'image/jpeg'
      );
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }
    const photo = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });
    if (!photo.canceled && photo.assets[0]) {
      setImageUri(photo.assets[0].uri);
      setResult(null);
      await scanImage(
        `data:image/jpeg;base64,${photo.assets[0].base64}`,
        'image/jpeg'
      );
    }
  };

  const scanImage = async (base64: string, mimeType: string) => {
    try {
      setScanning(true);
      const scanResult = await billScanApi.scanBill(base64, mimeType);
      setResult(scanResult);
      if (!scanResult.success) {
        Alert.alert('Scan Failed', scanResult.errorMessage ?? 'Unknown error');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to scan bill. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleUseResult = () => {
    if (result) {
      onScanComplete(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setImageUri(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-primary">
        <View className="flex-row items-center px-6 pt-14 pb-6">
          <Pressable
            onPress={handleClose}
            className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <View className="ml-4">
            <Text className="text-white text-2xl font-semibold">Scan Bill</Text>
            <Text className="text-[#CAD5E2] text-base mt-1">
              Extract expense details automatically
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        >
          <View className="flex-row gap-4 mb-6">
            <Pressable
              onPress={handleTakePhoto}
              className="flex-1 bg-white rounded-3xl p-5 items-center shadow-sm"
            >
              <Ionicons name="camera" size={36} color="#101828" />
              <Text className="text-gray-900 font-semibold mt-2">Camera</Text>
            </Pressable>
            <Pressable
              onPress={handlePickImage}
              className="flex-1 bg-white rounded-3xl p-5 items-center shadow-sm"
            >
              <Ionicons name="image" size={36} color="#101828" />
              <Text className="text-gray-900 font-semibold mt-2">Gallery</Text>
            </Pressable>
          </View>

          {imageUri && (
            <View className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm">
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 240 }}
                resizeMode="cover"
              />
            </View>
          )}

          {scanning && (
            <View className="bg-white rounded-3xl p-8 items-center mb-6 shadow-sm">
              <ActivityIndicator size="large" color="#101828" />
              <Text className="text-gray-700 font-semibold text-lg mt-4">
                Analyzing bill...
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Extracting details
              </Text>
            </View>
          )}

          {result && result.success && (
            <View className="bg-white rounded-3xl p-6 shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Scan Result
              </Text>

              <InfoRow label="Merchant" value={result.merchantName} />
              <InfoRow
                label="Total"
                value={`NPR ${result.totalAmount?.toFixed(2) ?? '0.00'}`}
              />
              <InfoRow label="Date" value={result.date ?? 'Not found'} />
              <InfoRow label="Category" value={result.suggestedCategory} />

              {result.items.length > 0 && (
                <View className="mt-4">
                  <Text className="text-gray-500 text-sm font-semibold mb-2">
                    ITEMS
                  </Text>
                  {result.items.map((item, i) => (
                    <View
                      key={i}
                      className="flex-row justify-between py-2 border-b border-gray-100"
                    >
                      <Text className="text-gray-800 flex-1">
                        {item.name}
                        {item.quantity > 1 ? ` x${item.quantity}` : ''}
                      </Text>
                      <Text className="text-gray-600">
                        NPR {item.totalPrice?.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {result?.success && (
          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200">
            <Pressable
              onPress={handleUseResult}
              className="bg-primary py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Use These Details
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-3 border-b border-gray-100">
    <Text className="text-gray-500 text-sm">{label}</Text>
    <Text className="text-gray-900 font-medium text-sm flex-1 text-right ml-4">
      {value}
    </Text>
  </View>
);

export default BillScannerModal;