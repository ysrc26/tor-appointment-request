import { Calendar, Mail, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
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
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
            <ul className="space-y-1 sm:space-y-2 text-background/80">
              <li><a href="#features" className="hover:text-background transition-colors text-sm sm:text-base">Features</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors text-sm sm:text-base">Pricing</a></li>
              <li><a href="#demo" className="hover:text-background transition-colors text-sm sm:text-base">Demo</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Templates</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Help Center</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Contact Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">WhatsApp Support</a></li>
              <li><a href="#" className="hover:text-background transition-colors text-sm sm:text-base">Video Tutorials</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-6 sm:pt-8 mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-background/60 text-xs sm:text-sm text-center sm:text-left">
              © 2024 MyTor. Made with ❤️ for Israeli small businesses.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-background/60">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">English</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;