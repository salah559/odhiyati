import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logoImage from "@assets/logo.jpg";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-16">
      {/* Islamic Pattern Background */}
      <div className="relative">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="container mx-auto max-w-7xl px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={logoImage}
                  alt="أضحيتي" 
                  className="h-12 w-auto bg-white dark:bg-white rounded-md px-2 py-1"
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                منصة موثوقة لشراء الأغنام والأضاحي عبر الإنترنت. نوفر لك أفضل المنتجات بجودة عالية وأسعار منافسة.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" data-testid="link-footer-home">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      الرئيسية
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/products" data-testid="link-footer-products">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      المنتجات
                    </span>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    من نحن
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    سياسة الخصوصية
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+213 XXX XXX XXX</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>info@adhiyati.com</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>الجزائر</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">تابعنا</h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                  data-testid="link-facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                  data-testid="link-instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                  data-testid="link-twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} أضحيتي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
