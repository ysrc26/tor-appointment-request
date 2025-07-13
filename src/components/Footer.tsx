import { Calendar, Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

const Footer = () => {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-foreground text-background py-12 sm:py-16">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">MyTor</span>
            </div>
            <p className="text-background/80 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Ultra-simple appointment booking designed specifically for Israeli small businesses. 
              No complexity, just results.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="mailto:hello@mytor.app" className="text-background/60 hover:text-background transition-colors">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="tel:+972-50-123-4567" className="text-background/60 hover:text-background transition-colors">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.product')}</h4>
            <ul className="space-y-1 sm:space-y-2 text-background/80">
              <li><a href="#features" className="hover:text-background transition-colors text-sm sm:text-base">{t('footer.features')}</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors text-sm sm:text-base">{t('footer.pricing')}</a></li>
              <li><a href="#demo" className="hover:text-background transition-colors text-sm sm:text-base">Demo</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Templates</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.support')}</h4>
            <ul className="space-y-1 sm:space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">{t('footer.help')}</a></li>
              <li><a href={`mailto:${t('footer.email')}`} className="hover:text-background transition-colors text-sm sm:text-base">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">{t('footer.whatsapp')}</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Video Tutorials</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-6 sm:pt-8 mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-background/60 text-xs sm:text-sm text-center sm:text-left">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-background/60 items-center">
              <a href="#" className="hover:text-background transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-background transition-colors">{t('footer.terms')}</a>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;