import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import DynamicList from "../../components/DynamicList";
import { fetchUsers } from "../../services/api";

const HomeContainer = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await fetchUsers();
      setUsers(result);
      setLoading(false);
    };
    loadUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
    const admins = users.filter((u) => u.type === "admin");
  const members = users.filter((u) => u.type === "member");
  const guests = users.filter((u) => u.type === "guest");

  return (
 <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <DynamicList data={members} listType="grid" />
      </View>
      <View style={{ marginBottom: 16 }}>
        <DynamicList data={admins} listType="horizontal" />
      </View>
      <View style={{ marginBottom: 16 }}>
        <DynamicList data={guests} listType="vertical" />
      </View>
    </ScrollView>
);
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HomeContainer;
