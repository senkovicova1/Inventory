import {AppRegistry} from 'react-native';

import config from './js/firebase-config';
import App from './js/App';

import * as firebase from 'firebase';
import Rebase from 're-base';
import 'firebase/firestore';

import com.facebook.FacebookSdk;

const app = firebase.initializeApp(config);
export let rebase = Rebase.createClass(app.database());

AppRegistry.registerComponent('Inventory', () => App);
