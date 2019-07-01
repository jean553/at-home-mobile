/**
 * @jest-environment jsdom
 */

import ContactsScreen from '../screens/ContactsScreen';

import React from 'react';

import renderer from 'react-test-renderer';

import { shallow } from 'enzyme';

test('app starts correctly', () => {

    const component = shallow(<ContactsScreen />);
    component.setState({ componentIsReady: true });

    expect(component).toMatchSnapshot();
});
