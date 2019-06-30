import React, { Component } from 'react';

import { Notifications } from 'expo';

import * as Permissions from 'expo-permissions';

import * as Font from 'expo-font';

import {
    createStackNavigator,
    createAppContainer
} from 'react-navigation';

import ContactsScreen from './screens/ContactsScreen';
import AddressScreen from './screens/AddressScreen';

const MainNavigator = createStackNavigator(
    {
        Contacts: {screen: ContactsScreen},
        Address: {screen: AddressScreen},
    },
);

const AppContainer = createAppContainer(MainNavigator);

export default class App extends Component {

    /**
     *
     */
    constructor(props) {

        super(props);

        this.state = {fontsLoaded: false};
    }

    /**
     *
     */
    async componentDidMount() {

        await Font.loadAsync({
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
        });

        this.setState({ fontsLoaded: true });

        /* FIXME: this should be handled when sending the ride */
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        let token = await Notifications.getExpoPushTokenAsync();
    }

    /**
     *
     */
    render() {

        if (this.state.fontsLoaded === false) {
            return null;
        }

        return ( <AppContainer /> );
    }
}
