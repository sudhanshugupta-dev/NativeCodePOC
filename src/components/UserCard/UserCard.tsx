// import React, { useState } from "react";
// import {
//     Modal,
//     Pressable,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   company: string;
//   type: "admin" | "member" | "guest";
// };

// const UserCard = ({ user }: { user: User }) => {
//   const [modalVisible, setModalVisible] = useState(false);

//   const typeStyles = {
//     admin: { borderColor: "red", backgroundColor: "#ffe5e5" },
//     member: { borderColor: "blue", backgroundColor: "#e5f0ff" },
//     guest: { borderColor: "gray", backgroundColor: "#f2f2f2" },
//   };

//   return (
//     <>
//       <TouchableOpacity
//         style={[styles.card, typeStyles[user.type]]}
//         onPress={() => setModalVisible(true)}
//       >
//         <Text style={styles.name}>{user.name}</Text>
//         <Text style={styles.email}>{user.email}</Text>
//         <Text style={styles.type}>{user.type.toUpperCase()}</Text>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ScrollView>
//               <Text style={styles.modalTitle}>{user.name}</Text>
//               <Text style={styles.modalLabel}>Email:</Text>
//               <Text style={styles.modalText}>{user.email}</Text>

//               <Text style={styles.modalLabel}>Phone:</Text>
//               <Text style={styles.modalText}>{user.phone}</Text>

//               <Text style={styles.modalLabel}>Company:</Text>
//               <Text style={styles.modalText}>{user.company}</Text>

//               <Text style={styles.modalLabel}>Type:</Text>
//               <Text style={styles.modalText}>{user.type.toUpperCase()}</Text>
//             </ScrollView>

//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     padding: 20,
//     margin: 6,
//     borderRadius: 8,
//     borderWidth: 1,
//     minWidth: 150,
//   },
//   name: { fontSize: 16, fontWeight: "600" },
//   email: { fontSize: 12, color: "gray" },
//   type: { fontSize: 12, fontWeight: "bold", marginTop: 4 },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "85%",
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 20,
//     maxHeight: "80%",
//   },
//   modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
//   modalLabel: { fontSize: 14, fontWeight: "600", marginTop: 8 },
//   modalText: { fontSize: 14, color: "gray" },
//   closeButton: {
//     marginTop: 20,
//     backgroundColor: "#2196F3",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   closeButtonText: { color: "white", fontWeight: "600" },
// });

// export default UserCard;

import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from "react-native";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: "admin" | "member" | "guest";
  avatar?: string;
};

const UserCard = ({ user }: { user: User }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.7)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Play different sound per type
  const playSound = async () => {
    let soundFile;
    switch (user.type) {
      case "admin":
        soundFile = require("../../../assets/sound/music1.mp3");
        break;
      case "member":
        soundFile = require("../../../assets/sound/music2.mp3");
        break;
      case "guest":
        soundFile = require("../../../assets/sound/music3.mp3");
        break;
      default:
        return;
    }

    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  };

  const handlePress = () => {
    // Haptic feedback on press
    if (Platform.OS === "ios") {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate(20);
    }

    // Play sound
    playSound();

    // Card press animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, friction: 3, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Show modal
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      modalScale.setValue(0.7);
      modalOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [modalVisible]);

  const typeStyles = {
    admin: ["#ff9a9e", "#fad0c4"],
    member: ["#a1c4fd", "#c2e9fb"],
    guest: ["#d3d3d3", "#f2f2f2"],
  };

  return (
    <>
      {/* CARD */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableWithoutFeedback onPress={handlePress}>
         <LinearGradient colors={typeStyles[user.type]} style={styles.cardGradient}>
  <View style={styles.cardContent}>
    {user.avatar ? (
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
      </View>
    )}
    <Text style={styles.name}>{user.name}</Text>
    <Text style={styles.type}>{user.type.toUpperCase()}</Text>
  </View>
</LinearGradient>

        </TouchableWithoutFeedback>
      </Animated.View>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="none">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: modalOpacity }]}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <View style={styles.modalCenter}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }], opacity: modalOpacity }]}>
            <ScrollView>
              <Text style={styles.modalTitle}>{user.name}</Text>
              <Text style={styles.modalLabel}>Email:</Text>
              <Text style={styles.modalText}>{user.email}</Text>
              <Text style={styles.modalLabel}>Phone:</Text>
              <Text style={styles.modalText}>{user.phone}</Text>
              <Text style={styles.modalLabel}>Company:</Text>
              <Text style={styles.modalText}>{user.company}</Text>
              <Text style={styles.modalLabel}>Type:</Text>
              <Text style={styles.modalText}>{user.type.toUpperCase()}</Text>
            </ScrollView>

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardGradient: {
    padding: 16,
    margin: 6,
    borderRadius: 12,
    minWidth: 150,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cardContent: { alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffffaa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#333" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  type: { fontSize: 12, fontWeight: "bold", color: "#333" },

  modalCenter: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "85%", backgroundColor: "white", borderRadius: 16, padding: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  modalLabel: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  modalText: { fontSize: 14, color: "gray" },
  closeButton: { marginTop: 20, backgroundColor: "#2196F3", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  closeButtonText: { color: "white", fontWeight: "600" },
});

export default UserCard;
