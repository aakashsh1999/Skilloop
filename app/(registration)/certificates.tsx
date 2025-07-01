"use client";

import ActionButton from "@/components/ActionButton"; // Custom button (for bottom of screen)
import PageHeader from "@/components/PageHeader"; // Top header bar
import QuestionHeader from "@/components/PageHeader/QuestionHeader";
import { useProfileStore } from "../../store/useProfileStore"; // Assuming correct path
import { useNavigation } from "@react-navigation/native"; // Assuming this is used for goBack
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import type React from "react";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import type { ViewStyle, TextStyle } from "react-native";

// --- Inline Custom Modal Button Component ---
interface ModalButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  isLoading?: boolean;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  isLoading = false,
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        modalButtonStyles.base,
        style,
        isButtonDisabled && modalButtonStyles.disabled,
      ]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[modalButtonStyles.textBase, textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const modalButtonStyles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  textBase: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

const CertificatesScreen = () => {
  const navigation = useNavigation();
  const {
    profile,
    addCertificate,
    removeCertificate,
    setCurrentStep,
    completeStep,
  } = useProfileStore();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    issueDate: "",
    documentUri: "", // Changed from imageUrl to documentUri
    documentName: "", // Added to store document name
    documentType: "", // Added to store document type (pdf, image, etc.)
    certificateUrl: "",
  });
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const isDialogFormValid =
    formData.title.trim() !== "" && formData.organization.trim() !== "";

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDocumentChange = async () => {
    setIsUploadingDocument(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*", // All image types
          "application/pdf", // PDF files
          "application/msword", // DOC files
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedDocument = result.assets[0];

        // Check file size (optional - limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (selectedDocument.size && selectedDocument.size > maxSize) {
          Alert.alert(
            "File Too Large",
            "Please select a file smaller than 10MB."
          );
          return;
        }

        setFormData({
          ...formData,
          documentUri: selectedDocument.uri,
          documentName: selectedDocument.name || "Unknown Document",
          documentType: selectedDocument.mimeType || "application/octet-stream",
        });
      }
    } catch (error) {
      console.error("Document selection error:", error);
      Alert.alert("Error", "Failed to select document.");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDateChange = (text: string) => {
    let cleanedText = text.replace(/[^0-9]/g, "");

    if (cleanedText.length > 2 && cleanedText.indexOf("/") === -1) {
      cleanedText =
        cleanedText.substring(0, 2) + "/" + cleanedText.substring(2);
    }

    if (cleanedText.length > 7) {
      cleanedText = cleanedText.substring(0, 7);
    }

    const parts = cleanedText.split("/");
    if (parts.length > 1 && parts[0].length === 2) {
      const month = Number.parseInt(parts[0], 10);
      if (month < 1 || month > 12) {
        // Invalid month validation can be added here
      }
    }

    setFormData({
      ...formData,
      issueDate: cleanedText,
    });
  };

  const handleAddCertificate = () => {
    if (!isDialogFormValid) {
      Alert.alert(
        "Required Fields",
        "Please provide a certificate title and issuing organization."
      );
      return;
    }

    const datePattern = /^(0[1-9]|1[0-2])\/(\d{4})$/;
    if (formData.issueDate && !datePattern.test(formData.issueDate)) {
      Alert.alert(
        "Invalid Date",
        "Please enter the issue date in MM/YYYY format."
      );
      return;
    }

    // Update the certificate data structure to include document info
    const certificateData = {
      ...formData,
      imageUrl: formData.documentUri, // Keep imageUrl for backward compatibility
      documentUri: formData.documentUri,
      documentName: formData.documentName,
      documentType: formData.documentType,
    };

    addCertificate(certificateData);

    // Reset form state
    setFormData({
      title: "",
      organization: "",
      issueDate: "",
      documentUri: "",
      documentName: "",
      documentType: "",
      certificateUrl: "",
    });
    setIsDialogOpen(false);
  };

  const handleRemoveCertificate = (id: string) => {
    Alert.alert(
      "Remove Certificate",
      "Are you sure you want to remove this certificate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeCertificate(id),
          style: "destructive",
        },
      ]
    );
  };

  const handleContinue = () => {
    completeStep(4);
    setCurrentStep(5);
    router.push("/(registration)/work-experience");
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    completeStep(4);
    setCurrentStep(5);
    router.push("/(registration)/work-experience");
  };

  // Helper function to determine if document is an image
  const isImageDocument = (mimeType: string) => {
    return mimeType && mimeType.startsWith("image/");
  };

  // Helper function to get document icon based on type
  const getDocumentIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return "📄";
    if (mimeType?.includes("word")) return "📝";
    if (mimeType?.startsWith("image/")) return "🖼️";
    return "📎";
  };

  const renderCertificateItem = ({ item }: { item: any }) => (
    <View style={styles.certificateItem}>
      <View style={styles.certificateDetails}>
        {item.documentUri ? (
          <View style={styles.documentPreview}>
            {isImageDocument(item.documentType) ? (
              <Image
                source={{ uri: item.documentUri }}
                style={styles.certificateImage}
              />
            ) : (
              <View style={styles.documentIcon}>
                <Text style={styles.documentIconText}>
                  {getDocumentIcon(item.documentType)}
                </Text>
              </View>
            )}
          </View>
        ) : null}
        <View style={styles.certificateTextContainer}>
          <Text style={styles.certificateTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.certificateOrgDate} numberOfLines={1}>
            {item.organization}
            {item.issueDate ? ` • ${item.issueDate}` : ""}
          </Text>
          {item.documentName && (
            <Text style={styles.documentName} numberOfLines={1}>
              📎 {item.documentName}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveCertificate(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={appStyles.fullScreenContainer}>
      <PageHeader currentStep={5} totalSteps={6} onBack={handleBack} />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionHeader
          title="Certificates"
          subtitle="Add your certificates and certifications to showcase your skills"
        />

        <TouchableOpacity
          onPress={() => setIsDialogOpen(true)}
          style={styles.addCertificateButton}
        >
          <Text style={styles.addCertificateButtonText}>+ Add Certificate</Text>
        </TouchableOpacity>

        {profile.certificates && profile.certificates.length > 0 && (
          <FlatList
            data={profile.certificates}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCertificateItem}
            contentContainerStyle={styles.certificatesList}
            scrollEnabled={false}
          />
        )}

        {profile.certificates && profile.certificates.length > 0 ? (
          <ActionButton onPress={handleContinue} fullWidth>
            Continue
          </ActionButton>
        ) : (
          <ActionButton
            onPress={handleSkip}
            fullWidth
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
          >
            Skip for now
          </ActionButton>
        )}
      </ScrollView>

      {/* Modal/Dialog for Add Certificate */}
      {isDialogOpen && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <Text style={styles.dialogTitle}>Add certificate</Text>

              <Text style={styles.inputLabel}>Certificate Title</Text>
              <TextInput
                placeholder="Eg., AWS Certified Developer"
                value={formData.title}
                onChangeText={(text) => handleChange("title", text)}
                style={styles.dialogInput}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Issuing Organization</Text>
              <TextInput
                placeholder="Eg., Amazon Web Services"
                value={formData.organization}
                onChangeText={(text) => handleChange("organization", text)}
                style={styles.dialogInput}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Issuing Date</Text>
              <TextInput
                placeholder="MM/YYYY"
                value={formData.issueDate}
                onChangeText={handleDateChange}
                style={styles.dialogInput}
                keyboardType="numbers-and-punctuation"
                maxLength={7}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Upload Document</Text>
              <TouchableOpacity
                onPress={handleDocumentChange}
                style={styles.uploadDocumentButton}
                disabled={isUploadingDocument}
              >
                {isUploadingDocument ? (
                  <ActivityIndicator color="#6B7280" />
                ) : (
                  <Text style={styles.uploadDocumentButtonText}>
                    + upload certificate document
                  </Text>
                )}
              </TouchableOpacity>

              {/* Document Preview */}
              {formData.documentUri ? (
                <View style={styles.documentPreviewContainer}>
                  {isImageDocument(formData.documentType) ? (
                    <Image
                      source={{ uri: formData.documentUri }}
                      style={styles.uploadedDocumentPreview}
                    />
                  ) : (
                    <View style={styles.uploadedDocumentInfo}>
                      <Text style={styles.documentTypeIcon}>
                        {getDocumentIcon(formData.documentType)}
                      </Text>
                      <Text style={styles.documentFileName}>
                        {formData.documentName}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Certificate url</Text>
              <TextInput
                placeholder="www.url.com"
                value={formData.certificateUrl}
                onChangeText={(text) => handleChange("certificateUrl", text)}
                style={styles.dialogInput}
                keyboardType="url"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.hintText}>to cross verify certificate</Text>

              <View style={styles.dialogButtons}>
                <ModalButton
                  onPress={() => setIsDialogOpen(false)}
                  style={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                >
                  Cancel
                </ModalButton>

                <ModalButton
                  onPress={handleAddCertificate}
                  style={styles.saveButton}
                  textStyle={styles.saveButtonText}
                  disabled={!isDialogFormValid}
                >
                  Save
                </ModalButton>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default CertificatesScreen;

const appStyles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    backgroundColor: "white",
    paddingBottom: 40,
  },
  addCertificateButton: {
    marginVertical: 20,
    alignSelf: "center",
    width: "90%",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  addCertificateButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  certificatesList: {
    paddingBottom: 20,
  },
  certificateItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  certificateDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 10,
  },
  documentPreview: {
    marginRight: 10,
  },
  certificateImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#DCDCDC",
    resizeMode: "cover",
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  documentIconText: {
    fontSize: 24,
  },
  certificateTextContainer: {
    flexShrink: 1,
  },
  certificateTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  certificateOrgDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  documentName: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#FF6347",
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  skipButton: {
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
    marginTop: 30,
  },
  skipButtonText: {
    color: "black",
  },
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dialogContent: {
    paddingBottom: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
    marginTop: 5,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    marginBottom: 15,
  },
  uploadDocumentButton: {
    marginVertical: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
  },
  uploadDocumentButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 16,
  },
  documentPreviewContainer: {
    marginVertical: 15,
    alignItems: "center",
  },
  uploadedDocumentPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  uploadedDocumentInfo: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  documentTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  documentFileName: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    fontWeight: "500",
  },
  hintText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
    marginTop: -12,
    marginBottom: 15,
    paddingRight: 5,
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelButton: {
    width: 100,
    marginRight: 8,
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
    borderRadius: 999,
  },
  cancelButtonText: {
    color: "black",
    fontSize: 16,
  },
  saveButton: {
    width: 100,
    backgroundColor: "black",
    borderColor: "black",
    borderRadius: 999,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
});
