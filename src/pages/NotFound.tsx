import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl mb-4">🧭</div>
        <h1 className="text-6xl font-bold text-blue-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للصفحة السابقة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}