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
import { faUser } from '@fortawesome/free-solid-svg-icons';



export function DrawerPage(props){
    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{marginTop: 15}}>
                            <FontAwesomeIcon icon={faUser} size={50} style={styles.profilePicture}/>
                            <View style={{flexDirection: 'column', marginLeft: 76}}>
                            <Title style={styles.title}>UserName</Title>
                            <Caption style={styles.caption}>UserEmail</Caption>
                        </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={({color, size}) => (
                                <Icon
                                name="home-outline"
                                color="black"
                                size={size}
                                />
                            )}
                            style={{ backgroundColor: '#B2D8D8' }}
                            label="Home"
                            onPress={() => {}}
                        />
                    </Drawer.Section>
                    <Drawer.Section title="Bluetooth" style={{flexDirection: "row", marginLeft: 90}}>
                        <Icon
                            name="bluetooth"
                            color="#318CE7"
                            size={20}
                            style={styles.blueTooth}
                        />
                        <View style={styles.preference}>
                            <Switch/>
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
        fontWeight: 'normal',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
        marginLeft: 4,
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
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1,
    },
    preference: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    profilePicture: {
        marginLeft: 90,
        marginBottom: 15,
    },
    blueTooth: {
        marginTop: 10,
    }
});