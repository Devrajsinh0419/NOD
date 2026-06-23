let app: any = null
let auth: any = null
let googleProvider: any = null

export async function getFirebase() {
  if (typeof window === "undefined") {
    return { app: null, auth: null, googleProvider: null }
  }

  if (!app) {
    const { initializeApp, getApps } = await import("firebase/app")
    const { getAuth, GoogleAuthProvider } = await import("firebase/auth")

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  }

  return { app, auth, googleProvider }
}
