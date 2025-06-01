import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// You'll likely need these icon libraries:
// expo install @expo/vector-icons
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Dummy Data for Dates
const dates = [
  { day: "Sun", date: 23, isSelected: false },
  { day: "Mon", date: 24, isSelected: false },
  { day: "Tue", date: 25, isSelected: false }, // Example of a non-selected Tuesday
  { day: "Tue", date: 26, isSelected: true }, // The selected date
  { day: "Wed", date: 27, isSelected: false },
  { day: "Thu", date: 28, isSelected: false },
  { day: "Fri", date: 1, isSelected: false },
  { day: "Sat", date: 2, isSelected: false },
  { day: "Sun", date: 3, isSelected: false },
  // Add more dates as needed
];

// Dummy Data for Tasks
const tasks = [
  {
    id: "task-1",
    title: "Finalized UI design for Startup 2",
    description: "Sent for review & feedback",
    assignees: [], // No assignees shown in screenshot for completed task
    company: "", // No company shown for completed task
    dueDate: "March 6",
    isCompleted: true,
  },
  {
    id: "task-2",
    title: "Prepare pitch for investor meeting",
    description: "Need to finalize financials",
    assignees: [
      "https://randomuser.me/api/portraits/men/4.jpg",
      "https://randomuser.me/api/portraits/men/5.jpg",
    ],
    company: "Company- Startup 1",
    dueDate: "March 6",
    isCompleted: false,
  },
  {
    id: "task-3",
    title: "Update LinkedIn profile with new project",
    description: "Add new portfolio links & testimonials",
    assignees: ["https://randomuser.me/api/portraits/men/6.jpg"],
    company: "Company- Startup 3",
    dueDate: "March 8",
    isCompleted: false,
  },
  // Add more tasks as needed
];

// Component to render a single task card

const TaskCard = ({ task }) => {
  const handleCardPress = () => {
    console.log(`Task Card Pressed: ${task.title}`);
    // Implement navigation to task details screen
  };

  const router = useRouter();
  const handleActionPress = () => {
    console.log(`Action button pressed for task: ${task.title}`);
    router.push("/(task-management)/task-details");
    // Implement the action for the arrow button
  };

  // Determine card background color
  const cardBackgroundColor = task.isCompleted ? "#D4EDE2" : "#fff"; // Greenish for completed, white otherwise
  // Determine text color for completed tasks (appears darker)
  const textColor = task.isCompleted ? "#333" : "#000";
  const secondaryTextColor = task.isCompleted ? "#555" : "#555"; // Example, adjust if needed

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: cardBackgroundColor }]}
      onPress={handleCardPress}
    >
      {task.isCompleted ? (
        // Completed Task View
        <View style={styles.completedTaskContent}>
          <View style={styles.completedTextContent}>
            <Text style={[styles.taskTitle, { color: textColor }]}>
              {task.title}
            </Text>
            <Text
              style={[styles.taskDescription, { color: secondaryTextColor }]}
            >
              {task.description}
            </Text>
          </View>
          <View style={styles.completedIconContainer}>
            <AntDesign name="checkcircle" size={30} color="black" />{" "}
            {/* Black checkmark on green background */}
          </View>
        </View>
      ) : (
        // Regular Task View
        <View style={styles.regularTaskContent}>
          <View style={styles.taskDetails}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
            {task.company ? (
              <Text style={styles.taskCompany}>{task.company}</Text>
            ) : null}
            {task.dueDate ? (
              <Text style={styles.taskDueDate}>Due Date: {task.dueDate}</Text>
            ) : null}
          </View>

          <View style={styles.taskRightSide}>
            {task.assignees && task.assignees.length > 0 && (
              <View style={styles.assigneesContainer}>
                {task.assignees.map((assignee, index) => (
                  <Image
                    key={index}
                    source={{ uri: assignee }}
                    style={[
                      styles.assigneeAvatar,
                      { marginLeft: index > 0 ? -10 : 0 }, // Overlap avatars
                    ]}
                  />
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionPress}
            >
              <Feather name="arrow-up-right" size={20} color="black" />{" "}
              {/* Or 'arrow-up-right' */}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TaskScreen = () => {
  const [selectedDate, setSelectedDate] = useState(
    dates.find((date) => date.isSelected)?.date || dates[0].date
  ); // State to manage selected date, defaulting to the one marked selected or the first

  // Function to handle date selection (optional, if you want interactivity)
  const handleDateSelect = (date) => {
    // You would typically update your task data based on the selected date here
    setSelectedDate(date);
    console.log(`Selected date: ${date}`);
    // In a real app, you'd refetch or filter tasks based on 'date'
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log("Menu Pressed")}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/7.jpg" }} // Replace with actual avatar URL
          style={styles.headerAvatar}
        />
      </View>

      {/* Date Picker Section */}
      <View style={styles.datePickerSection}>
        <View style={styles.datePickerHeader}>
          <Text style={styles.datePickerTitle}>Tuesday</Text>
          <Ionicons
            name="chevron-down-outline"
            size={20}
            color="black"
            style={{ marginTop: 4 }}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateListContainer}
        >
          {dates.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                item.isSelected && styles.selectedDateItem,
                item.date === selectedDate && styles.selectedDateItem, // Highlight based on state as well
              ]}
              onPress={() => handleDateSelect(item.date)} // Handle selection
            >
              <Text
                style={[
                  styles.dateDay,
                  item.isSelected && styles.selectedDateDay,
                  item.date === selectedDate && styles.selectedDateDay,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  item.isSelected && styles.selectedDateNumber,
                  item.date === selectedDate && styles.selectedDateNumber,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Light grey background
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40, // Space from top (status bar)
    marginBottom: 20,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make it round
  },
  datePickerSection: {
    backgroundColor: "#FFECD9", // Light peach color
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    // Add shadow
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 5,
  },
  dateListContainer: {
    // Styles for the ScrollView content
  },
  dateItem: {
    alignItems: "center",
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  selectedDateItem: {
    backgroundColor: "#fff", // White background for selected date
    // Add shadow for selected state
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  dateDay: {
    fontSize: 14,
    color: "#555",
  },
  selectedDateDay: {
    color: "#000", // Black text for selected day
    fontWeight: "bold",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  selectedDateNumber: {
    color: "#000", // Black text for selected date number
  },
  taskList: {
    paddingBottom: 20, // Add padding at the bottom of the list
  },
  taskCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    // Add shadow
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  // Styles for Completed Task Layout
  completedTaskContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedTextContent: {
    flex: 1, // Take available space
    marginRight: 10, // Space between text and icon
  },
  completedIconContainer: {
    // Styles for the checkmark container if needed
  },

  // Styles for Regular Task Layout
  regularTaskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskDetails: {
    flex: 1, // Take available space
    marginRight: 10, // Space between details and right side
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  taskCompany: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    fontStyle: "italic",
  },
  taskDueDate: {
    fontSize: 12,
    color: "#777",
  },
  taskRightSide: {
    alignItems: "flex-end", // Align items to the right
    justifyContent: "space-between", // Space between avatars and button
  },
  assigneesContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  assigneeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15, // Make it round
    borderWidth: 1, // Add a small border for separation
    borderColor: "#fff",
  },
  actionButton: {
    backgroundColor: "#e0e0e0", // Grey background circle
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8, // Space above the button
  },
});

export default TaskScreen;
