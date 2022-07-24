/* eslint-disable no-bitwise */
import base64 from 'react-native-base64';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';

const NANOBLUE33_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb';
// const HEART_RATE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTIC = '00002a56-0000-1000-8000-00805f9b34fb';
const OP_BLE_UUID_GPS = "38098fbb-6d25-499a-a6a0-fe2eb8c3d2d3";
const OP_BLE_UUID_OPCOM = "bad92b28-d3ec-4362-808b-8113286cc3e3";
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
    console.log("TEST: " + characteristic?.id);
    console.log("TEST: " + characteristic?.uuid);
    console.log("TEST: " + characteristic?.serviceID);
    console.log("TEST: " + characteristic?.serviceUUID);

    console.log("TEST: " + characteristic?.value);
    const data = base64.decode(characteristic?.value ?? '');
    let heartRate: number = -1;
    console.log("---------------------DATA----------------:" + data);

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
    this.device?.readCharacteristicForService(
      OP_BLE_UUID_OPCOM,
      WRITE_CHARACTERISTIC,
      // (error, characteristic) => {
      //   this.onHeartRateUpdate(error, characteristic, emitter);
      // }
    ).then((characteristic) => {
      console.log("Characteristic: " + characteristic.id);
      this.onHeartRateUpdate(characteristic, emitter);
    })
  };
  sendBLEWriteString = async (
    // emitter: (arg0: {payload: number | BleError}) => void,
    myValue: string,
  ) => {
    console.log("SEND BLE WRITE " + myValue)
    console.log("BTOA:" + base64.encode(myValue))
    const base64value = "c05e855efa615a8e";
    const test = [192, 84, 34, 128, 46, 249, 232, 143]
    const test1 = ["c0", "5e", "85", "5e", "fa", "61", "5a", "8e"];

    var buffer = [];
    for (let i = 0; i < test1.length; i ++) {
      buffer.push(("00000000" + (parseInt(test1[i], 16)).toString(2)).substr(-8));
    }
    var bytes = new Uint8Array(buffer);

    var len = bytes.byteLength;
    console.log("len: " + len);
    let binary = '';
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    binary = binary.concat(binary);

    
    let testOutput = '';
    for(let i = 0; i < test.length; i++) {
      testOutput = testOutput.concat(String.fromCharCode(test[i]));
    }
    for(let i = 0; i < test.length; i++) {
      testOutput = testOutput.concat(String.fromCharCode(test[i]));
    }

    console.log("Sending: " + testOutput);
    console.log("Base64encode: " + base64.encode(testOutput));
    console.log("Length: " + base64.encode(testOutput).length);
    
    testOutput = "AAAAAAAAAAAAAAAA";
    await this.device?.discoverAllServicesAndCharacteristics();
    this.device?.writeCharacteristicWithResponseForService(
      OP_BLE_UUID_OPCOM,
      OP_BLE_UUID_GPS,
      // base64.encode(testOutput)
      base64.encode(binary)
      // testOutput
    ).then((characteristic) => {
      console.log("Characteristic: " + characteristic.id);
      // this.onHeartRateUpdate(characteristic, emitter);
    })
  };

}

const bluetoothLeManager = new BluetoothLeManager();

export default bluetoothLeManager;
