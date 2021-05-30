import base64 from 'react-native-base64';

import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Service,
} from 'react-native-ble-plx';

const HEART_RATE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

class BluetoothLeManager {
  bleManager: BleManager;
  device: Device | null;

  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
  }

  scanForPeripherals = (
    onDeviceFound: (arg0: {
      type: string;
      payload: BleError | Device | null;
    }) => void,
  ) => {
    this.bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      onDeviceFound({type: 'SAMPLE', payload: scannedDevice ?? error});
      return;
    });
    return () => {
      this.bleManager.stopDeviceScan();
    };
  };

  stopScanningForPeripherals = () => {
    this.bleManager.stopDeviceScan();
  };

  connectToPeripheral = async (identifier: string) => {
    this.device = await this.bleManager.connectToDevice(identifier);
  };

  onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    if (error) {
      emitter({payload: error});
    }

    const data = base64.decode(characteristic?.value);

    let heartRate: number = -1;
    const firstBitValue: number = data[0] & 0x01;

    if (firstBitValue === 0) {
      heartRate = data[1].charCodeAt(0);
    } else {
      heartRate =
        Number(data[1].charCodeAt(0) << 8) + Number(data[1].charCodeAt(2));
    }

    emitter({payload: heartRate});
  };

  startStreamingData = async (
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    await this.device?.discoverAllServicesAndCharacteristics();
    const allServices = (await this.device?.services()) ?? [];

    for (const service of allServices) {
      if (service.uuid === HEART_RATE_UUID) {
        const characteristics: Characteristic[] =
          await service.characteristics();
        for (const characteristic of characteristics) {
          if (characteristic.uuid === HEART_RATE_CHARACTERISTIC) {
            this.device?.monitorCharacteristicForService(
              service.uuid,
              characteristic.uuid,
              (error, characteristic) =>
                this.onHeartRateUpdate(error, characteristic, emitter),
            );
          }
        }
      }
    }
  };
}

const bluetoothLeManager = new BluetoothLeManager();

export default bluetoothLeManager;
