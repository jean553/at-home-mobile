import React from 'react';

import {
    Container,
    Text,
} from 'native-base';

import {
    Font,
    Contacts,
} from 'expo';

import {
    StyleSheet,
    PermissionsAndroid,
    BackHandler,
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
            fontsLoaded: false,
            contactsLoaded: false,
            contacts: [],
        };

        this.loadContacts = this.loadContacts.bind(this);
        this.openAddressPage = this.openAddressPage.bind(this);

        this.loadContacts();
    }

    /**
     * Asks for contacts access and loads the contacts if access granted. Closes the app if access denied.
     */
    async loadContacts() {

        const readContactsPermissionGranted = await Expo.Permissions.askAsync(Expo.Permissions.CONTACTS);

        if (readContactsPermissionGranted === 'granted') {
            BackHandler.exitApp();
            return;
        }

        await Contacts.getContactsAsync().then((contacts) => {
            this.setState({
                contacts: contacts.data,
                contactsLoaded: true,
            })
        });
    }

    /**
     * Redirects to the address selection page when a contact is clicked.
     */
    openAddressPage(phoneNumber) {

        const { navigate } = this.props.navigation;
        navigate("Address", { phoneNumber: phoneNumber });
    }

    /**
     * Mounts the TTF font files asynchronously,
     * this is required by native-base;
     * the page can be displayed after this operation only
     */
    async componentDidMount() {

        await Expo.Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf"),
            Axiforma: require("../assets/fonts/axiforma/kastelov_-_axiforma_bold-webfont.ttf"),
        });

        this.setState({ fontsLoaded: true });
    }

    /**
     *
     */
    render() {

        if (
            this.state.fontsLoaded === false ||
            this.state.contactsLoaded === false
        ) {
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
