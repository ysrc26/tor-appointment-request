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
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
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
      if (!data || data.length === 0) {
        const defaultAvailability = DAYS_OF_WEEK.map(day => ({
          id: `temp-${day.value}`,
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '17:00',
          is_active: day.value >= 0 && day.value <= 4 // Active for Sunday-Thursday by default
        }));
        setAvailability(defaultAvailability);
      } else {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Unable to load availability hours",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvailability = (dayOfWeek: number, field: string, value: any) => {
    setAvailability(prev => 
      prev.map(item => 
        item.day_of_week === dayOfWeek 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Delete existing availability for this business
      const { error: deleteError } = await supabase
        .from('availability')
        .delete()
        .eq('business_id', businessId);

      if (deleteError) throw deleteError;

      // Insert new availability
      const availabilityData = availability.map(item => ({
        business_id: businessId,
        user_id: userId,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_active: item.is_active
      }));

      const { error: insertError } = await supabase
        .from('availability')
        .insert(availabilityData);

      if (insertError) throw insertError;

      toast({
        title: "Availability Hours Saved",
        description: "Your availability hours have been updated successfully"
      });

      // Refresh data
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Unable to save availability hours",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading availability hours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability Hours
              </CardTitle>
              <CardDescription>
                Set when you're available for appointments
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Weekly Working Hours</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Mark the days you're available and set your working hours
            </p>
            
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailability = availability.find(a => a.day_of_week === day.value);
                
                return (
                  <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 min-w-[100px]">
                      <Switch
                        checked={dayAvailability?.is_active || false}
                        onCheckedChange={(checked) => updateAvailability(day.value, 'is_active', checked)}
                      />
                      <span className="font-medium">{day.label}</span>
                    </div>
                    
                    {dayAvailability?.is_active ? (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">From:</Label>
                          <Input
                            type="time"
                            value={dayAvailability.start_time}
                            onChange={(e) => updateAvailability(day.value, 'start_time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">To:</Label>
                          <Input
                            type="time"
                            value={dayAvailability.end_time}
                            onChange={(e) => updateAvailability(day.value, 'end_time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Not available</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Clients can only book appointments on days and times you've marked as available</p>
          <p>• Changes take effect immediately after saving</p>
          <p>• You can update your availability hours at any time</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityManagement;