import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">MyTor</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            תכונות
          </a>
          <button 
            onClick={() => navigate('/pricing')}
            className="text-foreground hover:text-primary transition-colors"
          >
            מחירים
          </button>
          <a href="#demo" className="text-foreground hover:text-primary transition-colors">
            Demo
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Button variant="hero" size="lg" onClick={() => navigate('/dashboard')}>
              הדשבורד שלי
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                התחבר
              </Button>
              <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
                התחל בחינם
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
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              תכונות
            </a>
            <button 
              onClick={() => {
                navigate('/pricing');
                setIsMenuOpen(false);
              }}
              className="text-foreground hover:text-primary transition-colors py-2 text-right"
            >
              מחירים
            </button>
            <a 
              href="#demo" 
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </a>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <Button variant="hero" className="w-full" onClick={() => navigate('/dashboard')}>
                  הדשבורד שלי
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                    התחבר
                  </Button>
                  <Button variant="hero" className="w-full" onClick={() => navigate('/auth')}>
                    התחל בחינם
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