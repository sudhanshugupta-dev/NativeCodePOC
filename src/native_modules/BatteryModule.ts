// native-modules/BatteryModule.ts
import { NativeModules, DeviceEventEmitter } from 'react-native';

const { BatteryModule } = NativeModules;

export type BatteryInfo = {
  level: number;
  status: number;
  health: number;
  temperature: number;
  plugged: number;
};

export default {
  getBatteryInfo: (): Promise<BatteryInfo> => BatteryModule.getBatteryInfo(),
  addListener: (cb: (info: BatteryInfo) => void) => {
    const sub = DeviceEventEmitter.addListener('BatteryUpdated', cb);
    return () => sub.remove();
  },
};
