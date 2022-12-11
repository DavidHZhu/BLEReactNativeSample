import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

const AuthStack = createNativeStackNavigator();

const AuthStackScreen = ({navigation}) => (
    <AuthStack.Navigator headerMode='none'>
        <AuthStack.Screen options={{headerShown: false}} name="SignInScreen" component={SignInScreen}/>
        <AuthStack.Screen options={{headerShown: false}} name="SignUpScreen" component={SignUpScreen}/>
    </AuthStack.Navigator>
);

export default AuthStackScreen;