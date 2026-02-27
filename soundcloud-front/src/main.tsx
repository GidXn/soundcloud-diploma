import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';
const queryClient = new QueryClient();
const googleClientId = '755285320747-7qnfgviqbgooq0vasjbeoisetkklkn69.apps.googleusercontent.com';
console.log('GIS clientId:', googleClientId);
console.log('Origin:', window.location.origin);
// console.log('[GIS] clientId from app:', googleClientId);
// console.log('[GIS] front origin:', window.location.origin);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <App/>
                </GoogleOAuthProvider>
            </QueryClientProvider>
    </Provider>
);
