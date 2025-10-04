'use client';
import { useState, useReducer, useRef, useEffect } from 'react';

// --- Toast ---
import toast, { Toaster } from 'react-hot-toast';

// --- Firebase ---
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';

// =================================================================================
// Firebase Configuration
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA30rqFym17ih3z6nPyDyzLXwsQ4Da6_TQ",
  authDomain: "farm-ai-907d6.firebaseapp.com",
  projectId: "farm-ai-907d6",
  storageBucket: "farm-ai-907d6.appspot.com",
  messagingSenderId: "1009731524211",
  appId: "1:1009731524211:web:17003d42599aa802757c06"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// --- Icons (unchanged) ---
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const GalleryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const LeafIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.5,14.5c0,4-3.5,9-7.5,9s-7.5-5-7.5-9s3.5-9,7.5-9S15.5,10.5,15.5,14.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8,23V12c0,0,4-1,4-4" /></svg>);
const LoadingSpinner = () => (<svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-4 4-4-4z" /></svg>);
const GoogleIcon = () => (<svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.462,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);

// --- Localized crop labels and lightweight Hindi translation helpers ---

// Crops used in UI (category grid, headers)
const CROPS = [
  { id: 'apple',    en: 'Apple',      hi: 'सेब',        emoji: '🍎' },
  { id: 'cherry',   en: 'Cherry',     hi: 'चेरी',       emoji: '🍒' },
  { id: 'corn',     en: 'Corn',       hi: 'मक्का',      emoji: '🌽' },
  { id: 'grape',    en: 'Grape',      hi: 'अंगूर',      emoji: '🍇' },
  { id: 'peach',    en: 'Peach',      hi: 'आड़ू',       emoji: '🍑' },
  { id: 'pepper',   en: 'Pepper',     hi: 'शिमला मिर्च', emoji: '🫑' },
  { id: 'potato',   en: 'Potato',     hi: 'आलू',        emoji: '🥔' },
  { id: 'strawberry', en: 'Strawberry', hi: 'स्ट्रॉबेरी', emoji: '🍓' },
  { id: 'tomato',   en: 'Tomato',     hi: 'टमाटर',      emoji: '🍅' }
];

// Species names as they appear from backend JSON -> Hindi label
const SPECIES_HI = {
  'Apple': 'सेब',
  'Corn (Maize)': 'मक्का',
  'Bell Pepper': 'शिमला मिर्च',
  'Grape': 'अंगूर',
  'Peach': 'आड़ू',
  'Potato': 'आलू',
  'Strawberry': 'स्ट्रॉबेरी',
  'Tomato': 'टमाटर',
  'Cherry': 'चेरी',
  'Blueberry': 'ब्लूबेरी',
  'Raspberry': 'रास्पबेरी',
  'Soybean': 'सोयाबीन',
  'Squash': 'कद्दू',
  'Orange': 'संतरा'
};

const cropLabel = (id, lang = 'en') => {
  const c = CROPS.find(x => x.id === id);
  return c ? (lang === 'hi' ? c.hi : c.en) : id || '';
};

const speciesLabel = (species, lang = 'en') => {
  if (!species) return '';
  return lang === 'hi' ? (SPECIES_HI[species] || species) : species;
};

// Ultra‑light keyword substitution to Hindi for JSON text.
// Not perfect, but covers common words appearing across disease_info.json.
const EN_HI_PAIRS = [
  ['Caused by', 'के कारण'],
  ['fungus', 'कवक'],
  ['bacterium', 'जीवाणु'],
  ['bacteria', 'जीवाणु'],
  ['virus', 'वायरस'],
  ['Apply', 'लागू करें'],
  ['Use', 'उपयोग करें'],
  ['Remove', 'हटा दें'],
  ['Avoid', 'बचें'],
  ['water', 'पानी'],
  ['watering', 'सिंचाई'],
  ['humid', 'आर्द्र'],
  ['warm', 'गर्म'],
  ['cool', 'ठंडा'],
  ['dry', 'शुष्क'],
  ['resistant varieties', 'प्रतिरोधी किस्में'],
  ['copper', 'तांबे'],
  ['fungicides', 'कवकनाशी'],
  ['insecticides', 'कीटनाशक'],
  ['oil', 'तेल'],
  ['soap', 'साबुन'],
  ['Rotate crops', 'फसल चक्र अपनाएं'],
  ['There is no cure', 'कोई इलाज नहीं है'],
  ['Remove infected plants', 'संक्रमित पौधों को हटाएं'],
  ['Good air circulation', 'अच्छा वायु संचार'],
  ['mulch', 'मल्च']
];

const translateToHindi = (text) => {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  for (const [en, hi] of EN_HI_PAIRS) {
    const re = new RegExp(`\\b${en}\\b`, 'gi');
    out = out.replace(re, (m) => {
      // Preserve leading capitalization if needed
      const isCap = /^[A-Z]/.test(m);
      return isCap ? hi : hi;
    });
  }
  return out;
};

// --- Translations (unchanged texts + guest) ---
const translations = { 
  en: { appName: "Crop Doc", appDescription: "Scan a leaf of the selected crop.", scanButton: "SCAN PLANT LEAF", historyButton: "View Scan History", analyzing: "Analyzing your leaf...", status: "STATUS", diseased: "DISEASED", healthy: "HEALTHY", confidence: "CONFIDENCE", cause: "Cause", prevention: "Prevention", treatment: "Treatment", scanAnother: "Scan Another", scanHistory: "Scan History", noHistory: "Your saved scans will appear here.", back: "Back", loginTitle: "Welcome to Crop Doc", loginSub: "Sign in or continue as a guest.", loginButton: "Sign In with Google", guestButton: "Continue as Guest", saveButton: "Save to History", saved: "History Saved!", storageFull: "History is full (10 max).", yourId: "Your User ID:", "Failed to save.": "Failed to save.", loginError: "Login failed. Please try again.", loggingIn: "Signing In...", selectCrop: "Select a Crop", healthyMessage: "Your plant appears to be healthy! Keep up the great work.", changeCrop: "Change Crop", logout: "Logout", analysisErrorTitle: "Analysis Failed", analysisErrorBody: "Could not connect to the server. Please check if the backend is running and try again.", tryAgain: "Try Again", saving: "Saving...", guestSavePrompt: "Sign in with Google to save your scan history." }, 
  hi: { appName: "क्रॉप डॉक्टर", appDescription: "चयनित फसल का एक पत्ता स्कैन करें।", scanButton: "पत्ते को स्कैन करें", historyButton: "स्कैन इतिहास देखें", analyzing: "आपके पत्ते का विश्लेषण हो रहा है...", status: "स्थिति", diseased: "रोगग्रस्त", healthy: "स्वस्थ", confidence: "आत्मविश्वास", cause: "कारण", prevention: "रोकथाम", treatment: "इलाज", scanAnother: "दूसरा स्कैन करें", scanHistory: "स्कैन इतिहास", noHistory: "आपके सहेजे गए स्कैन यहां दिखाई देंगे।", back: "वापस", loginTitle: "क्रॉप डॉक्टर में आपका स्वागत है", loginSub: "साइन इन करें या अतिथि के रूप में जारी रखें।", loginButton: "Google से साइन इन करें", guestButton: "अतिथि के रूप में जारी रखें", saveButton: "इतिहास में सहेजें", saved: "इतिहास सहेजा गया!", storageFull: "इतिहास भर गया है (अधिकतम 10)।", yourId: "आपकी उपयोगकर्ता आईडी:", "Failed to save.": "सहेजने में विफल।", loginError: "लॉगिन विफल। कृपया पुन: प्रयास करें।", loggingIn: "साइन इन हो रहा है...", selectCrop: "एक फसल चुनें", healthyMessage: "आपका पौधा स्वस्थ दिख रहा है! अच्छा काम करते रहें।", changeCrop: "फसल बदलें", logout: "लॉग आउट", analysisErrorTitle: "विश्लेषण विफल", analysisErrorBody: "सर्वर से कनेक्ट नहीं हो सका। कृपया जांचें कि बैकएंड चल रहा है या नहीं और फिर से प्रयास करें।", tryAgain: "पुनः प्रयास करें", saving: "सहेज रहा है...", guestSavePrompt: "अपना स्कैन इतिहास सहेजने के लिए Google से साइन इन करें।" } 
};

// --- App state (with guest) ---
const initialState = { status: 'authenticating', user: null, isGuest: false, selectedCategory: null, result: null, imagePreview: null, error: null, history: [] };
function appReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS': return { ...state, status: 'category_selection', user: action.payload, isGuest: !!action.payload.isAnonymous, error: null };
    case 'AUTH_FAIL': return { ...state, status: 'login', user: null, isGuest: false, selectedCategory: null };
    case 'LOGIN_ATTEMPT': return { ...state, status: 'authenticating', error: null };
    case 'LOGIN_FAIL': return { ...state, status: 'login', error: action.payload };
    case 'SELECT_CATEGORY': return { ...state, status: 'idle', selectedCategory: action.payload };
    case 'CHANGE_CATEGORY': return { ...state, status: 'category_selection', selectedCategory: null, result: null, imagePreview: null };
    case 'START_ANALYSIS': return { ...state, status: 'loading', imagePreview: action.payload.imagePreview, error: null };
    case 'ANALYSIS_SUCCESS': return { ...state, status: 'success', result: action.payload.result, imagePreview: action.payload.imagePreview };
    case 'ANALYSIS_ERROR': return { ...state, status: 'error', error: action.payload.error };
    case 'LOAD_HISTORY': return { ...state, history: action.payload };
    case 'VIEW_HISTORY': return { ...state, status: 'history' };
    case 'VIEW_HISTORY_DETAIL': return { ...state, status: 'success', result: action.payload.result, imagePreview: null, selectedCategory: action.payload.category };
    case 'RESET': return { ...state, status: 'idle', result: null, imagePreview: null, error: null };
    default: throw new Error("Unknown action type");
  }
}

// --- Utils ---
const toBase64 = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error); });

// --- Language switcher ---
const LanguageSwitcher = ({ language, setLanguage }) => (
  <div className="absolute top-4 right-4 z-20">
    <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-bold rounded-l-md transition-colors ${language === 'en' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>EN</button>
    <button onClick={() => setLanguage('hi')} className={`px-3 py-1 text-sm font-bold rounded-r-md transition-colors ${language === 'hi' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>HI</button>
  </div>
);

// --- Login (with guest) ---
const LoginScreen = ({ t, onLogin, onGuestLogin, error, status }) => (
  <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full z-10">
    <LeafIcon />
    <h1 className="text-3xl font-bold text-gray-800 mt-4">{t.loginTitle}</h1>
    <p className="text-gray-600 mt-2 mb-6">{t.loginSub}</p>
    {error && <p className="text-red-600 text-sm mb-4 font-semibold">{error}</p>}
    <div className="space-y-3">
      <button onClick={onLogin} disabled={status === 'authenticating'} className="w-full bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:bg-gray-200 flex items-center justify-center border border-gray-300">
        {status === 'authenticating' ? <><LoadingSpinner /> <span className="ml-2">{t.loggingIn}</span></> : <><GoogleIcon /> {t.loginButton}</>}
      </button>
      <button onClick={onGuestLogin} disabled={status === 'authenticating'} className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 flex items-center justify-center">
        {t.guestButton}
      </button>
    </div>
  </div>
);

// --- Category selection ---
const CategorySelectionScreen = ({ onSelectCategory, onLogout, t, language }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 z-10 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t.selectCrop}</h2>
      <div className="grid grid-cols-3 gap-4">
        {CROPS.map(cat => (
          <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className="p-4 bg-gray-100 rounded-xl hover:bg-green-100 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="text-5xl mb-2">{cat.emoji}</div>
            <p className="font-semibold text-gray-700 text-sm">{language === 'hi' ? cat.hi : cat.en}</p>
          </button>
        ))}
      </div>
      <button onClick={onLogout} className="mt-8 text-sm text-gray-500 font-semibold hover:text-red-600 transition-colors flex items-center justify-center mx-auto">
        <LogoutIcon /> {t.logout}
      </button>
    </div>
  );
};

// --- Start screen (camera + gallery) ---
const StartScreen = ({ onScan, onShowHistory, t, category, onChangeCategory, isGuest, language }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const emojiForCategory = (cat) => {
    switch (cat) {
      case 'apple': return '🍎'; case 'cherry': return '🍒'; case 'corn': return '🌽';
      case 'grape': return '🍇'; case 'peach': return '🍑'; case 'pepper': return '🫑';
      case 'potato': return '🥔'; case 'strawberry': return '🍓'; case 'tomato': return '🍅';
      default: return '🌿';
    }
  };

  return (
    <div className="text-center z-10">
      <div className="text-7xl mb-4">{emojiForCategory(category)}</div>
      <h1 className="text-4xl font-bold text-gray-800 mt-4 capitalize">
        {cropLabel(category, language)} {t.appName}
      </h1>
      <p className="text-gray-600 mt-2 mb-8 max-w-xs mx-auto">{t.appDescription}</p>

      <input type="file" accept="image/*" capture="environment" onChange={onScan} className="hidden" ref={cameraInputRef} />
      <input type="file" accept="image/*" onChange={onScan} className="hidden" ref={galleryInputRef} />

      <div className="w-full max-w-xs mx-auto space-y-4">
        <button onClick={() => cameraInputRef.current.click()} className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center">
          <CameraIcon /><span>Take Photo</span>
        </button>
        <button onClick={() => galleryInputRef.current.click()} className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center justify-center">
          <GalleryIcon /><span>Upload from Gallery</span>
        </button>
      </div>

      <div className="flex justify-center items-center space-x-2 mt-6">
        {!isGuest && (
          <button onClick={onShowHistory} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
            <HistoryIcon />{t.historyButton}
          </button>
        )}
        <button onClick={onChangeCategory} className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
          <BackIcon />{t.changeCrop}
        </button>
      </div>
    </div>
  );
};

const LoadingScreen = ({ t }) => (
  <div className="flex flex-col items-center justify-center text-center text-gray-800 z-10">
    <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    <h2 className="text-2xl font-semibold mt-6">{t.analyzing}</h2>
  </div>
);

// --- Result screen (Prevention + localized crop/species + Hindi details) ---
const ResultScreen = ({ result, imagePreview, onReset, onSave, onChangeCategory, t, isSaved, isGuest, language }) => {
  const isHealthy = result.status === 'Healthy';
  const confidencePercentage = (Number(result.confidence) * 100).toFixed(0);

  const cropTitle = result.name_of_species
    ? speciesLabel(result.name_of_species, language)
    : '';

  return (
    <div>
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden z-10">
        {imagePreview ? (
          <img src={imagePreview} alt="Scanned leaf" className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center"><LeafIcon /></div>
        )}

        <div className="p-5">
          {/* Crop name (localized) */}
          {cropTitle && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 tracking-wide">{language === 'hi' ? 'फसल' : 'CROP'}</p>
              <p className="text-lg font-bold text-gray-900">{cropTitle}</p>
            </div>
          )}

          <div className={`p-3 rounded-lg flex items-center justify-between ${isHealthy ? 'bg-green-100 text-green-800 ring-green-300' : 'bg-red-100 text-red-800 ring-red-300'} ring-2`}>
            <p className="text-2xl font-bold">{isHealthy ? t.healthy : t.diseased}</p>
            <p className="text-4xl font-bold">{isHealthy ? '✅' : '❗️'}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 mb-1">{t.confidence}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`${isHealthy ? 'bg-green-500' : 'bg-red-500'} h-2.5 rounded-full`} style={{ width: `${confidencePercentage}%` }}></div>
            </div>
            <p className="text-right text-sm font-semibold text-gray-700 mt-1">{confidencePercentage}%</p>
          </div>

          <div className="mt-5">
            {isHealthy ? (
              <p className="text-center text-gray-700 bg-green-50 p-4 rounded-lg">{t.healthyMessage}</p>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{result.diseaseName}</h3>

                <div className="space-y-4">
                  {/* Cause */}
                  <div className="text-sm">
                    <p className="font-bold text-gray-600">{t.cause}</p>
                    <p className="text-gray-800">{result.cause}</p>
                  </div>

                  {/* Prevention */}
                  <div className="text-sm">
                    <p className="font-bold text-gray-600">{t.prevention}</p>
                    <p className="text-gray-800">{result.prevention}</p>
                  </div>

                  {/* Treatment */}
                  <div className="text-sm">
                    <p className="font-bold text-gray-600">{t.treatment}</p>
                    <p className="text-gray-800">{result.treatment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-100">
            {isGuest ? (
              <p className="text-center text-sm text-gray-600 p-2 bg-yellow-50 rounded-lg">{t.guestSavePrompt}</p>
            ) : (
              <button
                onClick={onSave}
                disabled={isSaved}
                className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${isSaved ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSaved ? <><CheckIcon /> {t.saved}</> : <><SaveIcon /> {t.saveButton}</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 bg-white w-full max-w-md mx-auto rounded-b-2xl shadow-xl flex space-x-2">
        <button onClick={onReset} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">{t.scanAnother}</button>
        <button onClick={onChangeCategory} className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t.changeCrop}</button>
      </div>
    </div>
  );
};

// --- History & Error screens (unchanged layout) ---
const HistoryScreen = ({ history, onSelect, onBack, t, onDelete, language }) => {
  const emojiForCategory = (category) => {
    switch (category) { case 'apple': return '🍎'; case 'cherry': return '🍒'; case 'corn': return '🌽'; case 'grape': return '🍇'; case 'peach': return '🍑'; case 'pepper': return '🫑'; case 'potato': return '🥔'; case 'strawberry': return '🍓'; case 'tomato': return '🍅'; default: return '🌿'; }
  };
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-5 z-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.scanHistory}</h2>
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t.noHistory}</p>
      ) : (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
          {history.map((item) => {
            const diseaseName = item.result.status === 'Healthy' ? (language === 'hi' ? 'स्वस्थ' : 'Healthy') : item.result.diseaseName;
            return (
              <li key={item.id} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-4xl mr-4">{emojiForCategory(item.category)}</div>
                <div className="flex-grow cursor-pointer" onClick={() => onSelect(item)}>
                  <p className="font-bold text-gray-800">{diseaseName}</p>
                  <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 ml-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors" aria-label="Delete scan">
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button onClick={onBack} className="mt-6 w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">{t.back}</button>
    </div>
  );
};

const ErrorScreen = ({ t, error, onTryAgain }) => (
  <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full z-10">
    <h2 className="text-2xl font-bold text-red-600 mb-4">{t.analysisErrorTitle}</h2>
    <p className="text-gray-600 mb-6">{error}</p>
    <button onClick={onTryAgain} className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">{t.tryAgain}</button>
  </div>
);

// --- Main Page ---
export default function HomePage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [language, setLanguage] = useState('en');
  const [isSaved, setIsSaved] = useState(false);
  const t = translations[language];

  const API_ENDPOINT = 'http://10.81.99.141:8000/predict';

  // Auth + history
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        if (!user.isAnonymous) {
          const qRef = query(collection(db, 'users', user.uid, 'scans'));
          const unsubHistory = onSnapshot(qRef, snap => {
            const historyData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            dispatch({ type: 'LOAD_HISTORY', payload: historyData });
          });
          return () => unsubHistory();
        }
      } else {
        dispatch({ type: 'AUTH_FAIL' });
      }
    });
    return () => unsubscribeAuth();
  }, [t.loginError]);

  const handleLogin = async () => {
    dispatch({ type: 'LOGIN_ATTEMPT' });
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch { dispatch({ type: 'LOGIN_FAIL', payload: t.loginError }); }
  };
  const handleGuestLogin = async () => {
    dispatch({ type: 'LOGIN_ATTEMPT' });
    try { await signInAnonymously(auth); }
    catch { dispatch({ type: 'LOGIN_FAIL', payload: t.loginError }); }
  };
  const handleLogout = async () => { try { await signOut(auth); } catch {} };

  const handleSelectCategory = (category) => dispatch({ type: 'SELECT_CATEGORY', payload: category });
  const handleChangeCategory = () => dispatch({ type: 'CHANGE_CATEGORY' });

  // Image flow with robust health detection + Hindi details when needed
  const handleImageChange = async (event) => {
    const originalFile = event.target.files[0];
    if (!originalFile) return;

    setIsSaved(false);

    const tempPreviewUrl = URL.createObjectURL(originalFile);
    dispatch({ type: 'START_ANALYSIS', payload: { imagePreview: tempPreviewUrl } });

    let fileToSend = originalFile;
    let finalPreviewUrl = tempPreviewUrl;

    try {
      // Optional client resize can be added here.
    } catch {}

    try {
      const formData = new FormData();
      formData.append('file', fileToSend);

      const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const resultData = await response.json();

      // robust extraction
      const details = resultData.details || {};
      const diseaseName = details.disease_name || 'Healthy';
      const diseasedOrHealthy = details.diseased_or_healthy || '';
      const predictedClass = String(resultData.predicted_class || '');

      const isHealthy =
        /healthy/i.test(diseasedOrHealthy) ||
        /^(none|healthy)$/i.test(diseaseName) ||
        /healthy/i.test(predictedClass);

      const baseResult = {
        status: isHealthy ? 'Healthy' : 'Diseased',
        confidence: Number(resultData.confidence) || 0,
        name_of_species: details.name_of_species || '',
        diseaseName,
        cause: details.cause || 'No information available.',
        prevention: details.prevention || 'No information available.',
        treatment: details.treatment || 'No information available.'
      };

      // Localize species + details if Hindi selected
      if (language === 'hi') {
        baseResult.name_of_species = speciesLabel(baseResult.name_of_species, 'hi');
        baseResult.cause = translateToHindi(baseResult.cause);
        baseResult.prevention = translateToHindi(baseResult.prevention);
        baseResult.treatment = translateToHindi(baseResult.treatment);
        if (/^healthy$/i.test(baseResult.diseaseName)) baseResult.diseaseName = 'स्वस्थ';
      }

      dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result: baseResult, imagePreview: finalPreviewUrl } });
    } catch (error) {
      dispatch({ type: 'ANALYSIS_ERROR', payload: { error: t.analysisErrorBody } });
    }

    event.target.value = '';
  };

  const handleSave = () => {
    if (isSaved || state.isGuest) return;
    if (state.history.length >= 10) { toast.error(t.storageFull); return; }

    const savePromise = new Promise(async (resolve, reject) => {
      try {
        await addDoc(collection(db, 'users', state.user.uid, 'scans'), {
          category: state.selectedCategory || 'others',
          result: state.result,
          timestamp: Date.now()
        });
        resolve();
      } catch (e) { reject(e); }
    });

    toast.promise(savePromise, { loading: t.saving, success: t.saved, error: t['Failed to save.'] }, { duration: 1000 })
      .then(() => setIsSaved(true))
      .catch(() => {});
  };

  const handleDelete = async (scanId) => {
    if (!state.user) return;
    try { await deleteDoc(doc(db, 'users', state.user.uid, 'scans', scanId)); }
    catch (e) { /* ignore */ }
  };

  const handleReset = () => dispatch({ type: 'RESET' });
  const handleShowHistory = () => dispatch({ type: 'VIEW_HISTORY' });
  const handleHistorySelect = (item) => { setIsSaved(true); dispatch({ type: 'VIEW_HISTORY_DETAIL', payload: item }); };

  const renderContent = () => {
    switch (state.status) {
      case 'authenticating': return <LoginScreen t={t} onLogin={handleLogin} onGuestLogin={handleGuestLogin} status={state.status} />;
      case 'login': return <LoginScreen t={t} onLogin={handleLogin} onGuestLogin={handleGuestLogin} error={state.error} status={state.status} />;
      case 'category_selection': return <CategorySelectionScreen t={t} onSelectCategory={handleSelectCategory} onLogout={handleLogout} language={language} />;
      case 'idle': return <StartScreen t={t} category={state.selectedCategory} onScan={handleImageChange} onShowHistory={handleShowHistory} onChangeCategory={handleChangeCategory} isGuest={state.isGuest} language={language} />;
      case 'loading': return <LoadingScreen t={t} />;
      case 'success': return <ResultScreen t={t} result={state.result} imagePreview={state.imagePreview} onReset={handleReset} onSave={handleSave} onChangeCategory={handleChangeCategory} isSaved={isSaved} isGuest={state.isGuest} language={language} />;
      case 'history': return <HistoryScreen t={t} history={state.history} onSelect={handleHistorySelect} onBack={handleChangeCategory} onDelete={handleDelete} language={language} />;
      case 'error': return <ErrorScreen t={t} error={state.error} onTryAgain={handleReset} />;
      default: return <LoginScreen t={t} onLogin={handleLogin} onGuestLogin={handleGuestLogin} error={state.error} status={state.status} />;
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Toaster position="top-center" />
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      {renderContent()}
    </main>
  );
}
