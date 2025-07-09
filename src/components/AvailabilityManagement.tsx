import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save } from 'lucide-react';

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface AvailabilityManagementProps {
  businessId: string;
  userId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
];

const AvailabilityManagement = ({ businessId, userId }: AvailabilityManagementProps) => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [businessId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week');

      if (error) throw error;
      
      // Create default availability for all days if none exist
      const existingDays = data?.map(a => a.day_of_week) || [];
      const defaultAvailability = DAYS_OF_WEEK.map(day => {
        const existing = data?.find(a => a.day_of_week === day.value);
        return existing || {
          id: `temp-${day.value}`,
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '17:00',
          is_active: day.value < 5, // Sunday-Thursday active by default
          business_id: businessId,
          user_id: userId
        };
      });
      
      setAvailability(defaultAvailability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את שעות הפעילות",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Delete existing availability
      await supabase
        .from('availability')
        .delete()
        .eq('business_id', businessId);

      // Insert new availability for active days
      const activeAvailability = availability
        .filter(a => a.is_active)
        .map(a => ({
          business_id: businessId,
          user_id: userId,
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time,
          is_active: true
        }));

      if (activeAvailability.length > 0) {
        const { error } = await supabase
          .from('availability')
          .insert(activeAvailability);

        if (error) throw error;
      }

      toast({
        title: "שעות פעילות נשמרו",
        description: "שעות הפעילות שלך עודכנו בהצלחה"
      });
      
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את שעות הפעילות",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDay = (dayIndex: number, field: keyof Availability, value: any) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">טוען שעות פעילות...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">שעות פעילות</h3>
          <p className="text-sm text-muted-foreground">
            הגדר מתי אתה זמין לקבלת תורים
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 ml-2" />
          {isSaving ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            שעות עבודה שבועיות
          </CardTitle>
          <CardDescription>
            סמן את הימים בהם אתה זמין והגדר את שעות העבודה
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day.value} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  checked={availability[index]?.is_active || false}
                  onCheckedChange={(checked) => updateDay(index, 'is_active', checked)}
                />
                <Label className="font-medium min-w-[60px]">
                  {day.label}
                </Label>
              </div>
              
              {availability[index]?.is_active && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">מ-</Label>
                    <Input
                      type="time"
                      value={availability[index]?.start_time || '09:00'}
                      onChange={(e) => updateDay(index, 'start_time', e.target.value)}
                      className="w-24"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">עד-</Label>
                    <Input
                      type="time"
                      value={availability[index]?.end_time || '17:00'}
                      onChange={(e) => updateDay(index, 'end_time', e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              )}
              
              {!availability[index]?.is_active && (
                <span className="text-sm text-muted-foreground">לא זמין</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הערות חשובות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• לקוחות יוכלו לקבוע תורים רק בימים ובשעות שסימנת כזמינים</p>
          <p>• השינויים ייכנסו לתוקף מיידית לאחר השמירה</p>
          <p>• תוכל לעדכן את שעות הפעילות בכל עת</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityManagement;