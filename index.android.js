import {AppRegistry} from 'react-native';

import config from './js/firebase-config';
import App from './js/App';

/*
import * as firebase from 'firebase';
import 'firebase/firestore';
import Rebase from 're-base';

const app = firebase.initializeApp(config);
const db = firebase.firestore(app);
const settings = { timestampsInSnapshots: true };
db.settings(settings);

export let rebase = Rebase.createClass(db);*/

AppRegistry.registerComponent('Inventory', () => App);
