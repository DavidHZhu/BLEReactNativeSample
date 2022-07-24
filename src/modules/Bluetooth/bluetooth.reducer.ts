import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BluetoothPeripheral} from '../../models/BluetoothPeripheral';

type BluetoothState = {
  availableDevices: Array<BluetoothPeripheral>;
  isConnectingToDevice: boolean;
  connectedDevice: string | null;
  heartRate: number;
  isRetrievingHeartRateUpdates: boolean;
  isScanning: boolean;
};

const initialState: BluetoothState = {
  availableDevices: [],
  isConnectingToDevice: false,
  connectedDevice: null,
  heartRate: 0,
  isRetrievingHeartRateUpdates: false,
  isScanning: false,
};

const bluetoothReducer = createSlice({
  name: 'bluetooth',
  initialState: initialState,
  reducers: {
    scanForPeripherals: state => {
      state.isScanning = true;
    },
    initiateConnection: (state, _) => {
      state.isConnectingToDevice = true;
    },
    connectPeripheral: (state, action) => {
      state.isConnectingToDevice = false;
      state.connectedDevice = action.payload;
    },
    updateHeartRate: (state, action) => {
      state.heartRate = action.payload;
    },
    startHeartRateScan: state => {
      state.isRetrievingHeartRateUpdates = true;
    },
    bluetoothPeripheralsFound: (
      state: BluetoothState,
      action: PayloadAction<BluetoothPeripheral>,
    ) => {
      // Ensure no duplicate devices are added
      const isDuplicate = state.availableDevices.some(
        device => device.id === action.payload.id,
      );
      console.log("----PAYLOAD FOUND-----:" + action.payload?.id);
      const isCorsenseMonitor = action.payload?.name
        ?.toLowerCase()
        ?.includes('opticpace');
      if (!isDuplicate
         && isCorsenseMonitor
         ) {
        state.availableDevices = state.availableDevices.concat(action.payload);
      }
    },
  },
});

export const {
  bluetoothPeripheralsFound,
  scanForPeripherals,
  initiateConnection,
  startHeartRateScan,
} = bluetoothReducer.actions;

export const sagaActionConstants = {
  SCAN_FOR_PERIPHERALS: bluetoothReducer.actions.scanForPeripherals.type,
  ON_DEVICE_DISCOVERED: bluetoothReducer.actions.bluetoothPeripheralsFound.type,
  INITIATE_CONNECTION: bluetoothReducer.actions.initiateConnection.type,
  CONNECTION_SUCCESS: bluetoothReducer.actions.connectPeripheral.type,
  UPDATE_HEART_RATE: bluetoothReducer.actions.updateHeartRate.type,
  START_HEART_RATE_SCAN: bluetoothReducer.actions.startHeartRateScan.type,
};

export default bluetoothReducer;
