// src/components/Footer.jsx - Footer מקצועי ומעוצב
import React from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Phone,
    Mail,
    MapPin,
    Clock,
    CreditCard,
    Truck,
    Shield,
    Users
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* עמודה ראשונה - לוגו ותיאור (הכי מימין) */}
                <div className="footer-section footer-logo-section">
                    <Link to="/dashboard" className="footer-logo">
                        מרקט פלוס
                        <ShoppingCart className="footer-logo-icon h-6 w-6" />
                    </Link>
                    <p className="footer-description">
                        הפלטפורמה המובילה לקניות אונליין בישראל.
                        מוצרים איכותיים, משלוח מהיר ושירות מעולה.
                    </p>

                    {/* סטטיסטיקות קצרות */}
                    <div className="footer-stats">
                        <div className="footer-stat">
                            <span>10,000+ לקוחות</span>
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="footer-stat">
                            <span>100% מאובטח</span>
                            <Shield className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* עמודה שנייה - קישורים מהירים */}
                <div className="footer-section">
                    <h3 className="footer-section-title">קישורים מהירים</h3>
                    <div className="footer-links">

                        <Link to="/about" className="footer-link">אודותינו</Link>
                        <Link to="/support" className="footer-link">תמיכה</Link>
                        <Link to="/faq" className="footer-link">שאלות נפוצות</Link>
                    </div>
                </div>

                {/* עמודה שלישית - שירותים */}
                <div className="footer-section">
                    <h3 className="footer-section-title">השירותים שלנו</h3>
                    <div className="footer-services">
                        <div className="footer-service">
                            <span>משלוח חינם מעל ₪200</span>
                            <Truck className="h-4 w-4" />
                        </div>
                        <div className="footer-service">
                            <span>תשלום מאובטח</span>
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="footer-service">
                            <span>תמיכה 24/7</span>
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="footer-service">
                            <span>החזרה תוך 30 יום</span>
                            <Shield className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* עמודה רביעית - צור קשר (הכי משמאל) */}
                <div className="footer-section">
                    <h3 className="footer-section-title">צור קשר</h3>
                    <div className="footer-contact">
                        <div className="footer-contact-item">
                            <span>03-1234567</span>
                            <Phone className="h-4 w-4" />
                        </div>
                        <div className="footer-contact-item">
                            <span>info@marketplus.co.il</span>
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="footer-contact-item">
                            <span>רחוב דיזנגוף 50, תל אביב</span>
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div className="footer-contact-item">
                            <span>א׳-ה׳: 9:00-18:00</span>
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>

                    {/* רשתות חברתיות */}
                    <div className="footer-social-section">
                        <h4 className="footer-social-title">עקבו אחרינו</h4>
                        <div className="footer-social">
                            <a href="#" className="footer-social-link" aria-label="LinkedIn">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="#" className="footer-social-link" aria-label="Twitter">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="footer-social-link" aria-label="Instagram">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="footer-social-link" aria-label="Facebook">
                                <Facebook className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* חלק תחתון - זכויות יוצרים ומידע משפטי */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <div className="footer-copyright">
                        <span>&copy; 2025 מרקט פלוס. כל הזכויות שמורות.</span>
                    </div>

                    <div className="footer-legal">
                        <Link to="/privacy" className="footer-legal-link">מדיניות פרטיות</Link>
                        <Link to="/terms" className="footer-legal-link">תנאי שימוש</Link>
                    </div>


                </div>
            </div>
        </footer>
    );
};

export default Footer;