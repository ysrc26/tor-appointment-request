import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number;
  is_active: boolean;
}

interface ServicesManagementProps {
  businessId: string;
}

const ServicesManagement = ({ businessId }: ServicesManagementProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '60'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [businessId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את השירותים",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? Number(formData.price) : null,
        duration_minutes: Number(formData.duration_minutes),
        business_id: businessId
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        
        toast({
          title: "שירות עודכן בהצלחה",
          description: "השירות נשמר במערכת"
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;
        
        toast({
          title: "שירות נוסף בהצלחה",
          description: "השירות החדש זמין עכשיו ללקוחות"
        });
      }

      fetchServices();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את השירות",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price ? service.price.toString() : '',
      duration_minutes: service.duration_minutes.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את השירות?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      toast({
        title: "שירות נמחק",
        description: "השירות הוסר מהמערכת"
      });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את השירות",
        variant: "destructive"
      });
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      
      toast({
        title: `שירות ${!service.is_active ? 'הופעל' : 'הושבת'}`,
        description: `השירות כעת ${!service.is_active ? 'זמין' : 'לא זמין'} ללקוחות`
      });
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את סטטוס השירות",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '60'
    });
    setEditingService(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">טוען שירותים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">השירותים שלי</h3>
          <p className="text-sm text-muted-foreground">
            נהל את השירותים שאתה מציע ללקוחות
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              הוסף שירות
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'ערוך שירות' : 'הוסף שירות חדש'}
              </DialogTitle>
              <DialogDescription>
                הגדר את פרטי השירות שלך
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם השירות *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="למשל: תספורת גברים"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">תיאור השירות</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="תאר את השירות בקצרה..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">מחיר (₪)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="100"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">משך זמן (דקות) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    placeholder="60"
                    min="15"
                    max="480"
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button type="submit">
                  {editingService ? 'עדכן שירות' : 'הוסף שירות'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">אין שירותים עדיין</h3>
            <p className="text-muted-foreground mb-4">
              הוסף את השירות הראשון שלך כדי שלקוחות יוכלו לקבוע תורים
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              הוסף שירות ראשון
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className={`transition-all ${!service.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>
                    {service.description && (
                      <CardDescription>{service.description}</CardDescription>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} דקות</span>
                    </div>
                    {service.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>₪{service.price}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant={service.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleServiceStatus(service)}
                  >
                    {service.is_active ? 'השבת' : 'הפעל'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;