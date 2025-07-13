import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">MyTor</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a href="#features" className="text-sm text-foreground hover:text-primary transition-colors">
            {t('navigation.features')}
          </a>
          <button 
            onClick={() => navigate('/pricing')}
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            {t('navigation.pricing')}
          </button>
          <a href="#demo" className="text-sm text-foreground hover:text-primary transition-colors">
            Demo
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <LanguageSelector />
          {user ? (
            <Button variant="hero" size="sm" onClick={() => navigate('/dashboard')} className="text-sm">
              {t('navigation.dashboard')}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-sm">
                {t('navigation.login')}
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate('/auth')} className="text-sm">
                {t('buttons.getStarted')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-3 sm:px-4 py-4 flex flex-col gap-3">
            <LanguageSelector />
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition-colors py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.features')}
            </a>
            <button 
              onClick={() => {
                navigate('/pricing');
                setIsMenuOpen(false);
              }}
              className="text-foreground hover:text-primary transition-colors py-2 text-left text-sm"
            >
              {t('navigation.pricing')}
            </button>
            <a 
              href="#demo" 
              className="text-foreground hover:text-primary transition-colors py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </a>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {user ? (
                <Button variant="hero" className="w-full" size="sm" onClick={() => navigate('/dashboard')}>
                  {t('navigation.dashboard')}
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" size="sm" onClick={() => navigate('/auth')}>
                    {t('navigation.login')}
                  </Button>
                  <Button variant="hero" className="w-full" size="sm" onClick={() => navigate('/auth')}>
                    {t('buttons.getStarted')}
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;