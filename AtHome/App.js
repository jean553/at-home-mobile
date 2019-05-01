import React from 'react';

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

const App = createAppContainer(MainNavigator);

export default App;
