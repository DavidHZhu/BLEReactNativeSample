/* eslint-disable no-bitwise */
import base64 from 'react-native-base64';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {StepCountResponse} from '../../models/StepCountResponse';

var Buffer = require('buffer/').Buffer;

const NANOBLUE33_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb';
// const HEART_RATE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const OP_BLE_UUID_GPS = '38098fbb-6d25-499a-a6a0-fe2eb8c3d2d3';
const OP_BLE_UUID_OPCOM = 'bad92b28-d3ec-4362-808b-8113286cc3e3';
const OP_BLE_UUID_RST = 'f8b6f810-0b8b-4dbd-9d2c-6acbd37b7d23';
const OP_BLE_UUID_HEIGHT = '1833619c-85a8-4133-91ab-3094fb475f81';
const OP_BLE_UUID_LOG = 'b9a32b56-b009-11ed-afa1-0242ac120002';
const OP_BLE_UUID_DISPSTEP = 'f5fa6ead-ea0e-41ac-9a2e-afc170e83763';
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
    // error: BleError | null,
    characteristic: Characteristic | null,
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    // if (error) {
    //   emitter({payload: error});
    // }
    console.log('TEST: ' + characteristic?.id);
    console.log('TEST: ' + characteristic?.uuid);
    console.log('TEST: ' + characteristic?.serviceID);
    console.log('TEST: ' + characteristic?.serviceUUID);

    console.log('TEST: ' + characteristic?.value);
    const data = base64.decode(characteristic?.value ?? '');
    let heartRate: number = -1;
    console.log('---------------------DATA----------------:' + data);

    // const firstBitValue: number = (<any>data[0]) & 0x01;

    // if (firstBitValue === 0) {
    //   heartRate = data[1].charCodeAt(0);
    // } else {
    //   heartRate =
    //     Number(data[1].charCodeAt(0) << 8) + Number(data[2].charCodeAt(2));
    // }

    heartRate = parseInt(data);

    emitter({payload: heartRate});
  };

  startStreamingData = async (
    emitter: (arg0: {payload: number | BleError}) => void,
  ) => {
    await this.device?.discoverAllServicesAndCharacteristics();
    // this.device?.monitorCharacteristicForService(
    //   NANOBLUE33_SERVICE_UUID,
    //   HEART_RATE_CHARACTERISTIC,
    //   (error, characteristic) =>
    //     this.onHeartRateUpdate(error, characteristic, emitter),
    // );
    this.device
      ?.readCharacteristicForService(
        OP_BLE_UUID_OPCOM,
        WRITE_CHARACTERISTIC,
        // (error, characteristic) => {
        //   this.onHeartRateUpdate(error, characteristic, emitter);
        // }
      )
      .then(characteristic => {
        console.log('Characteristic: ' + characteristic.id);
        this.onHeartRateUpdate(characteristic, emitter);
      });
  };
  sendBLEWriteString = async (
    // emitter: (arg0: {payload: number | BleError}) => void,
    myValue: string,
  ) => {
    console.log('SEND BLE WRITE ' + myValue);
    await this.device?.discoverAllServicesAndCharacteristics();
    this.device
      ?.writeCharacteristicWithResponseForService(
        OP_BLE_UUID_OPCOM,
        OP_BLE_UUID_GPS,
        myValue,
      )
      .then(characteristic => {
        console.log('Characteristic: ' + characteristic.id);
        // this.onHeartRateUpdate(characteristic, emitter);
      });
  };

  sendBLEWriteReset = async () => {
    const buf = Buffer.alloc(1);
    buf.writeUint8(1);
    const output = buf.toString('base64');

    console.log('SENDING RESET');

    await this.device?.discoverAllServicesAndCharacteristics();
    this.device
      ?.writeCharacteristicWithResponseForService(
        OP_BLE_UUID_OPCOM,
        OP_BLE_UUID_RST,
        output,
      )
      .then(characteristic => {
        console.log('Characteristic: ' + characteristic.id);
      });
  };

  sendBLEWriteHeight = async (height: number) => {
    console.log('SEND BLE WRITE HEIGHT: ' + height);

    const buf = Buffer.alloc(8);
    buf.writeDoubleLE(height);
    const output = buf.toString('base64');

    await this.device?.discoverAllServicesAndCharacteristics();
    this.device
      ?.writeCharacteristicWithResponseForService(
        OP_BLE_UUID_OPCOM,
        OP_BLE_UUID_HEIGHT,
        output,
      )
      .then(characteristic => {
        console.log('Characteristic: ' + characteristic.id);
      });
  };

  sendBLEWriteDistancePerStep = async (dispstep: number) => {
    console.log('SEND BLE WRITE DISTANCE PER STEP: ' + dispstep);

    const buf = Buffer.alloc(8);
    buf.writeDoubleLE(dispstep);
    const output = buf.toString('base64');

    await this.device?.discoverAllServicesAndCharacteristics();
    this.device
      ?.writeCharacteristicWithResponseForService(
        OP_BLE_UUID_OPCOM,
        OP_BLE_UUID_DISPSTEP,
        output,
      )
      .then(Characteristic => {
        console.log('Characteristic: ' + Characteristic.id);
      });
  };

  getBLEStepLog = async () => {
    await this.device?.discoverAllServicesAndCharacteristics();
    return this.device
      ?.readCharacteristicForService(OP_BLE_UUID_OPCOM, OP_BLE_UUID_LOG)
      .then(characteristic => {
        const data = Buffer.from(base64.decode(characteristic?.value ?? ''));
        // maybe doing this wrong, need to test this
        const start_code: number = data.readUInt32LE();
        const step_count: number = data.readUInt32LE(4);
        const avg_acceleration: number = data.readFloatLE(8);

        const result: StepCountResponse = {
          session_code: start_code,
          step_count: step_count,
          avg_acceleration: avg_acceleration,
        };

        return result;
      });
  };
}

const bluetoothLeManager = new BluetoothLeManager();

export default bluetoothLeManager;
