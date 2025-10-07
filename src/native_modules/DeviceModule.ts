// // native-modules/BatteryModule.ts
// import { NativeModules } from 'react-native';


// type BatteryInfo = { level: number; status: string; temperature: number };
// type StorageInfo = { total: number; used: number; free: number };
// type MemoryInfo = { total: number; available: number; lowMemory: boolean };
// type DeviceInfo = {
//   brand: string;
//   manufacturer: string;
//   model: string;
//   hardware: string;
//   product: string;
//   version: string;
//   apiLevel: number;
// };

// const { DeviceInfoModule } = NativeModules;

// export default {
//   getBatteryInfo: (): Promise<BatteryInfo> => DeviceInfoModule.getBatteryInfo(),
//   getStorageInfo: (): Promise<StorageInfo> => DeviceInfoModule.getStorageInfo(),
//   getMemoryInfo: (): Promise<MemoryInfo> => DeviceInfoModule.getMemoryInfo(),
//   getDeviceInfo: (): Promise<DeviceInfo> => DeviceInfoModule.getDeviceInfo(),
// };


// native-modules/DeviceInfoModule.ts
import { NativeModules } from 'react-native';

type BatteryInfo = { level: number; status: string; temperature: number };
type StorageInfo = { total: number; used: number; free: number };
type MemoryInfo = { total: number; available: number; lowMemory: boolean };
type DeviceInfo = {
  brand: string;
  manufacturer: string;
  model: string;
  hardware: string;
  product: string;
  version: string;
  apiLevel: number;
};

const { DeviceInfoModule } = NativeModules;

// Caches
let cachedBattery: BatteryInfo | null = null;
let cachedStorage: StorageInfo | null = null;
let cachedMemory: MemoryInfo | null = null;
let cachedDevice: DeviceInfo | null = null;

export default {
  getBatteryInfo: async (): Promise<BatteryInfo> => {
    if (!cachedBattery) {
      cachedBattery = await DeviceInfoModule.getBatteryInfo();
    }
    return cachedBattery;
  },

  getStorageInfo: async (): Promise<StorageInfo> => {
    if (!cachedStorage) {
      cachedStorage = await DeviceInfoModule.getStorageInfo();
    }
    return cachedStorage;
  },

  getMemoryInfo: async (): Promise<MemoryInfo> => {
    if (!cachedMemory) {
      cachedMemory = await DeviceInfoModule.getMemoryInfo();
    }
    return cachedMemory;
  },

  getDeviceInfo: async (): Promise<DeviceInfo> => {
    if (!cachedDevice) {
      cachedDevice = await DeviceInfoModule.getDeviceInfo();
    }
    return cachedDevice;
  },

  // Optional: force refresh from native
  refreshBattery: async (): Promise<BatteryInfo> => {
    cachedBattery = await DeviceInfoModule.getBatteryInfo();
    return cachedBattery;
  },

  refreshStorage: async (): Promise<StorageInfo> => {
    cachedStorage = await DeviceInfoModule.getStorageInfo();
    return cachedStorage;
  },

  refreshMemory: async (): Promise<MemoryInfo> => {
    cachedMemory = await DeviceInfoModule.getMemoryInfo();
    return cachedMemory;
  },

  refreshDevice: async (): Promise<DeviceInfo> => {
    cachedDevice = await DeviceInfoModule.getDeviceInfo();
    return cachedDevice;
  },
};
