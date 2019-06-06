import * as colours from './helperFiles/colours';
const React = require('react-native');

const { StyleSheet, Platform, Dimensions } = React;

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

export default {
  sidebar: {
    flex: 1,
    backgroundColor: colours.ACC_VIO,
  },
  sidebarList: {
    marginTop: 10,
    height: deviceHeight*0.75,
  },
  sidebarIcon: {
    fontSize: 26,
    width: 30,
    color: colours.ACC_PEACH,
    lineHeight: (Platform.OS === 'android') ? 21 : 25,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  sidebarInvList: {
    width: '94%',
    backgroundColor: colours.ACC_VIO_LIGHT,
    borderRadius: 15,
    alignSelf: 'center',
    paddingTop: 15,
    paddingBottom: 15
  },
  sidebarInvItem: {
    marginLeft: 25,
    height: 50,
  },
  sidebarAddInvButton: {
    backgroundColor: colours.ACC_PEACH,
    width: '94%',
    alignSelf: 'center',
    borderRadius: 8,
  },
  sidebarAddInvIcon: {
     color: colours.ACC_VIO,
     fontSize: 26,
  },
  sidebarSettings: {
  //  bottom:50,
  },
  sidebarMail: {
//    bottom:50,
  },
  transparent: {
    opacity: 0.5,
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
  camera: {
    width: deviceWidth*0.90,
    alignSelf: 'center',
    marginTop: 150,
    marginBottom: 150,
//    flexDirection: 'row',
    backgroundColor: 'black'
  },
  picker: {
    color: colours.ACC_DARK_TEAL,
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
  },
  listItem:{
    margin: -3,
    padding: 0
  },
  listText: {
    color: colours.ACC_DARK_PEACH,
    marginLeft: 8,
  },
  listTextBadge: {
    borderRadius: 3,
    backgroundColor: colours.ACC_VIO,
  },
  listTextBadgeText: {
    color: colours.ACC_CREAM,
  },
  image: {
    height: deviceHeight*0.2,
    width: deviceWidth*0.9,
    alignSelf: 'center',
    borderRadius: 15,
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
    backgroundColor: colours.ACC_PEACH,
    marginTop: deviceWidth*0.01,
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
    borderRadius: 8,
  },
  acordionButtonTrans: {
    marginTop: deviceWidth*0.01,
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
    borderRadius: 8,
  },
  acordionButtonText: {
    color: colours.ACC_DARK_PEACH
  },
  acordionButtonTextTrans: {
    color: colours.ACC_PEACH
  },
  acordionText: {
    backgroundColor: colours.ACC_WHITE,
    color: colours.ACC_DARK_PEACH,
    placeholderTextColor: colours.ACC_PEACH,
  },
  acordionButtonVio: {
    backgroundColor: colours.ACC_VIO_LIGHT,
    marginTop: deviceWidth*0.01,
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
    borderRadius: 8,
  },
  acordionButtonVioText: {
    color: colours.ACC_TEAL
  },
  formTitle: {
    margin: deviceWidth*0.02,
    marginRight: deviceWidth*0.04,
    marginBottom: deviceWidth*0.04,
    backgroundColor: colours.ACC_CREAM,
    color: colours.ACC_DARK_PEACH,
    borderBottomWidth: 2,
    borderColor: colours.ACC_DARK_PEACH,
  },
  ingredientPicker: {
     color: colours.ACC_DARK_PEACH,
  },
  amountInput: {
     color: colours.ACC_DARK_PEACH,
     borderColor: colours.ACC_PEACH,
     borderRightWidth: 2,
     borderLeftWidth: 2,
     paddingLeft: 15,
  },
  unitPicker: {
     color: colours.ACC_DARK_PEACH,
     borderColor: colours.ACC_PEACH,
     borderRightWidth: 2,
  },
  ah: {
    backgroundColor: colours.ACC_VIO
  },
  minusIngredient: {
    color: colours.ACC_DARK_PEACH,
    alignSelf: 'center',
    fontSize: 24
  },
  minusIngredientButton: {
    marginBottom: 2,
    borderBottomWidth: 10,
    borderColor: 'transparent'
  },
  textArea:{
    backgroundColor: colours.ACC_PEACH_A,
    borderWidth: 2,
    borderColor: colours.ACC_PEACH_A,
    borderRadius: 5,
    color: colours.ACC_DARK_PEACH
  },
  ingredientRow:{
    borderWidth: 2,
    borderColor: colours.ACC_DARK_PEACH,
    borderRadius: 5,
  },
  detailRecipeRowText: {
      marginLeft: 10,
      color: colours.ACC_DARK_PEACH,
  },
  detailRecipeRowTextAmount: {
      marginLeft: 10,
      color: colours.ACC_PEACH,
  },
  listItemInRecipe:{
      height: 50,
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
    marginLeft: deviceWidth*0.08,
    marginRight: deviceWidth*0.08,
    borderRadius: 8,
  },
  logInOutButtonText: {
    color: colours.ACC_CREAM,
    fontSize: 25,
  },
  signUpButton: {
    backgroundColor: colours.ACC_VIO,
    marginLeft: deviceWidth*0.08,
    marginRight: deviceWidth*0.08,
    borderRadius: 8,
  },
  signUpButtonText: {
    color: colours.ACC_DARK_TEAL,
  },
  fbLoginButton: {
    color: 'rgb(66, 103, 178)',
    height: 30,
    borderRadius: 5,
    marginTop: deviceHeight*0.05
  },
  loginTextWelcomeInventory:{
    color: colours.ACC_DARK_PEACH,
    fontSize: 30,
    marginTop: deviceHeight*0.03,
  },
  loginTextWelcome:{
    color: colours.ACC_DARK_PEACH,
    fontSize: 26,
    marginTop: deviceHeight*0.03,
  },
  loginText:{
    color: colours.ACC_PEACH,
    fontSize: 16,
    marginTop: deviceHeight*0.05,
  },
  loginTextOr:{
    color: colours.ACC_PEACH,
    fontSize: 16,
  },
  inventoryLogo: {
    width: deviceHeight*0.3,
    height: deviceHeight*0.3,
    marginTop: deviceHeight*0.05,
  },
  createOrLog: {
    color: colours.ACC_DARK_PEACH,
    textDecorationLine: 'underline',
    borderColor: colours.ACC_DARK_PEACH,
  },
  floatingLabelLog:{
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: "grey"
  },
  welcomeCard:{
    marginLeft: deviceWidth*0.1,
    marginRight: deviceWidth*0.1,
    marginTop: deviceWidth*0.07,
    paddingBottom: deviceWidth*0.07,
    backgroundColor: colours.ACC_PEACH_A,
    borderWidth: 0,
    borderRadius: 15,
  },
  listCard:{
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
    marginTop: deviceWidth*0.02,
    paddingTop: deviceWidth*0.02,
    paddingBottom: deviceWidth*0.02,
    backgroundColor: colours.ACC_PEACH_A,
    borderWidth: 0,
    borderRadius: 15,
  },
  listCardInv:{
    marginLeft: deviceWidth*0.01,
    marginRight: deviceWidth*0.01,
    marginTop: deviceWidth*0.02,
    paddingTop: deviceWidth*0.02,
    paddingBottom: deviceWidth*0.02,
    backgroundColor: colours.ACC_TEAL_A,
    borderWidth: 0,
    borderRadius: 15,
  },
  listCardInvText:{
    color: colours.ACC_DARK_TEAL,
    fontWeight: '500',
  },
  logCard: {
    marginTop: deviceWidth*0.08,
    marginLeft: deviceWidth*0.08,
    marginRight: deviceWidth*0.08,
    backgroundColor: colours.ACC_PEACH_A,
    borderWidth: 0,
    borderRadius: 15,
    padding: deviceWidth*0.06,
    paddingTop: 5,
    paddingBottom: 5,
  },
  formCard: {
    marginTop: deviceWidth*0.04,
    marginLeft: deviceWidth*0.04,
    marginRight: deviceWidth*0.04,
    backgroundColor: colours.ACC_PEACH_A,
    borderWidth: 0,
    borderRadius: 15,
    padding: 10,
  },
  stepsCardHeader:{
    color: colours.ACC_PEACH,
    fontSize: 20,
    marginLeft: deviceHeight*0.02,
  },
  stepsCardBody:{
    margin: deviceHeight*0.02,
    padding: deviceHeight*0.01,
    color: colours.ACC_DARK_PEACH,
    backgroundColor: colours.ACC_PEACH_A,
    borderRadius: 5,
  },
  errorItem: {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(180, 0, 0)',
    paddingLeft: 6,
    borderRadiusBottomLeft: 5,
    borderRadiusBottomLeft: 5
  },
  errorText:{
    fontSize: 15,
    color: colours.ACC_WHITE,
  },
  thumbnl: {
    height: 30,
    width: 30
  },
  DARK_PEACH: {
    color: colours.ACC_DARK_PEACH,
  },
  PEACH: {
    color: colours.ACC_PEACH,
  }
}
