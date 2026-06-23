# Development Setup

## 🛠️ إعداد بيئة التطوير

### المتطلبات

#### System Requirements
- **Node.js**: >= 18.x (يمكنك تحميل من [nodejs.org](https://nodejs.org))
- **npm**: >= 9.x (يأتي مع Node.js)
- **Git**: تثبيت من [git-scm.com](https://git-scm.com)

#### Hardware Recommendations
- **RAM**: 4GB على الأقل
- **Disk**: 1GB free space
- **CPU**: أي معالج حديث

---

## 📥 التثبيت الأول

### 1. Clone المشروع
```bash
git clone https://github.com/yourusername/SmartGuideEgypt.git
cd SmartGuideEgypt/admin-dashboard
```

### 2. تثبيت Dependencies
```bash
npm install
```

### 3. إعداد متغيرات البيئة
```bash
# Copy الـ example file
cp .env.example .env.local

# ثم عدّل الملف بقيمك
nano .env.local
```

### 4. بدء التطوير
```bash
npm run dev
```

الآن يمكنك الوصول للتطبيق على `http://localhost:5175`

---

## 📁 Project Structure

```
admin-dashboard/
├── public/              # ملفات ثابتة
├── src/
│   ├── components/      # React components
│   ├── pages/          # صفحات التطبيق
│   ├── services/       # API services
│   ├── context/        # State management
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   ├── config/         # Configuration
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment template
├── .editorconfig       # Editor configuration
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
└── README.md           # Project documentation
```

---

## 🎯 Available Scripts

### تطوير
```bash
# بدء dev server مع hot reload
npm run dev

# بدء dev server على port مخصص
npm run dev -- --port 5176
```

### البناء
```bash
# بناء للإنتاج
npm run build

# معاينة الإصدار النهائي
npm run preview
```

### الاختبارات
```bash
# تشغيل unit tests
npm run test

# تشغيل tests مع coverage
npm run test:coverage

# تشغيل e2e tests
npm run test:e2e
```

### الجودة
```bash
# تشغيل ESLint
npm run lint

# إصلاح مشاكل ESLint تلقائياً
npm run lint:fix

# تشغيل Prettier
npm run format

# فحص التنسيق
npm run format:check
```

---

## 🔧 Configure Your IDE

### Visual Studio Code

#### Extensions المُوصى بها
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

#### Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true
  }
}
```

### WebStorm / IntelliJ IDEA

1. File → Settings → Languages & Frameworks
2. JavaScript → Code Quality Tools → ESLint
3. Enable ESLint
4. Set configuration file path to `.eslintrc`

---

## 📚 Dependencies Overview

```json
{
  "dependencies": {
    "react": "^19.2.0",           // UI library
    "react-dom": "^19.2.0",        // DOM rendering
    "react-router-dom": "^7.13.1", // Routing
    "axios": "^1.15.0",            // HTTP client
    "recharts": "^2.15.0",         // Charts library
    "lucide-react": "^0.577.0",    // Icons
    "framer-motion": "^12.38.0",   // Animations
    "react-hot-toast": "^2.6.0",   // Notifications
    "sweetalert2": "^11.26.25"     // Alert dialogs
  },
  "devDependencies": {
    "vite": "^7.3.1",              // Build tool
    "@vitejs/plugin-react": "^5.1.1", // React plugin for Vite
    "tailwindcss": "^4.2.1",       // CSS framework
    "@tailwindcss/vite": "^4.2.1", // Tailwind Vite plugin
    "eslint": "^8.x",              // Code linter
    "prettier": "^3.x"             // Code formatter
  }
}
```

---

## 🌍 Environment Variables

### Template (.env.example)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_TOKEN_KEY=admin_auth_token

# App Configuration
VITE_APP_NAME=SmartGuide Admin
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

### Development (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_TOKEN_KEY=admin_auth_token
VITE_APP_NAME=SmartGuide Admin
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.example.com/api
VITE_AUTH_TOKEN_KEY=admin_auth_token
VITE_APP_NAME=SmartGuide Admin
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

---

## 🚀 First Steps

1. **اقرأ الوثائق الأساسية**
   - [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
   - [CODE_STANDARDS.md](./CODE_STANDARDS.md)

2. **استكشف الكود الموجود**
   - تصفح `src/pages` لفهم هيكل الصفحات
   - ادرس `src/components` للمكونات المشتركة
   - اقرأ `src/services` لفهم API integration

3. **جرّب تعديل بسيط**
   - عدّل `src/App.jsx`
   - غيّر لون أو نص
   - لاحظ التغيير فوراً بسبب HMR

4. **ابدأ ميزة جديدة**
   - أنشئ component جديد
   - استخدم الـ hooks المتاحة
   - اتبع معايير الكود

---

## 🐛 Troubleshooting

### Node/npm Issues
```bash
# تحقق من الإصدارات
node --version    # يجب أن يكون >= 18
npm --version     # يجب أن يكون >= 9

# إعادة تثبيت
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# قتل العملية على الـ port
# Windows: أنظر TROUBLESHOOTING.md
# Mac: lsof -i :5175 && kill -9 <PID>
```

### HMR Not Working
```bash
# حذف cache وإعادة تشغيل
rm -rf .vite
npm run dev
```

---

## 📖 Further Reading

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

---

## ✅ Ready to Go!

الآن أنت جاهز للبدء! 🚀

اقرأ [CONTRIBUTING.md](./CONTRIBUTING.md) لمعرفة كيفية المساهمة بفعالية.

**Happy Coding! 💻**
