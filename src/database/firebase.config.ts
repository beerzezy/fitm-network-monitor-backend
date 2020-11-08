import * as admin from 'firebase-admin'
const serviceAccount = require('src/database/serviceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fitm-monitordev-2ccdc.firebaseio.com'
})
export const db = admin.firestore()
