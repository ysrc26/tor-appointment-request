import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, Phone, Plus, Filter, Eye, Edit, Trash2, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { format, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, addWeeks, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string;
  service_id?: string;
  client_verified: boolean;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface AppointmentsManagementProps {
  businessId: string;
  userId: string;
}

const AppointmentsManagement = ({ businessId, userId }: AppointmentsManagementProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    client_name: '',
    client_phone: '',
    date: '',
    start_time: '',
    service_id: '',
    note: ''
  });
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const { toast } = useToast();
  const { 
    limits, 
    loading: subscriptionLoading, 
    checkCanCreateAppointment, 
    incrementUsage,
    getSubscriptionTierLabel 
  } = useSubscription();

  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, [businessId]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את התורים",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getDateFilterLabel = (filter: string) => {
    switch (filter) {
      case 'today': return 'היום';
      case 'yesterday': return 'אתמול';
      case 'tomorrow': return 'מחר';
      case 'this-week': return 'השבוע';
      case 'next-week': return 'השבוע הבא';
      case 'next-two-weeks': return 'שבועיים הבאים';
      default: return 'הכל';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'cancelled': return 'בוטל';
      case 'completed': return 'הושלם';
      default: return status;
    }
  };

  const filterAppointments = (appointments: Appointment[]) => {
    let filtered = appointments;

    // Filter by date
    if (selectedFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        switch (selectedFilter) {
          case 'today':
            return isToday(aptDate);
          case 'yesterday':
            return isYesterday(aptDate);
          case 'tomorrow':
            return isTomorrow(aptDate);
          case 'this-week':
            return aptDate >= startOfWeek(today, { weekStartsOn: 0 }) && 
                   aptDate <= endOfWeek(today, { weekStartsOn: 0 });
          case 'next-week':
            const nextWeek = addWeeks(today, 1);
            return aptDate >= startOfWeek(nextWeek, { weekStartsOn: 0 }) && 
                   aptDate <= endOfWeek(nextWeek, { weekStartsOn: 0 });
          case 'next-two-weeks':
            return aptDate >= today && aptDate <= addWeeks(today, 2);
          default:
            return true;
        }
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    return filtered;
  };

  const handleCreateAppointment = async () => {
    // Check subscription limits before creating appointment
    if (!checkCanCreateAppointment()) {
      return;
    }

    try {
      const selectedService = services.find(s => s.id === newAppointment.service_id);
      const startTime = newAppointment.start_time;
      const endTime = selectedService 
        ? addMinutesToTime(startTime, selectedService.duration_minutes)
        : addMinutesToTime(startTime, 60);

      // First, try to increment usage
      const canIncrement = await incrementUsage();
      if (!canIncrement) {
        toast({
          title: "הגעת לגבול המנוי",
          description: "לא ניתן ליצור תורים נוספים במנוי הנוכחי",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          business_id: businessId,
          user_id: userId,
          client_name: newAppointment.client_name,
          client_phone: newAppointment.client_phone,
          date: newAppointment.date,
          start_time: startTime,
          end_time: endTime,
          service_id: newAppointment.service_id || null,
          note: newAppointment.note || null,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "תור נוצר בהצלחה",
        description: "התור החדש נוסף ליומן"
      });

      setIsCreateDialogOpen(false);
      setNewAppointment({
        client_name: '',
        client_phone: '',
        date: '',
        start_time: '',
        service_id: '',
        note: ''
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את התור",
        variant: "destructive"
      });
    }
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          client_name: selectedAppointment.client_name,
          client_phone: selectedAppointment.client_phone,
          date: selectedAppointment.date,
          start_time: selectedAppointment.start_time,
          end_time: selectedAppointment.end_time,
          status: selectedAppointment.status,
          note: selectedAppointment.note
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "תור עודכן בהצלחה",
        description: "פרטי התור נשמרו"
      });

      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את התור",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "תור נמחק",
        description: "התור הוסר מהיומן"
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את התור",
        variant: "destructive"
      });
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const appointment = appointments.find(apt => apt.id === clickInfo.event.id);
    if (appointment) {
      const appointmentDate = new Date(appointment.date + 'T' + appointment.start_time);
      const now = new Date();
      
      if (appointmentDate > now) {
        setSelectedAppointment(appointment);
        setIsEditDialogOpen(true);
      }
    }
  };

  const handleDateClick = (selectInfo: any) => {
    const clickedDate = selectInfo.date;
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    const timeStr = format(clickedDate, 'HH:mm');
    
    setNewAppointment({
      ...newAppointment,
      date: dateStr,
      start_time: timeStr
    });
    setIsCreateDialogOpen(true);
  };

  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.client_name} - ${services.find(s => s.id === apt.service_id)?.name || 'שירות'}`,
    start: `${apt.date}T${apt.start_time}`,
    end: `${apt.date}T${apt.end_time}`,
    backgroundColor: apt.status === 'confirmed' ? '#10b981' : 
                   apt.status === 'pending' ? '#f59e0b' : 
                   apt.status === 'cancelled' ? '#ef4444' : '#3b82f6'
  }));

  const filteredAppointments = filterAppointments(appointments);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">טוען תורים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {limits && (
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">מנוי {getSubscriptionTierLabel(limits.subscription_tier)}</span>
                    <Badge variant="outline">
                      {limits.appointments_used}/{limits.appointments_limit} תורים
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    נותרו {limits.appointments_limit - limits.appointments_used} תורים החודש
                  </p>
                </div>
              </div>
              {limits.subscription_tier === 'free' && (
                <Button variant="hero" size="sm">
                  שדרג מנוי
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">ניהול תורים</h3>
          <p className="text-sm text-muted-foreground">
            צפה ונהל את כל התורים שלך
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              תור חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>יצירת תור חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">שם הלקוח</Label>
                <Input
                  id="client_name"
                  value={newAppointment.client_name}
                  onChange={(e) => setNewAppointment({...newAppointment, client_name: e.target.value})}
                  placeholder="הכנס שם לקוח"
                />
              </div>
              
              <div>
                <Label htmlFor="client_phone">טלפון</Label>
                <Input
                  id="client_phone"
                  value={newAppointment.client_phone}
                  onChange={(e) => setNewAppointment({...newAppointment, client_phone: e.target.value})}
                  placeholder="הכנס מספר טלפון"
                />
              </div>
              
              <div>
                <Label htmlFor="date">תאריך</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="start_time">שעה</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newAppointment.start_time}
                  onChange={(e) => setNewAppointment({...newAppointment, start_time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="service">שירות</Label>
                <Select value={newAppointment.service_id} onValueChange={(value) => setNewAppointment({...newAppointment, service_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שירות" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration_minutes} דק')
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note">הערות</Label>
                <Textarea
                  id="note"
                  value={newAppointment.note}
                  onChange={(e) => setNewAppointment({...newAppointment, note: e.target.value})}
                  placeholder="הערות נוספות"
                />
              </div>
              
              <Button onClick={handleCreateAppointment} className="w-full">
                צור תור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">יומן</TabsTrigger>
          <TabsTrigger value="list">רשימה</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('dayGridMonth')}
            >
              חודש
            </Button>
            <Button
              variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('timeGridWeek')}
            >
              שבוע
            </Button>
            <Button
              variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('timeGridDay')}
            >
              יום
            </Button>
            <Button
              variant={calendarView === 'listWeek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('listWeek')}
            >
              אג׳נדה
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={calendarView}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: ''
                }}
                events={calendarEvents}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                select={handleDateClick}
                eventClick={handleEventClick}
                locale="he"
                direction="rtl"
                height="auto"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="בחר תאריך" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התאריכים</SelectItem>
                <SelectItem value="today">היום</SelectItem>
                <SelectItem value="yesterday">אתמול</SelectItem>
                <SelectItem value="tomorrow">מחר</SelectItem>
                <SelectItem value="this-week">השבוע</SelectItem>
                <SelectItem value="next-week">השבוע הבא</SelectItem>
                <SelectItem value="next-two-weeks">שבועיים הבאים</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="confirmed">מאושר</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
                <SelectItem value="cancelled">בוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{appointment.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {appointment.client_phone}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(appointment.date), 'dd/MM/yyyy', { locale: he })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {appointment.start_time} - {appointment.end_time}
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {appointment.note && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {appointment.note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredAppointments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">אין תורים</h3>
                  <p className="text-sm text-muted-foreground">
                    לא נמצאו תורים לפי הפילטרים שנבחרו
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת תור</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_client_name">שם הלקוח</Label>
                <Input
                  id="edit_client_name"
                  value={selectedAppointment.client_name}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, client_name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_client_phone">טלפון</Label>
                <Input
                  id="edit_client_phone"
                  value={selectedAppointment.client_phone}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, client_phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_date">תאריך</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={selectedAppointment.date}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_start_time">שעת התחלה</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={selectedAppointment.start_time}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, start_time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_end_time">שעת סיום</Label>
                <Input
                  id="edit_end_time"
                  type="time"
                  value={selectedAppointment.end_time}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, end_time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_status">סטטוס</Label>
                <Select value={selectedAppointment.status} onValueChange={(value) => setSelectedAppointment({...selectedAppointment, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="confirmed">מאושר</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_note">הערות</Label>
                <Textarea
                  id="edit_note"
                  value={selectedAppointment.note || ''}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, note: e.target.value})}
                />
              </div>
              
              <Button onClick={handleUpdateAppointment} className="w-full">
                עדכן תור
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsManagement;