import React from 'react';

import {
    Container,
    Form,
    Input,
    Button,
    Icon,
    Text,
} from 'native-base';

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import MapView from 'react-native-maps';

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
 * Defines a background task in order to continuously check the mobile location
 * and call the server at every location change to know if the user arrived or not.
 *
 * Background tasks are not part of any component, so they are declared from the outside of them.
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, checkIfUserIsArrived);

/**
 * Background tasks that is called at every device location update
 * and calls the server in order to know if the user reached the expected destination.
 *
 * If the user is arrived, calls the server a second time in order to remove the ride
 * and stops the background task.
 *
 * In any case of an error (from the device or from a server response),
 * the task is voluntarily stopped in order to prevent any side effect.
 *
 * Background tasks are not part of any component, so they are declared from the outside of them.
 *
 * @param {object} data the updated geolocation data
 * @param {object} error any error that may have occured
 */
function checkIfUserIsArrived(data, error) {

    if (error) {
        stopBackgroundLocationTask();
    }

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
                stopBackgroundLocationTask();
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

            stopBackgroundLocationTask();
        });
    });
}

/**
 * Stops the currently running background task that updates location.
 *
 * Refactored here as it can be called at multiple moments.
 */
function stopBackgroundLocationTask() {
    Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
}

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
    }

    /**
     * Sends the ride to the server, reduces the app on success, otherwise displays an error.
     * If the ride is successfully sent, then it asynchronously initializes
     * the continuous check function (for the location) and waits for it.
     * When the background process is ready, the funtion reduces the app.
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
            ).then(async () => {
                await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                BackHandler.exitApp();
            });
        });
    }

    /**
     * Renders the view.
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
