import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, ExternalLink, Globe, Settings } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  terms: string | null;
  is_active: boolean;
}

interface BusinessSettingsProps {
  business: Business;
  onBusinessUpdate: (business: Business) => void;
}

const BusinessSettings = ({ business, onBusinessUpdate }: BusinessSettingsProps) => {
  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description || '',
    phone: business.phone || '',
    address: business.address || '',
    terms: business.terms || '',
    is_active: business.is_active
  });
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(business.slug);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Check if slug is available (if it was changed)
      if (newSlug !== business.slug) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', business.id)
          .single();

        if (existingBusiness) {
          toast({
            title: "Address Taken",
            description: "This public address is already in use. Choose a different address.",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
      }

      const updateData = {
        name: formData.name,
        description: formData.description || null,
        phone: formData.phone || null,
        address: formData.address || null,
        terms: formData.terms || null,
        is_active: formData.is_active,
        ...(newSlug !== business.slug && { slug: newSlug })
      };

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      const updatedBusiness = { ...business, ...updateData };
      onBusinessUpdate(updatedBusiness);

      toast({
        title: "Settings Saved",
        description: "Business details have been updated successfully"
      });

      setIsSlugEditing(false);
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast({
        title: "Error",
        description: "Unable to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);
    setNewSlug(slug);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Business Settings
              </CardTitle>
              <CardDescription>
                Manage your business details and additional settings
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Details */}
          <div>
            <h4 className="font-medium mb-4">Business Details</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Update your business basic information
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your business name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Tel Aviv, Israel"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms">Appointment Terms</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Enter special terms, cancellation policy, etc..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Public Address */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Public Address</h4>
            <p className="text-sm text-muted-foreground mb-6">
              The address where clients can access your business
            </p>
            
            <div className="space-y-4">
              <div>
                <Label>Current Address</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">mytor.app/{business.slug}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/${business.slug}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Dialog open={isSlugEditing} onOpenChange={setIsSlugEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Change Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Public Address</DialogTitle>
                    <DialogDescription>
                      Choose a new address for your business public page
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="slug">New Address</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">mytor.app/</span>
                        <Input
                          id="slug"
                          value={newSlug}
                          onChange={handleSlugChange}
                          placeholder="my-business"
                          className="flex-1"
                          dir="ltr"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only English letters, numbers, and hyphens allowed
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setNewSlug(business.slug);
                      setIsSlugEditing(false);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      setIsSlugEditing(false);
                      // The actual save will happen when user clicks main save button
                    }}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Business Status */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Business Status</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Set whether the business is active and available for new appointments
            </p>
            
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <div>
                <p className="font-medium">Business Active</p>
                <p className="text-sm text-muted-foreground">
                  When inactive, clients cannot book new appointments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettings;