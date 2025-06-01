import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// You'll likely need these icon libraries:
// expo install @expo/vector-icons
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Dummy Data for Task Details
const taskDetails = {
  id: "task-2", // Corresponds to the task from the previous screen example
  title: "Prepare Pitch for Investor Meeting",
  description: "Need to finalize financials",
  status: { label: "Pending", icon: "trophy", color: "#FFA500" }, // Example status
  workingWith: {
    name: "Sarah Patel",
    company: "Alpha Ventures",
    details: "Investor, Alpha Ventures",
  },
  company: "Alpha Ventures",
  contact: "sarah@alphaventures.com",
  taskNotes: [
    { text: "Need to finalize financial projections", emoji: "💰" },
    {
      text: "Add case studies for credibility",
      icon: { name: "chart-bar", Component: FontAwesome, color: "#000" },
    }, // Example using icon component
    { text: "Review pitch deck before March 6" },
  ],
  attachments: [
    {
      label: "[Google Slides Link]",
      url: "https://docs.google.com/presentation/d/...",
    },
    {
      label: "[Financial Report PDF]",
      url: "https://docs.google.com/document/d/...",
    },
  ],
  remindersUpdates: [
    {
      type: "reminder",
      text: "Reminder set for March 6 at 10:00 AM",
      editable: true,
      icon: { name: "bell", Component: Feather, color: "#FFD700" },
    }, // Example reminder
    {
      type: "update",
      text: "Awaiting input from financial team",
      icon: { name: "checkbox-outline", Component: Ionicons, color: "#000" },
    }, // Example update/status
  ],
};

// Helper component for sections with icon and text
const DetailSection = ({
  iconName,
  iconLib: IconComponent,
  iconColor = "#000",
  label,
  value,
}) => (
  <View style={styles.detailSection}>
    <View style={styles.detailIconContainer}>
      <IconComponent name={iconName} size={16} color={iconColor} />
    </View>
    <Text style={styles.detailLabel}>{label}: </Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Helper component for note items
const NoteItem = ({ note }) => (
  <View style={styles.noteItem}>
    <Text style={styles.noteBullet}>•</Text>
    <Text style={styles.noteText}>
      {note.text}
      {note.emoji && <Text style={styles.noteEmoji}> {note.emoji}</Text>}
      {note.icon && note.icon.Component && (
        <note.icon.Component
          name={note.icon.name}
          size={14} // Adjust size to fit text line
          color={note.icon.color}
          style={{ marginLeft: 4 }}
        />
      )}
    </Text>
  </View>
);

const TaskDetailScreen = () => {
  const handleClose = () => {
    console.log("Close Button Pressed");
    // Implement closing the modal or navigating back
  };

  const handleEdit = () => {
    console.log("Edit Button Pressed");
    // Implement navigation to edit task screen
  };

  const handleAttachmentPress = async (url) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
        // Optionally show an alert
      }
    }
  };

  const handleReminderEditPress = () => {
    console.log("Edit Reminder Pressed");
    // Implement editing reminder
  };

  return (
    <View style={styles.overlayContainer}>
      {/* Optional: Grab Handle */}
      <View style={styles.grabHandle} />

      <ScrollView
        style={styles.modalContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <Ionicons name="close-outline" size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateButtonText}>March 6</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <Feather name="edit-3" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Task Title and Description */}
        <Text style={styles.taskTitle}>{taskDetails.title}</Text>
        <Text style={styles.taskDescription}>{taskDetails.description}</Text>

        {/* Detail Sections */}
        <DetailSection
          iconName="trophy"
          iconLib={Feather} // Or MaterialCommunityIcons 'trophy'
          label="Status"
          value={taskDetails.status.label}
          iconColor={taskDetails.status.color}
        />
        {taskDetails.workingWith && (
          <DetailSection
            iconName="person-outline"
            iconLib={Ionicons}
            label="Working With"
            value={`${taskDetails.workingWith.name} (${taskDetails.workingWith.details})`}
          />
        )}
        {taskDetails.company && (
          <DetailSection
            iconName="document-outline"
            iconLib={Ionicons} // Or Feather 'file'
            label="Company"
            value={taskDetails.company}
          />
        )}
        {taskDetails.contact && (
          <DetailSection
            iconName="call-outline"
            iconLib={Ionicons} // Or Feather 'phone'
            label="Contact"
            value={taskDetails.contact}
          />
        )}

        {/* Task Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="edit"
              size={18}
              color="#555"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Task Notes</Text>
          </View>
          <View style={styles.notesList}>
            {taskDetails.taskNotes.map((note, index) => (
              <NoteItem key={index} note={note} />
            ))}
          </View>
        </View>

        {/* Attachments Section */}
        {taskDetails.attachments && taskDetails.attachments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather
                name="paperclip"
                size={18}
                color="#555"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Attachments</Text>
            </View>
            <View style={styles.attachmentsList}>
              {taskDetails.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAttachmentPress(attachment.url)}
                >
                  <Text style={styles.attachmentLink}>{attachment.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reminders & Updates Section */}
        {taskDetails.remindersUpdates &&
          taskDetails.remindersUpdates.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                {/* Use a relevant icon - Bell or Warning */}
                <Feather
                  name="bell"
                  size={18}
                  color="#FFA500"
                  style={styles.sectionIcon}
                />{" "}
                {/* Example: Orange Bell */}
                <Text style={styles.sectionTitle}>Reminders & Updates</Text>
              </View>
              <View style={styles.remindersList}>
                {taskDetails.remindersUpdates.map((item, index) => (
                  <View key={index} style={styles.reminderItem}>
                    {item.icon && item.icon.Component && (
                      <item.icon.Component
                        name={item.icon.name}
                        size={18}
                        color={item.icon.color}
                        style={{ marginRight: 8, marginTop: 2 }}
                      />
                    )}
                    <Text style={styles.reminderText}>{item.text}</Text>
                    {item.editable && (
                      <TouchableOpacity
                        onPress={handleReminderEditPress}
                        style={{ marginLeft: 8 }}
                      >
                        <Feather name="edit-3" size={16} color="#555" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Background color visible behind the modal
    justifyContent: "flex-end", // Align modal to the bottom
  },
  grabHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10, // Space above the modal content
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20, // Rounded top corners
    borderTopRightRadius: 20,
    padding: 16,
    flex: 1, // Take available height
    maxHeight: "90%", // Limit maximum height, adjust as needed
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconButton: {
    padding: 8, // Increase tappable area
  },
  dateButton: {
    backgroundColor: "#000", // Black background
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  detailSection: {
    flexDirection: "row",
    alignItems: "flex-start", // Align icon and text nicely
    marginBottom: 10,
  },
  detailIconContainer: {
    width: 25, // Fixed width for icon area
    alignItems: "center",
    marginRight: 8,
    marginTop: 2, // Adjust vertical alignment with text
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  detailValue: {
    fontSize: 14,
    color: "#555",
    flexShrink: 1, // Allow text to wrap
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notesList: {
    paddingLeft: 15, // Indent notes
  },
  noteItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  noteBullet: {
    marginRight: 5,
    fontSize: 14,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    flex: 1, // Allow text to wrap
  },
  noteEmoji: {
    fontSize: 14, // Ensure emoji size matches text
  },
  attachmentsList: {
    paddingLeft: 15, // Indent attachments
  },
  attachmentLink: {
    fontSize: 14,
    color: "#007AFF", // Blue link color
    textDecorationLine: "underline",
    marginBottom: 5,
  },
  remindersList: {
    paddingLeft: 15, // Indent reminders
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Align icon and text nicely
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: "#555",
    flex: 1, // Allow text to wrap
  },
});

export default TaskDetailScreen;
