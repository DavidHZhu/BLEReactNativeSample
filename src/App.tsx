/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, {FC, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity} from 'react-native';
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
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import base64 from 'react-native-base64';
import { inlineStyles } from 'react-native-svg';
import { toHtml } from '@fortawesome/fontawesome-svg-core';
import {
  Banner,
  Divider,
  IconButton
} from 'react-native-paper'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerPage} from './screens/DrawerContent'

// RNLocation.configure({
//  distanceFilter: null
// });
var Buffer = require('buffer/').Buffer;
const App: FC = () => {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
};

function sleep(ms) {
  // could be in a utils file
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Home: FC = () => {
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [latitude, setLatitude] = useState(0 || null);
  const [longitude, setLongitude] = useState(0 || null);
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
        detail: 'coarse', // or 'fine'
      },
    });

    console.log(permission);

    let location;
    if (!permission) {
      permission = await RNLocation.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'coarse',
          rationale: {
            title: 'We need to access your location',
            message: 'We use your location to show where you are on the map',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        },
      });
      console.log(permission);
      location = await RNLocation.getLatestLocation({timeout: 100});
      console.log(location);
      setLatitude(location?.latitude);
      setLongitude(location?.longitude);
      console.log(latitude, longitude);
    } else {
      while (true) {
        location = await RNLocation.getLatestLocation({timeout: 100});
        console.log(location?.latitude);
        setLatitude(location?.latitude);
        setLongitude(location?.longitude);
        console.log(location?.latitude, location?.latitude);
        var buf = Buffer.alloc(16);
        buf.writeDoubleLE(location?.latitude);
        buf.writeDoubleLE(location?.latitude, 8);
        let output = buf.toString('base64');
        console.log('Lat' + buf.readDoubleLE() + ' Long' + buf.readDoubleLE(8));
        console.log('Output=' + output);
        console.log('Output Size=' + output.length);
        bluetoothLeManager.sendBLEWriteString(output);
        await sleep(5000);
      }
    }
  };

  function MapScreen() {
    return (
      <View>
        <Text>This is for checking map</Text>
        <Text>Here it is</Text>
      </View>
    );
  }

  function HomeScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <MaterialIcon name="run-fast" size={40}/>
        </View>
        <View style={{flexDirection: 'column'}}>
          <View style={{marginTop: 10, marginLeft: 15, marginRight: 15, borderBottomWidth: 2, borderBottomColor: '#F08080'}}>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 5, color: '#E9967A'}}>Duration</Text>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 10}}>00:00</Text>
          </View>
          <View style={{marginLeft: 15, marginRight: 15, borderBottomWidth: 2, borderBottomColor: '#F08080', flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-evenly'}}>
            <View>
              <Text style={{textAlign: 'center', fontSize: 25, marginBottom: 15, marginTop: 15, color: '#E9967A'}}>Current Pace</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 10}}>0</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 20}}>km/h</Text>
            </View>
            <View style={{height: '80%', width: 1.5, backgroundColor: '#F08080'}}></View>
            <View>
              <Text style={{textAlign: 'center', fontSize: 25, marginBottom: 15, marginTop: 15, color: '#E9967A'}}>Average Pace</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 10}}>0</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 20}}>km/h</Text>
            </View>
          </View>
          <View style={{marginTop: 15, marginBottom: 15}}>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 5, color: '#E9967A'}}>Distance</Text>
            <Text style={{textAlign: 'center', fontSize: 35}}>0 km</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 20}}>
          <View>
            <TouchableOpacity onPress={()=>{}} style={{backgroundColor: '#67AE33', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='play-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={()=>{}} style={{backgroundColor: '#67AE33', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='pause-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={()=>{}} style={{backgroundColor: '#E73415', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='stop-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
          </View>
        </View>
     {/*   <View style={styles.heartRateTitleWrapper}>
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
        {isConnected && (
          <TextInput
            placeholder={'placeholder'}
            onChangeText={text => setMyState(text)}
          />
        )}
        {true && (
          <TextInput
            placeholder={'placeholder'}
            onChangeText={text => setMyHeight(text)}
            style={styles.input}
          />
        )}*/}
        </SafeAreaView>
    );
  }
  const HomeStack = createNativeStackNavigator();
  const MapStack = createNativeStackNavigator();
  const SettingsDrawer = createDrawerNavigator();
  const BottomTab = createBottomTabNavigator();

  function TabScreen() {
    return (
      <BottomTab.Navigator initialRouteName='Home' screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveBackgroundColor: "lightblue",
        tabBarActiveBackgroundColor: "lightblue",
      }}>
        <BottomTab.Screen name="HomeTab" component={HomeStackScreen} options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({color, size}) => (
            <Icon
              name="home-sharp"
              color={color}
              size={size}
            />
          ),
        }}/>
        <BottomTab.Screen name="MapTab" component={MapStackScreen} options={{
          headerShown: false,
          tabBarLabel: "Map",
          tabBarIcon: ({color, size}) => (
            <MaterialIcon
              name="google-maps"
              color={color}
              size={30}
            />
          ),
        }}/>
      </BottomTab.Navigator>
    );
  }

  const MapStackScreen = ({navigation}) => (
    <MapStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#F08080' },
      headerTintColor: '#fff',
      headerTitleAlign: 'center'
    }}>
        <MapStack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            title: 'OpticPace',
            headerLeft: () => (
              <Icon.Button 
                name='settings'
                size={25}
                backgroundColor='#F08080'
                onPress={() => { navigation.openDrawer() }}
              />
            )}}/>
    </MapStack.Navigator>
  );

  const HomeStackScreen = ({navigation}) => (
    <HomeStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#F08080' },
      headerTintColor: '#fff',
      headerTitleAlign: 'center'
    }}>
        <HomeStack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            title: 'OpticPace',
            headerLeft: () => (
              <Icon.Button 
                name='settings'
                size={25}
                backgroundColor='#F08080'
                onPress={() => { navigation.openDrawer() }}
              />
            )}}/>
    </HomeStack.Navigator>
  );

  const [myState, setMyState] = useState('');
  const [myHeight, setMyHeight] = useState('');
  return (
    <NavigationContainer>
      <SettingsDrawer.Navigator initialRouteName='Home' drawerContent={ props => <DrawerPage {...props}/> }>
        <SettingsDrawer.Screen name="Home" component={TabScreen} options={{headerShown: false, headerTitle: 'Home'}}/>
      </SettingsDrawer.Navigator>
    </NavigationContainer>
    /*<SafeAreaView style={styles.container}>
      {isConnected && (
        <TextInput
          placeholder={'placeholder'}
          onChangeText={text => setMyState(text)}
        />
      )}
      {true && (
        <TextInput
          placeholder={'placeholder'}
          onChangeText={text => setMyHeight(text)}
          style={styles.input}
        />
      )}

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
            bluetoothLeManager.sendBLEWriteString(myState);
          }}
        />
      )}
      {true && (
        <CTAButton
          title="SEND HEIGHT"
          onPress={() => {
            // can move this to an actual function
            const height = parseFloat(myHeight);
            if (isNaN(height)) {
              console.log('Configure valid height!');
            } else {
              console.log('My height: ' + height);
              bluetoothLeManager.sendBLEWriteHeight(height);
            }
          }}
        />
      )}
      {isConnected && (
        <CTAButton
          title="RESET"
          onPress={() => {
            bluetoothLeManager.sendBLEWriteReset();
          }}
        />
      )}
      {true && (
        <CTAButton
          title="GET GPS LOCATION"
          onPress={() => {
            getLocation();
          }}
        />
      )}
      <DeviceModal
        devices={devices}
        visible={isModalVisible}
        closeModal={closeModal}
        connectToPeripheral={connectToPeripheral}
      />
    </SafeAreaView>*/
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
  input: {
    flex: 1,
    width: '80%',
    fontSize: 18,
    color: '#101010',
  },
  appName: {
    position: 'absolute',
    left: 129,
    fontSize: 25,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default App;
