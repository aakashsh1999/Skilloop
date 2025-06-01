import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface OtpModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  phone: string;
}

const OtpModal: React.FC<OtpModalProps> = ({
  visible,
  onClose,
  onVerify,
  phone,
}) => {
  const [otp, setOtp] = useState("");

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={otpStyles.modalBackground}>
        <View style={otpStyles.modalContainer}>
          <Text style={otpStyles.title}>Verify OTP</Text>
          <Text style={otpStyles.subtitle}>
            Enter the code sent to +91 {phone}
          </Text>
          <TextInput
            style={otpStyles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter OTP"
          />
          <View style={otpStyles.buttonGroup}>
            <TouchableOpacity
              style={otpStyles.button}
              onPress={() => onVerify(otp)}
            >
              <Text style={otpStyles.buttonText}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[otpStyles.button, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text style={otpStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const otpStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: "#ddd",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F5D0B5",
    borderRadius: 8,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#000",
  },
});

export default OtpModal;
