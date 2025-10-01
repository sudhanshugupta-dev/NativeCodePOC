// native-modules/BatteryModule.ts
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

export default {
  getBatteryInfo: (): Promise<BatteryInfo> => DeviceInfoModule.getBatteryInfo(),
  getStorageInfo: (): Promise<StorageInfo> => DeviceInfoModule.getStorageInfo(),
  getMemoryInfo: (): Promise<MemoryInfo> => DeviceInfoModule.getMemoryInfo(),
  getDeviceInfo: (): Promise<DeviceInfo> => DeviceInfoModule.getDeviceInfo(),
};