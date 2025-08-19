// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 text-gray-800 mt-12 border-t border-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:justify-between gap-8">
                {/* לוגו ותיאור */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-3 text-center md:text-left">
                    <div className="flex items-center gap-2 text-gray-900 text-2xl font-bold justify-center md:justify-start">
                        <ShoppingCart className="h-6 w-6" />
                        מרקט פלוס
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">
                        הפלטפורמה המקצועית שלך לקניות אונליין. מוצרים איכותיים, שירות אמין ותמיכה אישית.
                    </p>
                    <div className="flex gap-4 mt-2 justify-center md:justify-start">
                        <a href="#" className="text-red-600 hover:text-red-800 transition-colors">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-red-600 hover:text-red-800 transition-colors">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-red-600 hover:text-red-800 transition-colors">
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-red-600 hover:text-red-800 transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                {/* קישורים מהירים */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h3 className="text-gray-900 font-semibold mb-3">קישורים מהירים</h3>
                    <Link to="/dashboard" className="hover:text-red-600 transition-colors">דף הבית</Link>
                    <Link to="/products" className="hover:text-red-600 transition-colors">מוצרים</Link>
                    <Link to="/categories" className="hover:text-red-600 transition-colors">קטגוריות</Link>
                    <Link to="/orders" className="hover:text-red-600 transition-colors">הזמנות</Link>
                    <Link to="/users" className="hover:text-red-600 transition-colors">משתמשים</Link>
                </div>

                {/* מידע ליצירת קשר */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h3 className="text-gray-900 font-semibold mb-3">צור קשר</h3>
                    <p className="text-gray-600 text-sm">טלפון: 03-1234567</p>
                    <p className="text-gray-600 text-sm">מייל: info@marketplus.co.il</p>
                    <p className="text-gray-600 text-sm">כתובת: רחוב הדגל 10, תל אביב</p>
                </div>

                {/* מידע נוסף */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h3 className="text-gray-900 font-semibold mb-3">מידע נוסף</h3>
                    <Link to="/privacy" className="hover:text-red-600 transition-colors">מדיניות פרטיות</Link>
                    <Link to="/terms" className="hover:text-red-600 transition-colors">תנאי שימוש</Link>
                    <Link to="/support" className="hover:text-red-600 transition-colors">תמיכה</Link>
                </div>
            </div>

            {/* קו תחתון וזכויות יוצרים */}
            <div className="border-t border-gray-300 mt-8 py-6 text-gray-500 text-sm flex flex-col md:flex-row justify-center md:justify-between items-center gap-2">
                <span>&copy; {new Date().getFullYear()} מרקט פלוס. כל הזכויות שמורות.</span>
                <span>Designed with ❤️ by MarketPlus Team</span>
            </div>
        </footer>
    );
};

export default Footer;
