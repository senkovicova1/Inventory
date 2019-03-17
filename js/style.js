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
  sidebarAddInvButton: {
    backgroundColor: colours.ACC_PEACH,
  },
  sidebarAddInvIcon: {
     color: colours.ACC_VIO,
     fontSize: 26,
  },
  header: {
    backgroundColor: colours.ACC_TEAL,
  },
  headerItem: {
    color: colours.ACC_DARK_TEAL,
  },
  content: {
    backgroundColor: colours.ACC_CREAM,
  },
  picker: {
    color: colours.ACC_TEAL,
  },
  listText: {
    color: colours.ACC_DARK_PEACH,
  },
  listTextBadge: {
    borderRadius: 3,
    backgroundColor: colours.ACC_VIO
  },
  listTextBadgeText: {
    color: colours.ACC_CREAM,
  },
  image: {
    height: deviceHeight*0.2,
    width: deviceWidth*0.9,
    alignSelf: 'center',
  },
  stretch: {
    width: 30,
    height: 30
  },
  center: {
    alignSelf: 'center',
  },
  right: {
    alignSelf: 'flex-end',
  },
  acordionButton: {
    backgroundColor: colours.ACC_PEACH
  },
  acordionButtonText: {
    color: colours.ACC_DARK_PEACH
  },
  acordionText: {
    backgroundColor: colours.ACC_WHITE,
    color: colours.ACC_PEACH
  },
  ingredientPicker: {
     width: "40%",
     color: colours.ACC_DARK_PEACH
  },
  amountInput: {
     width: '30%',
     backgroundColor: colours.ACC_TEAL,
     color: colours.ACC_PEACH
  },
  unitPicker: {
     width: '20%',
     color: colours.ACC_TEAL
  },
  minusIngredient: {
    color: colours.ACC_DARK_PEACH,
  },
  minusIngredientButton: {
    marginBottom: 2,
    borderBottomWidth: 10,
    borderColor: colours.ACC_CREAM
  },
  detailRecipeRowText: {
      marginLeft: 10,
      color: colours.ACC_PEACH,
  },
  genericInput: {
    backgroundColor: colours.ACC_WHITE,
    color: colours.ACC_PEACH,
    borderWidth: 2,
    borderColor: colours.ACC_PEACH,
    borderRadius: 5,
  },
  genericInputStretched: {
    backgroundColor: colours.ACC_WHITE,
    color: colours.ACC_PEACH,
    borderWidth: 2,
    borderColor: colours.ACC_PEACH,
    borderRadius: 5,
    width: deviceWidth*0.85    
  },
  formInvTitle:{
    color: colours.ACC_DARK_PEACH
  },
  formInvNotes: {
    color: colours.ACC_PEACH
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
    width: deviceWidth,
  },
  logInOutButtonText: {
    color: colours.ACC_CREAM,
    fontSize: 25,
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
  },
  thumbnl: {
    height: 30,
    width: 30
  },
}
