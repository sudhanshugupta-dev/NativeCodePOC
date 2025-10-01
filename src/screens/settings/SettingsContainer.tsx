// import React from 'react';
// import SettingsView from './SettingsView';
// import { useSettingsViewModel } from '../../features/settings/SettingsViewModel';

// const SettingsContainer = () => {
//   const viewModel = useSettingsViewModel();

//   return (
//     <SettingsView
//       settings={viewModel.settings}
//       onToggleSetting={viewModel.toggleSetting}
//       onSaveSettings={viewModel.saveSettings}
//     />
//   );
// };

// export default SettingsContainer;


// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
// import batteryModule, { BatteryInfo } from '../../native_modules/BatteryModule';

// const statusMap: Record<number, string> = {
//   1: 'UNKNOWN',
//   2: 'CHARGING',
//   3: 'DISCHARGING',
//   4: 'NOT_CHARGING',
//   5: 'FULL',
// };

// const SettingsContainer = () => {
//   const [info, setInfo] = useState<BatteryInfo>({
//     level: -1, status: 1, health: -1, temperature: -1, plugged: -1
//   });

//   useEffect(() => {
//     let cleanup: (() => void) | undefined;
//     batteryModule.getBatteryInfo().then(setInfo).catch(() => {});
//     cleanup = batteryModule.addListener((i) => setInfo(i));
//     return () => cleanup && cleanup();
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Device Health Dashboard</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>Battery Level</Text>
//         <View style={styles.barBg}>
//           <View style={[styles.barFill, { width: `${Math.max(0, info.level)}%` }]} />
//         </View>
//         <Text style={styles.big}>{info.level}%</Text>
//       </View>

//       <View style={styles.row}>
//         <View style={styles.smallCard}>
//           <Text style={styles.label}>Status</Text>
//           <Text style={styles.bigSmall}>{statusMap[info.status] ?? info.status}</Text>
//         </View>
//         <View style={styles.smallCard}>
//           <Text style={styles.label}>Temp</Text>
//           <Text style={styles.bigSmall}>
//             {info.temperature >= 0 ? `${info.temperature.toFixed(1)}°C` : '—'}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.label}>Raw</Text>
//         <Text>Health: {info.health}</Text>
//         <Text>Plugged: {info.plugged}</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
//   card: { padding: 12, borderRadius: 10, backgroundColor: '#f6f6f6', marginBottom: 12 },
//   label: { fontSize: 12, color: '#666' },
//   big: { fontSize: 36, fontWeight: '700', marginTop: 8 },
//   row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
//   smallCard: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#f0f0f0' },
//   bigSmall: { fontSize: 18, fontWeight: '700', marginTop: 8 },
//   barBg: { height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, marginTop: 8, overflow: 'hidden' },
//   barFill: { height: 12, borderRadius: 6, backgroundColor: '#4caf50' }
// });



// export default SettingsContainer;


import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import batteryModule, { BatteryInfo } from "../../native_modules/BatteryModule";
import DeviceInfoModule from "../../native_modules/DeviceModule";

const statusMap: Record<number, string> = {
  1: "UNKNOWN",
  2: "CHARGING",
  3: "DISCHARGING",
  4: "NOT_CHARGING",
  5: "FULL",
};

export default function SettingsContainer() {
  const [battery, setBattery] = useState<BatteryInfo>({
    level: -1,
    status: 1,
    health: -1,
    temperature: -1,
    plugged: -1,
  });
  const [storage, setStorage] = useState<any>(null);
  const [memory, setMemory] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);

  useEffect(() => {
    // 🔋 Battery
    batteryModule.getBatteryInfo().then(setBattery).catch(() => {});
    const cleanup = batteryModule.addListener((i) => setBattery(i));

    // 💾 Storage
    DeviceInfoModule.getStorageInfo().then(setStorage).catch(() => {});
    // 🧠 Memory
    DeviceInfoModule.getMemoryInfo().then(setMemory).catch(() => {});
    // 📱 Device
    DeviceInfoModule.getDeviceInfo().then(setDevice).catch(() => {});

    return () => cleanup && cleanup();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📊 Device Health Dashboard</Text>

        {/* 🔋 Battery */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Battery</Text>
          <Text style={styles.label}>Level</Text>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.max(0, battery.level)}%` },
              ]}
            />
          </View>
          <Text style={styles.big}>{battery.level}%</Text>

          <View style={styles.row}>
            <View style={styles.smallCard}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.bigSmall}>
                {statusMap[battery.status] ?? battery.status}
              </Text>
            </View>
            <View style={styles.smallCard}>
              <Text style={styles.label}>Temp</Text>
              <Text style={styles.bigSmall}>
                {battery.temperature >= 0
                  ? `${battery.temperature.toFixed(1)}°C`
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* 💾 Storage */}
        {storage && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Storage</Text>
            <Text style={styles.label}>
              Total: {(storage.total / 1e9).toFixed(2)} GB
            </Text>
            <Text style={styles.label}>
              Used: {(storage.used / 1e9).toFixed(2)} GB
            </Text>
            <Text style={styles.label}>
              Free: {(storage.free / 1e9).toFixed(2)} GB
            </Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFillOrange,
                  {
                    width: `${((storage.used / storage.total) * 100).toFixed(1)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* 🧠 Memory */}
        {memory && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Memory</Text>
            <Text style={styles.label}>
              Total: {(memory.total / 1e9).toFixed(2)} GB
            </Text>
            <Text style={styles.label}>
              Available: {(memory.available / 1e9).toFixed(2)} GB
            </Text>
            <Text style={styles.label}>
              Low Memory: {memory.lowMemory ? "Yes" : "No"}
            </Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFillBlue,
                  {
                    width: `${(
                      (memory.available / memory.total) *
                      100
                    ).toFixed(1)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* 📱 Device Info */}
        {device && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Device Info</Text>
            <Text style={styles.label}>Model: {device.model}</Text>
            <Text style={styles.label}>Brand: {device.brand}</Text>
            <Text style={styles.label}>
              Manufacturer: {device.manufacturer}
            </Text>
            <Text style={styles.label}>
              Android: {device.version} (API {device.apiLevel})
            </Text>
            <Text style={styles.label}>Hardware: {device.hardware}</Text>
            <Text style={styles.label}>Product: {device.product}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fafafa" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 14, color: "#555", marginTop: 4 },
  big: { fontSize: 36, fontWeight: "700", marginTop: 8 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  smallCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  bigSmall: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  barBg: {
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: { height: 12, borderRadius: 6, backgroundColor: "#4caf50" },
  barFillOrange: { height: 12, borderRadius: 6, backgroundColor: "#ff9800" },
  barFillBlue: { height: 12, borderRadius: 6, backgroundColor: "#2196f3" },
});
