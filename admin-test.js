import * as admin from 'firebase-admin';
admin.initializeApp();
admin.firestore().collection('test').doc('test').set({ test: true })
  .then(() => console.log('success'))
  .catch(e => console.error(e));
