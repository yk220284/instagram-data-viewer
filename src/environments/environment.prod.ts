/* Firebase config are set s the following
 * firebase functions:config:set prod.apikey=XXXX
 *
 * To check where set is successful
 * firebase functions:config:get
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: 'ADD YOUR API KEY',
    authDomain: 'instagram-data-label-tool.firebaseapp.com',
    projectId: 'instagram-data-label-tool',
    storageBucket: 'instagram-data-label-tool.appspot.com',
    messagingSenderId: '531391085958',
    appId: '1:531391085958:web:367bd4a9ce646c92db0007',
    measurementId: 'G-P4R3NJ4YC1',
  },
};
