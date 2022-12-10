import React from "react";
import {
    View,
    Text,
    Button,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Platform,
    TextInput
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import { ScreenStackHeaderBackButtonImage } from "react-native-screens";

const SignInScreen = () => {

    const [info, setInfo] = React.useState({
        email: '',
        password: '',
        secureEntry: true,
        checkInputChange: false,
    });

    const handleInputChange = (value) => {
        if(value.length != 0){
            setInfo({
                ...info,
                email: value,
                checkInputChange: true
            });
        } else {
            setInfo({
                ...info,
                email: value,
                checkInputChange: false
            });
        }
    }

    const handlePasswordChange = (value) => {
        setInfo({
            ...info,
            password: value
        });
    }

    const updateSecureEntry = () => {
        setInfo({
            ...info,
            secureEntry: !info.secureEntry
        });
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeader}>Welcome to OpticPace</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.textFooter}>Email</Text>
                <View style={styles.action}>
                    <FontAwesome 
                        name="user-o"
                        color="#05375a"
                        size={20}
                    />
                    <TextInput
                        placeholder="Your Email"
                        style={styles.textInputField}
                        autoCapitalize="none"
                        onChangeText={(value) => {handleInputChange(value)}}
                    />
                    {info.checkInputChange && <Feather
                        name="check-circle"
                        color="green"
                        size={20}
                    />}
                </View>
                <Text style={{color: '#05375a', fontSize: 18, marginTop: 35}}>Password</Text>
                <View style={styles.action}>
                    <Feather 
                        name="lock"
                        color="#05375a"
                        size={20}
                    />
                    <TextInput
                        placeholder="Your Email"
                        style={styles.textInputField}
                        autoCapitalize="none"
                        secureTextEntry={info.secureEntry}
                        onChangeText={(value) => {handlePasswordChange(value)}}
                    />
                    <TouchableOpacity onPress={updateSecureEntry}>
                        {info.secureEntry ? 
                        <Feather
                            name="eye-off"
                            color="grey"
                            size={20}
                        />
                        :
                        <Feather
                            name="eye"
                            color="grey"
                            size={20}
                        />
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.button}>
                        <Text style={styles.textSign}>Sign In</Text>
                </View>
            </View>
        </View>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#009387',
    },
    header:{
        flex: 1,
        marginBottom: 30,
        marginLeft: 10,
        justifyContent: "flex-end",
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    textHeader: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 25,
    },
    textFooter:{
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
    },
    textInputField: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    button: {
        alignItems: 'center',
        marginTop: 50
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    textSign: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff'
    }
})