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
import {SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList} from 'react-native';
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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStopwatch } from '@fortawesome/free-solid-svg-icons';
import RNLocation from 'react-native-location';
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import FontistoIcons from 'react-native-vector-icons/Fontisto'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FoundationIcon from 'react-native-vector-icons/Foundation'
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
import { DrawerPage} from './screens/DrawerContent';
import AuthStackScreen from './screens/AuthenticationStack';
import { AuthContext } from './components/context';

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

const formatStopWatch = (number : number) => (number <= 9 ? `0${number}` : number);

function stopWatchDisplay(cs : number) {
  if (cs < 0) {
    return '00:00:00';
  }
  if (cs < 100) {
    return `00:00:${formatStopWatch(cs)}`
  } else {
    let centiSeconds = cs%100;
    let seconds = (cs-centiSeconds)/100;
    if(seconds < 60){
      return `00:${formatStopWatch(seconds)}:${formatStopWatch(centiSeconds)}`;
    } else {
      let minutes = (seconds - seconds%60)/60;
      seconds = seconds%60;
      return `${formatStopWatch(minutes)}:${formatStopWatch(seconds)}:${formatStopWatch(centiSeconds)}`;
    }
  }
}

const Home: FC = () => {
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const [authToken, setAuthToken] = useState(null);
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

  const authContext = React.useMemo(() => ({
    signIn: () => {
      setAuthToken(1);
    },
    signOut: () => {
      setAuthToken(null);
    },
    signUp: () => {
      setAuthToken(1);
    },
    userName: 'name',
    userEmail: 'email',
  }), []);

  const toggleStartPauseButton = () => {
    setButtonInfo({
      startButton: !buttonInfo.startButton,
      pauseButton: !buttonInfo.pauseButton,
      stopButton: buttonInfo.stopButton === false ? true : buttonInfo.stopButton
    });
  }
  const stopButton = () => {
    setButtonInfo({
      startButton: true,
      pauseButton: false,
      stopButton: false,
    });
  }
  const toggleDuration = () => {
    setIsDuration(!isDuration);

  }

  const toggleCurrentPace = () => {
    setIsCurrentPace(!isCurrentPace);

  }

  const toggleAveragePace = () => {
    setIsAveragePace(!isAveragePace);

  }

  const toggleKilometers = () => {
    setIsKilometers(!isKilometers);
  }

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

  function HistoryScreen() {
    let historyData = [
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
      {tag: '2023-03-02', duration: "18:00", distance: 3000, pace: 6},
    ];
    
    return (
      <SafeAreaView style={styles.container}>
      <View>
      {(historyData && historyData.length>0) ?
        <View style={{paddingTop: 5}}>
          <View style={styles.listWrap}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{paddingLeft: 6, paddingTop: 5, paddingBottom: 5, fontSize: 19, fontFamily: "serif"}}>Duration</Text>
              <EntypoIcon name='stopwatch' size={16} style={{paddingTop: 10, paddingLeft: 1}}/>
              <Text style={{paddingLeft: 13, paddingTop: 5, paddingBottom: 5, fontSize: 19, fontFamily: "serif"}}>Pace</Text>
              <SimpleLineIcons name='speedometer' size={16} style={{paddingTop: 10, paddingLeft: 1}}/>
              <Text style={{paddingLeft: 13, paddingTop: 5, paddingBottom: 5, fontSize: 19, fontFamily: "serif"}}>Distance</Text>
              <MaterialIcon name='map-marker-distance' size={16} style={{paddingTop: 10, paddingLeft: 1}}/>
              <Text style={{paddingLeft: 20, paddingTop: 5, paddingBottom: 5, fontSize: 19, fontFamily: "serif"}}>Date</Text>
              <FontistoIcons name='date' size={16} style={{paddingTop: 10, paddingLeft: 1}}/>
            </View>
            <View style={{flexDirection: 'row'}}>
            <Text style={{paddingLeft: 15, paddingTop: 5, paddingBottom: 5, fontSize: 10,}}>MIN:SECONDS</Text>
              <Text style={{paddingLeft: 40, paddingTop: 5, paddingBottom: 5, fontSize: 10,}}>MIN/KM</Text>
              <Text style={{paddingLeft: 50, paddingTop: 5, paddingBottom: 5, fontSize: 10,}}>METERS</Text>
              <Text style={{paddingLeft: 40, paddingTop: 5, paddingBottom: 5, fontSize: 10,}}>YEAR-MONTH-DAY</Text>
            </View>
          </View>
          <FlatList
            data={historyData}
            renderItem={
              ({item}) => 
                <View style={styles.listWrap}>
                  <Text style={{paddingLeft: 25, paddingRight: 37, paddingTop: 5, paddingBottom: 5, flex:0.5, fontSize: 16, fontFamily: 'monospace', backgroundColor: 'pink'}}>{item.duration}</Text>
                  <Text style={{paddingLeft: 23, paddingTop: 5, paddingBottom: 5, flex:0.35, fontSize: 16, fontFamily: 'monospace', backgroundColor: 'pink'}}>{item.pace}</Text>
                  <Text style={{paddingLeft: 37, paddingTop: 5, paddingBottom: 5, flex:0.5, fontSize: 16, fontFamily: 'monospace', backgroundColor: 'pink'}}>{item.distance}</Text>
                  <Text style={styles.listTag}>{item.tag}</Text>
                </View>
            }
          />
          <View style={{paddingTop: 30, paddingLeft: 90, paddingRight: 100}}>
            <TouchableOpacity onPress={()=>{stopButton()}} style={{backgroundColor: 'grey', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 25}}>
              <Text style={{textAlign: 'center'}}>Clear History</Text>
            </TouchableOpacity>
          </View>
        </View>
        : 
        <View style={{paddingTop: 100}}>
          <Text style={{textAlign: 'center', fontSize: 20}}>No History Available</Text>
          <Text style={{textAlign: 'center', fontSize: 20}}>Start A Run To Create A Record</Text>
          <FontAwesomeIcon icon={faStopwatch} size={70} style={{marginLeft: 160, marginTop: 50}}/>
        </View>
      }
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
                getLocation();
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
          <MaterialIcon name="run-fast" size={40}/>
        </View>
        <View style={{flexDirection: 'column'}}>
          {isDuration && <View style={{marginTop: 10, marginLeft: 15, marginRight: 15, borderWidth: 2, borderRadius: 10, borderColor: '#F08080'}}>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 5, color: '#E9967A'}}>Duration</Text>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 10}}>00:00</Text>
          </View>}
          {(isAveragePace || isCurrentPace) && <View style={{marginLeft: 15, marginRight: 15, borderBottomWidth: 2, borderBottomColor: '#F08080', flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-evenly'}}>
            {isCurrentPace && <View>
              <Text style={{textAlign: 'center', fontSize: 25, marginBottom: 15, marginTop: 15, color: '#E9967A'}}>Current Pace</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 10}}>0</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 20}}>km/h</Text>
            </View>}
            {isCurrentPace && isAveragePace && <View style={{height: '80%', width: 1.5, backgroundColor: '#F08080'}}></View>}
            {isAveragePace && <View>
              <Text style={{textAlign: 'center', fontSize: 25, marginBottom: 15, marginTop: 15, color: '#E9967A'}}>Average Pace</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 10}}>0</Text>
              <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 20}}>km/h</Text>
            </View>}
          </View>}
          {isKilometers && <View style={{marginTop: 15, marginBottom: 15, marginLeft: 15, marginRight: 15, borderBottomWidth: 2, borderBottomColor: '#F08080'}}>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 5, color: '#E9967A'}}>Distance</Text>
            <Text style={{textAlign: 'center', fontSize: 35, marginBottom: 10}}>0 km</Text>
          </View>}
        </View>
        <View style={{flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 20}}>
          {buttonInfo.startButton && <View>
            <TouchableOpacity onPress={()=>{toggleStartPauseButton()}} style={{backgroundColor: '#67AE33', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='play-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
          </View>}
          {buttonInfo.pauseButton && <View>
            <TouchableOpacity onPress={()=>{toggleStartPauseButton()}} style={{backgroundColor: '#67AE33', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='pause-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
          </View>}
          {buttonInfo.stopButton && <View>
            <TouchableOpacity onPress={()=>{stopButton()}} style={{backgroundColor: '#E73415', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 25}}>
              <Icon name='stop-circle-outline' size={30} color="white"/>
            </TouchableOpacity>
            </View>}
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
  const HistoryStack = createNativeStackNavigator();
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
        <BottomTab.Screen name="HistoryTab" component={HistoryStackScreen} options={{
          headerShown: false,
          tabBarLabel: "History",
          tabBarIcon: ({color, size}) => (
            <FoundationIcon
              name="results"
              color={color}
              size={30}
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

  const HistoryStackScreen = ({navigation}) => (
    <HistoryStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#F08080' },
      headerTintColor: '#fff',
      headerTitleAlign: 'center'
    }}>
        <HistoryStack.Screen
          name="HistoryScreen"
          component={HistoryScreen}
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
    </HistoryStack.Navigator>
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
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {authToken !== null ?
          <SettingsDrawer.Navigator initialRouteName='Home' drawerContent={ props => <DrawerPage {...props}
            showAveragePace={isAveragePace}
            showCurrentPace={isCurrentPace}
            showDuration={isDuration}
            showKilometers={isKilometers}
            toggleShowAveragePace={toggleAveragePace}
            toggleShowCurrentPace={toggleCurrentPace}
            toggleShowDuration={toggleDuration}
            toggleShowKilometers={toggleKilometers}
          />}>
            <SettingsDrawer.Screen name="Home" component={TabScreen} options={{headerShown: false, headerTitle: 'Home'}}/>
          </SettingsDrawer.Navigator>
        : <AuthStackScreen/>}
      </NavigationContainer>
    </AuthContext.Provider>
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
    marginLeft: 10
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 0.5,
  },
  listTag: {
    flex:1,
    fontSize: 17,
    paddingTop: 5,
    paddingLeft: 25,
    paddingBottom: 5,
    backgroundColor: 'pink'
  },
  listRow: {
    paddingLeft: 35,
    paddingTop: 5,
    paddingBottom: 5,
    flex:0.5,
    fontSize: 16,
  },
});

export default App;
