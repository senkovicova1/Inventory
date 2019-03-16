import * as colours from './helperFiles/colours';
const React = require('react-native');

const { StyleSheet, Platform, Dimensions } = React;

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

export default {
  sidebar: {
    flex: 1,
    backgroundColor: colours.ACC_VIO,
    top: -1
  },
  sidebarIcon: {
    fontSize: 26,
    width: 30,
    color: colours.ACC_PEACH,
    lineHeight: (Platform.OS === 'android') ? 21 : 25,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  stretch: {
    width: 30,
    height: 30
  },
  center: {
    alignSelf: 'center',
  },
  text: {
    fontWeight: (Platform.OS === 'ios') ? '500' : '400',
    fontSize: 16,
    marginLeft: 20,
    color: colours.ACC_PEACH,
  },
  sidebarIcon: {
    fontSize: 26,
    width: 30,
    color: colours.ACC_PEACH,
    lineHeight: (Platform.OS === 'android') ? 21 : 25,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  login: {
    flex: 1,
    backgroundColor: colours.ACC_CREAM,
    top: -1
  },
  logInOutButton: {
    backgroundColor: colours.ACC_DARK_TEAL,
    width: 100,
  },
  logInOutButtonText: {
    color: colours.ACC_CREAM,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colours.ACC_DARK_TEAL,
    width: 100,
  },
  signUpButtonText: {
    color: colours.ACC_DARK_TEAL,
  },
  loginTextWelcome:{
    color: colours.ACC_DARK_PEACH,
    fontSize: 26,
  },
  loginText:{
    color: colours.ACC_PEACH,
    fontSize: 16,
  },
  createOrLog: {
    color: colours.ACC_DARK_PEACH,
    textDecorationLine: 'underline',
    borderColor: colours.ACC_DARK_PEACH,
  }
}
