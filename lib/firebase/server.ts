import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
      projectId: "airy-office-479113-u0",
  });
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();
