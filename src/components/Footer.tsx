import { Calendar, Mail, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">MyTor</span>
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              Ultra-simple appointment booking designed specifically for Israeli small businesses. 
              No complexity, just results.
            </p>
            <div className="flex gap-4">
              <a href="mailto:hello@mytor.app" className="text-background/60 hover:text-background transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="tel:+972-50-123-4567" className="text-background/60 hover:text-background transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors">Pricing</a></li>
              <li><a href="#demo" className="hover:text-background transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Templates</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">WhatsApp Support</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Video Tutorials</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2024 MyTor. Made with ❤️ for Israeli small businesses.
            </p>
            <div className="flex gap-6 text-sm text-background/60">
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