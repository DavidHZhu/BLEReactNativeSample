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
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import CTAButton from './components/CTAButton';
import DeviceModal from './components/DeviceConnectionModal';
import {BluetoothPeripheral} from './models/BluetoothPeripheral';
import {StepCountResponse} from './models/StepCountResponse';
import {
  initiateConnection,
  scanForPeripherals,
  startHeartRateScan,
} from './modules/Bluetooth/bluetooth.reducer';
import {RootState, store} from './store/store';
import bluetoothLeManager from './modules/Bluetooth/BluetoothLeManager';
import RNLocation from 'react-native-location';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import base64 from 'react-native-base64';
import {inlineStyles} from 'react-native-svg';
import {toHtml} from '@fortawesome/fontawesome-svg-core';
import {Banner, Divider, IconButton} from 'react-native-paper';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {DrawerPage} from './screens/DrawerContent';
import AuthStackScreen from './screens/AuthenticationStack';
import GpsKalman from 'react-native-gps-kalman';

RNLocation.configure({
  desiredAccuracy: {
    ios: "best",
    android: "balancedPowerAccuracy"
  },
  interval: 1000
});
var Buffer = require('buffer/').Buffer;
var geolib = require('geolib');
var {KalmanFilter} = require('kalman-filter');
const kFilter = new KalmanFilter({
  observation: 2,
});
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
  const [isDuration, setIsDuration] = useState(true);
  const [isCurrentPace, setIsCurrentPace] = useState(true);
  const [isAveragePace, setIsAveragePace] = useState(true);
  const [isKilometers, setIsKilometers] = useState(true);
  const [buttonInfo, setButtonInfo] = React.useState({
    startButton: true,
    pauseButton: false,
    stopButton: false,
  });
  const [curr_distance, setCurrDistance] = useState(0);
  
  const [locationSubscription, setLocationSubscription] = useState(RNLocation.subscribeToLocationUpdates(locations => locations));

  let start: StepCountResponse | undefined = {
    session_code: 0,
    step_count: 0,
    avg_acceleration: 0.0
  };

  let curr_locations: any[] = [];
  let init_count = 0;
  let limit = 15;

  const toggleStartPauseButton = () => {
    setButtonInfo({
      startButton: !buttonInfo.startButton,
      pauseButton: !buttonInfo.pauseButton,
      stopButton:
        buttonInfo.stopButton === false ? true : buttonInfo.stopButton,
    });
  };
  const stopButton = () => {
    setButtonInfo({
      startButton: true,
      pauseButton: false,
      stopButton: false,
    });
  };
  const toggleDuration = () => {
    setIsDuration(!isDuration);
  };

  const toggleCurrentPace = () => {
    setIsCurrentPace(!isCurrentPace);
  };

  const toggleAveragePace = () => {
    setIsAveragePace(!isAveragePace);
  };

  const toggleKilometers = () => {
    setIsKilometers(!isKilometers);
  };

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

  const getGPSLocation = async () => {
    let permission = await RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse', // or 'fine'
      },
    });
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
    }

    start = await bluetoothLeManager.getBLEStepLog();

    console.log("Start Session!");

    GpsKalman.startSession();
    let x = RNLocation.subscribeToLocationUpdates(
      async locations => {
        // if we have a location
        // get distance => normalise?
        console.log("New Locations....:", locations[0].latitude, locations[0].longitude);
        if (start == undefined) {
          console.log("start undefined....");
          // refetch start 
          const new_start = await bluetoothLeManager.getBLEStepLog();

          init_count = 0;
          start = new_start;
        } else {
          // get end steps
          const end = await bluetoothLeManager.getBLEStepLog();
          if (end == undefined || start != undefined && start.session_code != end.session_code) {
            // session codes are different => different sessions, a reset happened inbetween
            console.log("end undefined....", end, start);
            start = end;
          } else {
            console.log("New Location:", locations[0]);
            console.log("start step: " + start.step_count);
            console.log("end step: " + end.step_count);
            if (curr_distance < 200) {
              const firstLoc = locations[0];
              const filteredLoc = await GpsKalman.process(firstLoc.latitude, firstLoc.longitude, firstLoc.altitude, firstLoc.timestamp);
              if (init_count >= limit) {
                curr_locations.push(filteredLoc);
                // const new_locations = [...curr_locations, filteredLoc];
                console.log("filtered Location:", filteredLoc.latitude, filteredLoc.longitude);
                console.log("Total Distance:" + geolib.getPathLength(curr_locations));
                setCurrDistance(geolib.getPathLength(curr_locations));
                // setCurrLocations(new_locations);
              } else {
                init_count += 1;
              }
            } else {
              // curr_distance is greater => send the distance
              console.log("Sending distance");
              const total_steps = end.step_count - start.step_count;
              const dispstep = total_steps != 0 ? curr_distance / total_steps : 0.0;
              bluetoothLeManager.sendBLEWriteDistancePerStep(dispstep);
              GpsKalman.startSession();
              init_count = 0;
              setCurrDistance(0);
              curr_locations = [];
              start = end;
            }
          }
        }
        
      }
    )

  }
    
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
      // while (true) {
      //   location = await RNLocation.getLatestLocation({timeout: 100});
      //   console.log(location?.latitude);
      //   setLatitude(location?.latitude);
      //   setLongitude(location?.longitude);
      //   console.log(location?.latitude, location?.latitude);
      //   var buf = Buffer.alloc(16);
      //   buf.writeDoubleLE(location?.latitude);
      //   buf.writeDoubleLE(location?.latitude, 8);
      //   let output = buf.toString('base64');
      //   console.log('Lat' + buf.readDoubleLE() + ' Long' + buf.readDoubleLE(8));
      //   console.log('Output=' + output);
      //   console.log('Output Size=' + output.length);
      //   bluetoothLeManager.sendBLEWriteString(output);
      //   await sleep(5000);
      // }
      // given a time window, calculate how much distance is covered
      // let's say in x seconds, fetching gps coords for every second
      // store gps coords and then at the end of this time window, compute the distance and send, rinse and repeat
      
      while (true) {
        const start = await bluetoothLeManager.getBLEStepLog();
        if (start == undefined) {
          // break? here, we have to stop though,
          continue;
        }
        console.log("Start steps:" + start.step_count);
        console.log('Starting poll....');
        GpsKalman.startSession();
        let distance_travelled = 0;
        setCurrDistance(distance_travelled);
        // prev, next => calculate distance then =>
        let end = undefined;
        let isNewSession = false;
        const curr_gps_data = [];
        while(distance_travelled < 200) {
          // pool 20 coords
          console.log("get location");
          await RNLocation.getLatestLocation({timeout: 1000}).then(
            location => {
              console.log(location);
            }
          )
          // for (let i = 0; i < 20; i++) {
          //   const curr_location = await RNLocation.getLatestLocation({
          //     timeout: 100,
          //   });
          //   if (curr_location != null) {
          //     // console.log(
          //     //   `Lat: ${curr_location.latitude}, Lon: ${curr_location.longitude}, Accuracy: ${curr_location.accuracy}, Timestamp: ${curr_location.timestamp}`,
          //     // );
          //     const filteredLoc = await GpsKalman.process(curr_location.latitude, curr_location.longitude, curr_location.altitude, curr_location.timestamp);
          //     // console.log(
          //     //   `Lat: ${curr_location.latitude}, Lon: ${curr_location.longitude}`,
          //     // );
          //     console.log(
          //         `Lat: ${filteredLoc.latitude}, Lon: ${filteredLoc.longitude}`,
          //       );
          //     // curr_gps_data.push(filteredLoc);
          //     curr_gps_data.push(filteredLoc);
          //   }
          //   // await sleep(1000);
          // }
          // distance_travelled = geolib.getPathLength(curr_gps_data);
          // // console.log("Distance segment:" + distance_segment);
          // console.log("Total distance:" + distance_travelled);
          // // distance_travelled = distance_segment;
          // setCurrDistance(distance_travelled);
          // // check the session?
          // end = await bluetoothLeManager.getBLEStepLog();
          // if (end == undefined || start.session_code != end.session_code) {
          //   // session codes are different => different sessions, a reset happened inbetween
          //   isNewSession = true;
          //   break;
          // }
        }

        // if (isNewSession || end == undefined) {
        //   // new session detected from device
        //   continue;
        // }

        // reached distance of X meters => send to BLE

        
        // const res = kFilter.filterAll(flattenGPSCoords(curr_gps_data));
        // console.log("test:" + flattenGPSCoords(curr_gps_data));
        // console.log("response:" + res);
        // console.log("distance:" + geolib.getPathLength(res));
        // console.log('List:' + JSON.stringify(curr_gps_data));
        // compute the distance given the list
        // this distance is a very rough estimate (off by like 10 meters)
        // if (end == undefined || start.session_code != end.session_code) {
        //   // session codes are different => different sessions, a reset happened inbetween
        //   continue;
        // }
        // const total_steps = end.step_count - start.step_count;
        // // // console.log("session id:" + end.session_code);
        // // console.log("end steps: " + end.step_count);
        // // console.log('Distance:' + distance);
        // // console.log('Total steps:' + total_steps);
        // const dist_per_step =
        //   total_steps != 0 && distance_travelled != 0 ? distance_travelled / total_steps : 0;

        // // console.log('Distance per step (m/step):' + dist_per_step);
        // bluetoothLeManager.sendBLEWriteDistancePerStep(dist_per_step);
      }
    }
  };

  function BluetoothScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={{textAlign: 'center', marginBottom: 50}}>
            Bluetooth Page
          </Text>
          {
            <CTAButton
              title="Connect"
              onPress={() => {
                dispatch(scanForPeripherals());
                setCount(count + 1);
                setIsModalVisible(true);
              }}
            />
          }
          {/* {latitude && longitude && (
            <>
              <Text>Your Location Is</Text>
              <Text style={styles.heartRateText}>LAT: {latitude}</Text>
              <Text style={styles.heartRateText}>LONG: {longitude}</Text>
            </>
          )} */}
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
          {isConnected && (
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
          {isConnected && (
            <CTAButton
              title="GET GPS LOCATION"
              onPress={() => {
                getGPSLocation();
              }}
            />
          )}
          <DeviceModal
            devices={devices}
            visible={isModalVisible}
            closeModal={closeModal}
            connectToPeripheral={connectToPeripheral}
          />
        </View>
      </SafeAreaView>
    );
  }

  function MapScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={{textAlign: 'center', marginBottom: 50}}>Map Page</Text>
          {true && (
            <CTAButton
              title="GET GPS LOCATION"
              onPress={() => {
                getGPSLocation();
              }}
            />
          )}
          {latitude && longitude && (
            <>
              <Text>Your Location Is</Text>
              <Text style={styles.heartRateText}>LAT: {latitude}</Text>
              <Text style={styles.heartRateText}>LONG: {longitude}</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  function HomeScreen() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <MaterialIcon name="run-fast" size={40} />
        </View>
        <View style={{flexDirection: 'column'}}>
          {isDuration && (
            <View
              style={{
                marginTop: 10,
                marginLeft: 15,
                marginRight: 15,
                borderWidth: 2,
                borderRadius: 10,
                borderColor: '#F08080',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 35,
                  marginBottom: 5,
                  color: '#E9967A',
                }}>
                Duration
              </Text>
              <Text
                style={{textAlign: 'center', fontSize: 35, marginBottom: 10}}>
                00:00
              </Text>
            </View>
          )}
          {(isAveragePace || isCurrentPace) && (
            <View
              style={{
                marginLeft: 15,
                marginRight: 15,
                borderBottomWidth: 2,
                borderBottomColor: '#F08080',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-evenly',
              }}>
              {isCurrentPace && (
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 25,
                      marginBottom: 15,
                      marginTop: 15,
                      color: '#E9967A',
                    }}>
                    Current Pace
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 30,
                      marginBottom: 10,
                    }}>
                    0
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 30,
                      marginBottom: 20,
                    }}>
                    km/h
                  </Text>
                </View>
              )}
              {isCurrentPace && isAveragePace && (
                <View
                  style={{
                    height: '80%',
                    width: 1.5,
                    backgroundColor: '#F08080',
                  }}></View>
              )}
              {isAveragePace && (
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 25,
                      marginBottom: 15,
                      marginTop: 15,
                      color: '#E9967A',
                    }}>
                    Average Pace
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 30,
                      marginBottom: 10,
                    }}>
                    0
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 30,
                      marginBottom: 20,
                    }}>
                    km/h
                  </Text>
                </View>
              )}
            </View>
          )}
          {isKilometers && (
            <View
              style={{
                marginTop: 15,
                marginBottom: 15,
                marginLeft: 15,
                marginRight: 15,
                borderBottomWidth: 2,
                borderBottomColor: '#F08080',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 35,
                  marginBottom: 5,
                  color: '#E9967A',
                }}>
                Distance
              </Text>
              <Text
                style={{textAlign: 'center', fontSize: 35, marginBottom: 10}}>
                {curr_distance} m
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginTop: 20,
          }}>
          {buttonInfo.startButton && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  toggleStartPauseButton();
                }}
                style={{
                  backgroundColor: '#67AE33',
                  borderRadius: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 25,
                }}>
                <Icon name="play-circle-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
          )}
          {buttonInfo.pauseButton && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  toggleStartPauseButton();
                }}
                style={{
                  backgroundColor: '#67AE33',
                  borderRadius: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 25,
                }}>
                <Icon name="pause-circle-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
          )}
          {buttonInfo.stopButton && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  stopButton();
                }}
                style={{
                  backgroundColor: '#E73415',
                  borderRadius: 20,
                  paddingVertical: 5,
                  paddingHorizontal: 25,
                }}>
                <Icon name="stop-circle-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
          {/* <View style={styles.heartRateTitleWrapper}>
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
        </View> */}
        {/* {isConnected && (
          <TextInput
            placeholder={'placeholder'}
            onChangeText={text => setMyState(text)}
          />
        )} */}
        {true && (
          <TextInput
            placeholder={'placeholder'}
            onChangeText={text => setMyHeight(text)}
            style={styles.input}
          />
        )}
      </SafeAreaView>
    );
  }
  const HomeStack = createNativeStackNavigator();
  const MapStack = createNativeStackNavigator();
  const BluetoothStack = createNativeStackNavigator();
  const SettingsDrawer = createDrawerNavigator();
  const BottomTab = createBottomTabNavigator();

  function TabScreen() {
    return (
      <BottomTab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: 'black',
          tabBarInactiveBackgroundColor: 'lightblue',
          tabBarActiveBackgroundColor: 'lightblue',
        }}>
        <BottomTab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <Icon name="home-sharp" color={color} size={size} />
            ),
          }}
        />
        <BottomTab.Screen
          name="MapTab"
          component={MapStackScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Map',
            tabBarIcon: ({color, size}) => (
              <MaterialIcon name="google-maps" color={color} size={30} />
            ),
          }}
        />
        <BottomTab.Screen
          name="BluetoothTab"
          component={BluetoothStackScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Bluetooth',
            tabBarIcon: ({color, size}) => (
              <MaterialIcon name="bluetooth" color={color} size={30} />
            ),
          }}
        />
      </BottomTab.Navigator>
    );
  }

  const BluetoothStackScreen = ({navigation}) => (
    <MapStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#F08080'},
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}>
      <MapStack.Screen
        name="BluetoothScreen"
        component={BluetoothScreen}
        options={{
          title: 'OpticPace',
          headerLeft: () => (
            <Icon.Button
              name="settings"
              size={25}
              backgroundColor="#F08080"
              onPress={() => {
                navigation.openDrawer();
              }}
            />
          ),
        }}
      />
    </MapStack.Navigator>
  );

  const MapStackScreen = ({navigation}) => (
    <MapStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#F08080'},
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}>
      <MapStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          title: 'OpticPace',
          headerLeft: () => (
            <Icon.Button
              name="settings"
              size={25}
              backgroundColor="#F08080"
              onPress={() => {
                navigation.openDrawer();
              }}
            />
          ),
        }}
      />
    </MapStack.Navigator>
  );

  const HomeStackScreen = ({navigation}) => (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#F08080'},
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'OpticPace',
          headerLeft: () => (
            <Icon.Button
              name="settings"
              size={25}
              backgroundColor="#F08080"
              onPress={() => {
                navigation.openDrawer();
              }}
            />
          ),
        }}
      />
    </HomeStack.Navigator>
  );

  const [myState, setMyState] = useState('');
  const [myHeight, setMyHeight] = useState('');
  return (
    <NavigationContainer>
      {/*<AuthStackScreen/>*/}
      <SettingsDrawer.Navigator
        initialRouteName="Home"
        drawerContent={props => (
          <DrawerPage
            {...props}
            showAveragePace={isAveragePace}
            showCurrentPace={isCurrentPace}
            showDuration={isDuration}
            showKilometers={isKilometers}
            toggleShowAveragePace={toggleAveragePace}
            toggleShowCurrentPace={toggleCurrentPace}
            toggleShowDuration={toggleDuration}
            toggleShowKilometers={toggleKilometers}
          />
        )}>
        <SettingsDrawer.Screen
          name="Home"
          component={TabScreen}
          options={{headerShown: false, headerTitle: 'Home'}}
        />
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
    marginLeft: 10,
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
