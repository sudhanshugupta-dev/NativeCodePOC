// // native-modules/BatteryModule.ts
// import { NativeModules, DeviceEventEmitter } from 'react-native';

// const { BatteryModule } = NativeModules;

// export type BatteryInfo = {
//   level: number;
//   status: number;
//   health: number;
//   temperature: number;
//   plugged: number;
// };

// export default {
//   getBatteryInfo: (): Promise<BatteryInfo> => BatteryModule.getBatteryInfo(),
//   addListener: (cb: (info: BatteryInfo) => void) => {
//     const sub = DeviceEventEmitter.addListener('BatteryUpdated', cb);
//     return () => sub.remove();
//   },
// };



// native-modules/BatteryModule.ts
import { DeviceEventEmitter, NativeModules } from 'react-native';

const { BatteryModule } = NativeModules;

export type BatteryInfo = {
  level: number;
  status: number;
  health: number;
  temperature: number;
  plugged: number;
};

let cachedBatteryInfo: BatteryInfo | null = null;

export default {
  getBatteryInfo: async (): Promise<BatteryInfo> => {
    if (cachedBatteryInfo) return cachedBatteryInfo; // return cached
    const info: BatteryInfo = await BatteryModule.getBatteryInfo();
    cachedBatteryInfo = info; // cache it
    return info;
  },

  addListener: (cb: (info: BatteryInfo) => void) => {
    const sub = DeviceEventEmitter.addListener('BatteryUpdated', (info: BatteryInfo) => {
      cachedBatteryInfo = info; // update cache on events
      cb(info);
    });
    return () => sub.remove();
  },

  // Optional: force refresh from native
  refresh: async (): Promise<BatteryInfo> => {
    const info: BatteryInfo = await BatteryModule.getBatteryInfo();
    cachedBatteryInfo = info;
    return info;
  },
};
