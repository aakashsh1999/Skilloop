import { formatDate } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProfileStore } from "../../store/useProfileStore";

const CertificatesScreen = () => {
  const navigation = useNavigation();
  const {
    profile,
    addCertificate,
    removeCertificate,
    setCurrentStep,
    completeStep,
  } = useProfileStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    issueDate: "",
    imageUrl: "",
    certificateUrl: "",
  });
  // The imageFile state might not be needed if you only use imageUrl (base64)
  // but it's not causing a syntax error.
  // const [imageFile, setImageFile] = useState(null);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Specify media type
    });

    // ** --- FIX APPLIED HERE FOR EXPO IMAGEPICKER API --- **
    // Use result.canceled instead of result.cancelled
    // Access asset data from result.assets array
    if (!result.canceled) {
      // Check if assets array and the first asset exist
      const selectedAsset =
        result.assets && result.assets.length > 0 ? result.assets[0] : null;

      if (selectedAsset) {
        setFormData({
          ...formData,
          imageUrl: `data:image/jpeg;base64,${selectedAsset.base64}`,
        });
        // If you were using imageFile to display the original filename/uri
        // setImageFile(selectedAsset.uri);
      } else {
        // Handle case where no asset was selected despite not being cancelled
        console.log("Image selection failed or returned no assets.");
      }
    } else {
      // Handle the case where the user cancelled the picker
      console.log("Image picking cancelled");
    }
    // ** ------------------------------------------------- **
  };

  const handleAddCertificate = () => {
    if (!formData.title || !formData.organization) {
      Alert.alert(
        "Required Fields",
        "Please provide a certificate title and issuing organization at minimum."
      );
      return;
    }
    // Assuming addCertificate function in the store handles generating a unique ID
    addCertificate({
      ...formData,
    });
    setFormData({
      title: "",
      organization: "",
      issueDate: "",
      imageUrl: "",
      certificateUrl: "",
    });
    // setImageFile(null); // Reset imageFile state if used
    setIsDialogOpen(false);
  };

  const handleRemoveCertificate = (id) => {
    // Added confirmation for removing for better UX
    Alert.alert(
      "Remove Certificate",
      "Are you sure you want to remove this certificate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "OK", onPress: () => removeCertificate(id) },
      ]
    );
  };

  const router = useRouter();
  const handleContinue = () => {
    // This order is syntactically correct, but ensure store updates are fast
    completeStep(4);
    setCurrentStep(5);
    router.push("/(registration)/work-experience");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    completeStep(4);
    setCurrentStep(5);
    router.push("/(registration)/work-experience");
  };

  // Helper function to render each certificate item for FlatList
  const renderCertificateItem = ({ item }) => (
    <View
      style={{
        marginBottom: 12,
        padding: 10,
        backgroundColor: "#eee",
        borderRadius: 8,
        flexDirection: "row", // Arrange items horizontally
        alignItems: "center", // Align items vertically in the center
        justifyContent: "space-between", // Distribute space
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}
      >
        {/* Ensure imageUrl is a valid URI or base64 string */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} // Styled image
          />
        ) : null}
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontWeight: "bold", flexShrink: 1 }}>
            {item.title}
          </Text>
          <Text style={{ flexShrink: 1 }}>
            {item.organization}{" "}
            {item.issueDate ? `• ${formatDate(item.issueDate)}` : ""}{" "}
            {/* Conditionally render date */}
          </Text>
        </View>
      </View>
      <Button
        title="Remove"
        onPress={() => handleRemoveCertificate(item.id)}
        color="red" // Use red for remove button
      />
    </View>
  );

  return (
    <View style={{ padding: 16, flex: 1 }}>
      {" "}
      {/* Added flex: 1 */}
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
        Certificates
      </Text>
      <Text style={{ marginBottom: 16, color: "#555" }}>
        Add your certificates and certifications to showcase your skills and
        qualifications.
      </Text>
      <FlatList
        data={profile.certificates}
        keyExtractor={(item) => item.id} // Ensure unique 'id' from the store
        renderItem={renderCertificateItem}
        contentContainerStyle={{ paddingBottom: 20 }} // Add padding below the list
      />
      <TouchableOpacity
        onPress={() => setIsDialogOpen(true)}
        style={{
          marginVertical: 12,
          backgroundColor: "#ddd",
          padding: 12,
          borderRadius: 6,
          alignItems: "center",
        }}
      >
        <Text>+ Add Certificate</Text>
      </TouchableOpacity>
      {/* Navigation Buttons */}
      <View
        style={{
          marginTop: 20,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingTop: 10,
        }}
      >
        {profile.certificates && profile.certificates.length > 0 ? (
          <Button title="Continue" onPress={handleContinue} />
        ) : (
          <Button title="Skip for now" onPress={handleSkip} color="grey" />
        )}
        <View style={{ marginTop: 10 }}>
          <Button title="Back" onPress={handleBack} color="#555" />
        </View>
      </View>
      {isDialogOpen && (
        // Modal/Dialog overlay
        <View
          style={{
            position: "absolute", // Position over content
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", // Dim background
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 1000, // Ensure dialog is on top
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              width: "95%", // Responsive width
              maxHeight: "80%", // Limit height
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}
            >
              Add certificate
            </Text>

            <TextInput
              placeholder="Certificate Title *"
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 8,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Issuing Organization *"
              value={formData.organization}
              onChangeText={(text) => handleChange("organization", text)}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 8,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Issue Date (e.g., 01/2023)"
              value={formData.issueDate}
              onChangeText={(text) => handleChange("issueDate", text)}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 8,
                marginBottom: 12,
              }}
              keyboardType="numbers-and-punctuation"
            />

            <TouchableOpacity
              onPress={handleImageChange}
              style={{ marginVertical: 8, paddingVertical: 8 }}
            >
              <Text style={{ color: "blue" }}>Upload Certificate Image</Text>
            </TouchableOpacity>
            {/* Display uploaded image preview */}
            {formData.imageUrl ? (
              <Image
                source={{ uri: formData.imageUrl }}
                style={{
                  width: 80,
                  height: 80,
                  marginVertical: 8,
                  alignSelf: "center",
                }}
              />
            ) : null}
            {/* Removed imageFile filename display as imageUrl (base64) is used */}
            {/* {imageFile && <Text>{imageFile.split("/").pop()}</Text>} */}

            <TextInput
              placeholder="Certificate URL (Optional)"
              value={formData.certificateUrl}
              onChangeText={(text) => handleChange("certificateUrl", text)}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                paddingVertical: 8,
                marginBottom: 20,
              }}
              keyboardType="url"
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button
                title="Cancel"
                onPress={() => {
                  setIsDialogOpen(false);
                  // Optionally reset form data on cancel
                  // setFormData({ title: "", organization: "", issueDate: "", imageUrl: "", certificateUrl: "" });
                }}
                color="grey"
              />
              <View style={{ width: 8 }} />
              <Button title="Save" onPress={handleAddCertificate} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CertificatesScreen;
