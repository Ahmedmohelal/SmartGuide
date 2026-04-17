import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google' // 1. استيراد المكتبة
import App from './App'
import './index.css'
import "sonner/dist/styles.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  // 2. تغليف التطبيق بالـ Provider وإضافة الـ Client ID
  <GoogleOAuthProvider clientId="806986595421-7vssl8bbcr3aebtb59d332o4h3aako9l.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
)

