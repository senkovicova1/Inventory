import {AppRegistry} from 'react-native';

import config from './js/firebase-config';
import App from './js/App';

import * as firebase from 'firebase';
import Rebase from 're-base';
import 'firebase/firestore';

import { GoogleSignin } from 'react-native-google-signin';

const app = firebase.initializeApp(config);
export let rebase = Rebase.createClass(app.database());

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.scripts', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.photos.readonly'],
    webClientId: '225496698702-fcr0gtfhv3i1qf939k772sut3oa759u3.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
});

AppRegistry.registerComponent('Inventory', () => App);
