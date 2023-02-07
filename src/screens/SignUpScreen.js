import React from "react";
import {
    View,
    Text,
    Button,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Platform,
    TextInput,
    StatusBar
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import LinearGradient from "react-native-linear-gradient";
import { BounceIn } from "react-native-reanimated";


const SignInScreen = ({navigation}) => {

    const [info, setInfo] = React.useState({
        email: '',
        password: '',
        confirmPassword: '',
        secureEntry: true,
        checkInputChange: false,
        secureConfirm: true,
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

    const handleConfirmPasswordChange = (value) => {
        setInfo({
            ...info,
            confirmPassword: value
        });
    }

    const updateSecureEntry = () => {
        setInfo({
            ...info,
            secureEntry: !info.secureEntry
        });
    }

    const updateConfirmEntry = () => {
        setInfo({
            ...info,
            secureConfirm: !info.secureConfirm
        });
    }

    return(
        <View style={styles.container}>
            <StatusBar backgroundColor="#5882FA" barStyle="light-content"/>
            <View style={styles.header}>
                <View style={{alignItems: "center", paddingBottom: 25}}>
                    <MaterialIcons name="run-circle" size={70} color="white"/>
                </View>
                <Text style={styles.textHeader}>Register Now!</Text>
            </View>
            <Animatable.View style={styles.footer} animation="fadeInUpBig">
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
                    {info.checkInputChange &&
                    <Animatable.View animation="tada">
                        <Feather
                            name="check-circle"
                            color="green"
                            size={20}
                        />
                    </Animatable.View>}
                </View>
                <Text style={{color: '#05375a', fontSize: 18, marginTop: 35}}>Password</Text>
                <View style={styles.action}>
                    <Feather 
                        name="lock"
                        color="#05375a"
                        size={20}
                    />
                    <TextInput
                        placeholder="Your Password"
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
                <Text style={{color: '#05375a', fontSize: 18, marginTop: 35}}>Confirm Password</Text>
                <View style={styles.action}>
                    <Feather 
                        name="lock"
                        color="#05375a"
                        size={20}
                    />
                    <TextInput
                        placeholder="Confirm Your Password"
                        style={styles.textInputField}
                        autoCapitalize="none"
                        secureTextEntry={info.secureConfirm}
                        onChangeText={(value) => {handleConfirmPasswordChange(value)}}
                    />
                    <TouchableOpacity onPress={updateConfirmEntry}>
                        {info.secureConfirm ? 
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
                    <LinearGradient
                        colors={['#4E78F0', '#5882FA']}
                        style={styles.signIn}
                    >
                        <Text style={styles.textSign}>Sign Up</Text>
                    </LinearGradient>
                    <TouchableOpacity 
                        onPress={() => {navigation.goBack()}}
                        style={styles.signUp}
                    >
                        <Text style={styles.textSignUp}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        </View>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5882FA',
    },
    header:{
        flex: 1,
        marginBottom: 25,
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
        fontSize: 23,
        marginLeft: 15,
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
    signUp: {
        width: '100%',
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderColor:'#5882FA',
        borderWidth: 1,
        marginTop: 10,
    },
    textSign: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff'
    },
    textSignUp: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#5882FA'
    }
})