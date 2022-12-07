import React from "react";
import {StyleSheet, View} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer'
import {
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper'
import Icon from 'react-native-vector-icons/Ionicons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

export function DrawerPage(props){
    const [connectBluetooth, setConnectBluetooth] = React.useState(false);
    const [isDuration, setIsDuration] = React.useState(true);
    const [isCurrentPace, setIsCurrentPace] = React.useState(true);
    const [isAveragePace, setIsAveragePace] = React.useState(true);
    const [isKilometers, setIsKilometers] = React.useState(true);

    const toggleTheme = () => {
        setConnectBluetooth(!connectBluetooth);
    
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

    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{marginTop: 15}}>
                            <FontAwesomeIcon icon={faCircleUser} size={50} style={styles.profilePicture}/>
                            <View style={{flexDirection: 'column', marginLeft: 76}}>
                                <Title style={styles.title}>GuestName</Title>
                                <Caption style={styles.caption}>GuestEmail</Caption>
                            </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={({size}) => (
                                <Icon
                                    name="home-outline"
                                    color="black"
                                    size={size}
                                />
                            )}
                            style={{ backgroundColor: '#8c92ac' }}
                            label="Home"
                            onPress={() => {props.navigation.navigate("Home", {screen: "HomeTab"})}}
                        />
                        <DrawerItem
                            icon={({size}) => (
                                <Icon
                                    name="map"
                                    color="black"
                                    size={size}
                                />
                            )}
                            style={{ backgroundColor: '#8c92ac' }}
                            label="Map"
                            onPress={() => {props.navigation.navigate("Home", {screen: "MapTab"})}}
                        />
                    </Drawer.Section>
                    <Drawer.Section style={{paddingBottom: 10}}>
                        <View style={{flexDirection: 'row', marginLeft: 100}}>
                            <Text style={{marginTop: 10, fontSize: 15, color: 'black'}}>Bluetooth</Text>
                            <Icon
                                name="bluetooth"
                                color="#318CE7"
                                size={20}
                                style={styles.blueTooth}
                            />
                        </View>
                        <TouchableRipple onPress={() => {toggleTheme()}}>
                            <View style={styles.bluetoothPreference}>
                                <View pointerEvents="none">
                                    <Switch value={connectBluetooth}/>
                                </View>
                            </View>
                        </TouchableRipple>
                    </Drawer.Section>
                    <Drawer.Section>
                        <View style={{flexDirection: 'row', marginLeft: 80}}>
                            <Text style={{marginTop: 10, fontSize: 15, color: 'black', marginBottom: 10}}>Display Settings</Text>
                        </View>
                        <View style={styles.displaySettings}>
                            <TouchableRipple onPress={() => {toggleDuration()}}>
                                <View style={styles.preference}>
                                    <Text>DURATION</Text>
                                    <View pointerEvents="none">
                                        <Switch value={isDuration}/>
                                    </View>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple onPress={() => {toggleAveragePace()}}>
                                <View style={styles.preference}>
                                    <Text>AVERAGE PACE</Text>
                                    <View pointerEvents="none">
                                        <Switch value={isAveragePace}/>
                                    </View>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple onPress={() => {toggleCurrentPace()}}>
                                <View style={styles.preference}>
                                    <Text>CURRENT PACE</Text>
                                    <View pointerEvents="none">
                                        <Switch value={isCurrentPace}/>
                                    </View>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple onPress={() => {toggleKilometers()}}>
                                <View style={styles.preference}>
                                    <Text>KILOMETERS</Text>
                                    <View pointerEvents="none">
                                        <Switch value={isKilometers}/>
                                    </View>
                                </View>
                            </TouchableRipple>
                        </View>
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({color, size}) => (
                        <Icon
                        name="exit-outline"
                        color={color}
                        size={size}
                        />
                    )}
                    label="Sign Out"
                    onPress={() => {}}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        marginLeft: 1,
        fontWeight: 'normal',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
        marginLeft: 5,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'normal',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
    },
    displaySettings: {
        marginBottom: 20,
    },
    bluetoothPreference: {
        flexDirection: 'column',
        flexWrap: "wrap",
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 112
        
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14
        
    },
    profilePicture: {
        marginLeft: 95,
        marginBottom: 5,
    },
    blueTooth: {
        marginTop: 10,
    }
});