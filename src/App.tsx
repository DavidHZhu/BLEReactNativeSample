/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {FC, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, TextInput} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import CTAButton from './components/CTAButton';
import DeviceModal from './components/DeviceConnectionModal';
import {BluetoothPeripheral} from './models/BluetoothPeripheral';
import {
  initiateConnection,
  scanForPeripherals,
  startHeartRateScan,
} from './modules/Bluetooth/bluetooth.reducer';
import {RootState, store} from './store/store';
import bluetoothLeManager from './modules/Bluetooth/BluetoothLeManager';
import RNLocation from 'react-native-location';
import base64 from 'react-native-base64';

// RNLocation.configure({
//  distanceFilter: null
// });
var Buffer = require('buffer/').Buffer
const App: FC = () => {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
};

const Home: FC = () => {
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [latitude, setLatitude] = useState(0 || null)
  const [longitude, setLongitude] = useState(0 || null)
  const devices = useSelector(
    (state: RootState) => state.bluetooth.availableDevices,
  );

  const heartRate = useSelector(
    (state: RootState) => state.bluetooth.heartRate,
  );

  const isConnected = useSelector(
    (state: RootState) => !!state.bluetooth.connectedDevice,
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const closeModal = () => setIsModalVisible(false);

  const connectToPeripheral = (device: BluetoothPeripheral) =>
    dispatch(initiateConnection(device.id));
  
  const getLocation = async () => {
  
    let permission = await RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse' // or 'fine'
      }
    });
  
    console.log(permission)

    let location;
    if(!permission) {
      permission = await RNLocation.requestPermission({
        ios: "whenInUse",
        android: {
          detail: "coarse",
          rationale: {
            title: "We need to access your location",
            message: "We use your location to show where you are on the map",
            buttonPositive: "OK",
            buttonNegative: "Cancel"
          }
        }
      })
      console.log(permission)
      location = await RNLocation.getLatestLocation({timeout: 100})
      console.log(location)
      setLatitude(location?.latitude)
      setLongitude(location?.longitude)
      console.log(latitude, longitude)        
    } else {
      location = await RNLocation.getLatestLocation({timeout: 100})
      console.log(location?.latitude)
      setLatitude(location?.latitude)
      setLongitude(location?.longitude)
      console.log(latitude, longitude)
      const hexString = latitude.toString(16);
      console.log("hexstr:" , latitude)
      console.log("hexstr2:" , parseFloat(-32.1283, 10).toString(16))
      var view2 = new DataView(new ArrayBuffer(8));
      const getHex = i => ('00' + i.toString(16)).slice(-2);
      
      view2.setFloat64(0, longitude);
      //console.log(getHex(view2.getUint8(0)))
      let output = '';
      let tempVal = '';
      let tempNum = 0;
      let tempAscii = '';
      var buffer = [];
      for(var i = 0; i < 8; i++){
        // console.log(view2)
        // tempVal = "0x".concat(getHex(view2.getUint8(i)))
        // tempVal = "0x00"

        tempVal = ("00000000" + (parseInt(getHex(view2.getUint8(i)), 16)).toString(2)).substr(-8)
        console.log("tempVal: " + tempVal);
        buffer.push(tempVal);
        // convert to ascii
        // tempNum = Number(tempVal);
        // console.log("tempNum: " + tempNum)
        // output = output.concat(String.fromCharCode(tempNum));
        // output
        // output = output.concat(getHex(view2.getUint8(i)))
        // console.log(getHex(view2.getUint8(i)))
      }
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      console.log("len: " + len);
      let binary = '';
      for (var i = 0; i < len; i++) {
        console.log(i + ": " + bytes[i]);
        binary += String.fromCharCode(bytes[i]);
      }
      var usingNorm = base64.encode(binary);
      var usingFrom = Buffer.from(bytes).toString('base64');
      console.log("Binary: " + binary);
      console.log("Base 64: " + usingNorm);
      console.log("Using From: " + usingFrom);

      var decodeTest1 = base64.decode(usingNorm);
      var decodeTest2 = base64.decode(usingFrom);

      console.log("decode tests: 1: " + decodeTest1 + " 2: " + decodeTest2);

      console.log(output)//c05....
      console.log("Length: " + output.length)

      let output_test = '';
      for (var i = 0; i < output.length; i++) {
        output_test += output[i].charCodeAt(0).toString(2) + " ";
      }
      console.log("Binary rep: " + output_test);
      console.log(Buffer.byteLength(output, 'utf8'));
    }
  }

  const [myState, setMyState] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {isConnected ? (
          <>
            <Text style={styles.heartRateTitleText}>Your Pace Is:</Text>
            <Text style={styles.heartRateText}>{heartRate}</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Arduino Nano BLE 33 {count}
          </Text>
        )}
        {latitude && longitude && (
          <>
            <Text>Your Location Is</Text>
            <Text style={styles.heartRateText}>LAT: {latitude}</Text>
            <Text style={styles.heartRateText}>LONG: {longitude}</Text>
          </>
        )}
      </View>
      {isConnected && (<TextInput placeholder={'placeholder'} onChangeText={text => setMyState(text)} />)}
      <CTAButton
        title="Connect"
        onPress={() => {
          dispatch(scanForPeripherals());
          setCount(count + 1);
          setIsModalVisible(true);
        }}
      />
      {isConnected && (
        <CTAButton
          title="Get BLE Read"
          onPress={() => {
            dispatch(startHeartRateScan());
          }}
        />
      )}
      {isConnected && (
        <CTAButton
          title="BLE WRITE"
          onPress={() => {
            bluetoothLeManager.sendBLEWriteString(myState)
          }}
        />
      )}
      {true && (
        <CTAButton
          title="GET GPS LOCATION"
          onPress={() => {
            getLocation()
          }}
        />
      )}
      <DeviceModal
        devices={devices}
        visible={isModalVisible}
        closeModal={closeModal}
        connectToPeripheral={connectToPeripheral}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
});

export default App;
