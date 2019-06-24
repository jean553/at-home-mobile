import React from 'react';

import {
    Container,
    Text,
} from 'native-base';

import * as Permissions from 'expo-permissions';
import * as Contacts from 'expo-contacts';

import {
    StyleSheet,
    PermissionsAndroid,
    FlatList,
    TouchableOpacity,
} from 'react-native';

export default class ContactsScreen extends React.Component {

    static navigationOptions = { title: 'I want to notify...' };

    /**
     *
     */
    constructor(props) {

        super(props);

        this.state = {
            componentIsReady: false,
            contacts: [],
        };

        this.openAddressPage = this.openAddressPage.bind(this);
    }

    /**
     * Called when the component is fully mounted; it loads the phone contacts and the required fonts;
     * the view start to be rendered only at the end of this function
     */
    async componentDidMount() {

        const readContactsPermissionGranted = await Permissions.askAsync(Permissions.CONTACTS);

        if (readContactsPermissionGranted === 'granted') {
            BackHandler.exitApp();
            return;
        }

        await Contacts.getContactsAsync().then((contacts) => {
            this.setState({ contacts: contacts.data });
        });

        this.setState({ componentIsReady: true });
    }

    /**
     * Redirects to the address selection page when a contact is clicked.
     *
     * @param {string} phoneNumber the selected phone number that will received the text message
     */
    openAddressPage(phoneNumber) {

        const { navigate } = this.props.navigation;
        navigate("Address", { phoneNumber: phoneNumber });
    }

    /**
     * Renders the view.
     */
    render() {

        if (this.state.componentIsReady === false) {
            return null;
        }

        return (
            <Container>
                <FlatList
                    data={this.state.contacts}
                    renderItem={(contact) =>
                        <TouchableOpacity
                            key={contact.id}
                            onPress={() => {this.openAddressPage(contact.item.phoneNumbers[0].number)}}
                        >
                            <Text style={styles.contact}>{contact.item.firstName}</Text>
                        </TouchableOpacity>
                    }
                    keyExtractor={(contact, index) => contact.id}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    contact: { padding: 10 }
});
