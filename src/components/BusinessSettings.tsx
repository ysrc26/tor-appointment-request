import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
            title: "כתובת תפוסה",
            description: "הכתובת הציבורית הזו כבר בשימוש. בחר כתובת אחרת.",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          description: formData.description || null,
          phone: formData.phone || null,
          address: formData.address || null,
          terms: formData.terms || null,
          is_active: formData.is_active,
          slug: newSlug
        })
        .eq('id', business.id)
        .select()
        .single();

      if (error) throw error;

      onBusinessUpdate(data);
      setIsSlugEditing(false);
      
      toast({
        title: "הגדרות נשמרו",
        description: "פרטי העסק עודכנו בהצלחה"
      });
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את השינויים",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlugFromName = (name: string) => {
    // Convert Hebrew/English to URL-friendly slug
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    // Auto-generate slug if currently editing
    if (isSlugEditing) {
      const generatedSlug = generateSlugFromName(name);
      setNewSlug(generatedSlug);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">הגדרות העסק</h3>
        <p className="text-sm text-muted-foreground">
          נהל את פרטי העסק והגדרות נוספות
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            פרטי העסק
          </CardTitle>
          <CardDescription>
            עדכן את המידע הבסיסי של העסק שלך
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם העסק *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="שם העסק שלך"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">תיאור העסק</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="תאר את העסק שלך..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="052-123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="תל אביב, ישראל"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="terms">תנאי התורים</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="הזן תנאים מיוחדים, מדיניות ביטול וכו'..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Public URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            כתובת ציבורית
          </CardTitle>
          <CardDescription>
            הכתובת שבה לקוחות יוכלו לגשת לעסק שלך
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>הכתובת הנוכחית</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted rounded border text-sm">
                mytor.app/{business.slug}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${business.slug}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {isSlugEditing ? (
            <div className="space-y-3">
              <Label htmlFor="slug">כתובת חדשה</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">mytor.app/</span>
                <Input
                  id="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="my-business"
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewSlug(business.slug);
                    setIsSlugEditing(false);
                  }}
                >
                  ביטול
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsSlugEditing(false)}
                  disabled={!newSlug || newSlug === business.slug}
                >
                  אישור
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsSlugEditing(true)}
            >
              שנה כתובת
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Business Status */}
      <Card>
        <CardHeader>
          <CardTitle>סטטוס העסק</CardTitle>
          <CardDescription>
            קבע האם העסק פעיל וזמין לקבלת תורים חדשים
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">העסק פעיל</p>
              <p className="text-sm text-muted-foreground">
                כאשר העסק לא פעיל, לקוחות לא יוכלו לקבוע תורים חדשים
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 ml-2" />
          {isSaving ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>
    </div>
  );
};

export default BusinessSettings;