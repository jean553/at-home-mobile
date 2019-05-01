import React from 'react';

import {
    Container,
    Form,
    Input,
    Button,
    Icon,
    Text,
} from 'native-base';

import {
    Font,
    MapView,
    TaskManager,
    Location,
} from 'expo';

import {
    StyleSheet,
    BackHandler,
    View,
    Image,
    Alert,
    AsyncStorage,
} from 'react-native';

import '../global.js';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

/**
 *
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, (data, error) => {

    if (error) { return; }

    AsyncStorage.getItem('ride').then(ride => {

        const latitude = data.data.locations[0].coords.latitude;
        const longitude = data.data.locations[0].coords.longitude;

        fetch(
            global.baseUrl +
                '/api' +
                ride +
                '/is-arrived?' +
                'latitude=' +
                latitude +
                '&longitude=' +
                longitude,
            { method: 'GET' }
        )
        .then((response) => {

            if (response.status !== 200) {
                Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                return;
            }

            return response.json();
        })
        .then((data) => {

            if (data.arrived !== 'true') { return; }

            fetch(
                global.baseUrl +
                    '/api' +
                    ride,
                { method: 'DELETE' }
            );

            Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        });
    });
});

/**
 *
 */
export default class AddressScreen extends React.Component {

    static navigationOptions = { title: 'when I will arrive at...' };

    /**
     *
     */
    constructor(props) {

        super(props);

        let phoneNumber = this.props.navigation.getParam('phoneNumber');

        const PARIS_LATITUDE = 48.866667;
        const PARIS_LONGITUDE =  2.333333;
        const INITIAL_DELTA_FOR_ZOOM = 0.005;

        this.state = {
            phoneNumber: phoneNumber,
            region: {
                latitude: PARIS_LATITUDE,
                longitude: PARIS_LONGITUDE,
                latitudeDelta: INITIAL_DELTA_FOR_ZOOM,
                longitudeDelta: INITIAL_DELTA_FOR_ZOOM,
            }
        };

        this.sendRide = this.sendRide.bind(this);
        this.startBackgroundLocationUpdates = this.startBackgroundLocationUpdates.bind(this);
    }

    /**
     * Sends the ride to the server, reduce the app on success, otherwise displays an error.
     */
    sendRide() {

        let data = {
            latitude: this.state.region.latitude,
            longitude: this.state.region.longitude,
            phone_number: this.state.phoneNumber,
        };

        fetch(
            global.baseUrl + '/api/rides',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            }
        ).then((response) => {

            if (response.status !== 201) {
                Alert.alert('Error when saving the ride. Please try again later.');
                return;
            }

            AsyncStorage.setItem(
                'ride',
                response.headers.map.location
            ).then(this.startBackgroundLocationUpdates);
        });
    }

    /**
     * Starts the continuous background location checks and reduces the app.
     */
    startBackgroundLocationUpdates = async () => {

        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

        BackHandler.exitApp();
    }

    /**
     *
     */
    render() {

        return (
            <Container>
                <Form style={styles.form}>
                    <Input
                        style={styles.searchInput}
                        placeholder='Type your address here...'
                    />
                    <Button style={styles.searchButton}>
                        <Icon name='search' />
                    </Button>
                </Form>
                <MapView
                    style={styles.map}
                    initialRegion={ this.state.region }
                    onRegionChangeComplete={(region) => { this.setState({ region }) }}
                />
                <View
                    pointerEvents='none'
                    style={styles.pinContainer}
                >
                    <Image
                        pointerEvents='none'
                        style={styles.pin}
                        source={require('../assets/images/pin.png')}
                    />
                </View>
                <View style={styles.validateButtonContainer}>
                    <Button
                        success
                        style={styles.validateButton}
                        onPress={() => {this.sendRide()}}
                    >
                        <Text>Validate</Text>
                    </Button>
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    map: { flex: 1 },
    form: { flexDirection: 'row' },
    searchButton: { margin: 10 },
    validateButton: { margin: 10 },
    validateButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    searchInput: { margin: 10 },
    pinContainer: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    pin: {
        width: 32,
        height: 32,
    }
});
