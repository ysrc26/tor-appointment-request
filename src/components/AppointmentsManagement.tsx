import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Plus, Calendar, List, Clock, User, Phone, Edit, Trash2, Crown, Zap } from 'lucide-react';
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
  start_time: string | null;
  end_time: string | null;
  status: string;
  note: string | null;
  service_id: string | null;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
}

interface AppointmentsManagementProps {
  businessId: string;
  userId: string;
}

const AppointmentsManagement = ({ businessId, userId }: AppointmentsManagementProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    date: '',
    start_time: '',
    service_id: '',
    note: ''
  });
  const { toast } = useToast();
  const { 
    limits, 
    checkCanCreateAppointment, 
    incrementUsage, 
    getSubscriptionTierLabel,
    createCheckoutSession 
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
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Unable to load appointments",
          variant: "destructive"
        });
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
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

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error in fetchServices:', error);
    }
  };

  const getDateFilterLabel = (filter: string) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'tomorrow': return 'Tomorrow';
      case 'this-week': return 'This Week';
      case 'next-week': return 'Next Week';
      case 'next-two-weeks': return 'Next Two Weeks';
      default: return 'All';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filterAppointments = (appointments: Appointment[]) => {
    let filtered = [...appointments];

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
        
        switch (dateFilter) {
          case 'today':
            return aptDateOnly.getTime() === today.getTime();
          case 'yesterday':
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            return aptDateOnly.getTime() === yesterday.getTime();
          case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return aptDateOnly.getTime() === tomorrow.getTime();
          case 'this-week':
            const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
            const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
            return aptDateOnly >= startOfWeek && aptDateOnly <= endOfWeek;
          case 'next-week':
            const startOfNextWeek = new Date(today.getTime() + (7 - today.getDay()) * 24 * 60 * 60 * 1000);
            const endOfNextWeek = new Date(startOfNextWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
            return aptDateOnly >= startOfNextWeek && aptDateOnly <= endOfNextWeek;
          case 'next-two-weeks':
            const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
            return aptDateOnly <= twoWeeksFromNow && aptDateOnly >= today;
          default:
            return true;
        }
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    return filtered;
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkCanCreateAppointment()) {
      toast({
        title: "Subscription Limit Reached",
        description: "Unable to create more appointments with current subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedService = services.find(s => s.id === formData.service_id);
      const endTime = selectedService && formData.start_time 
        ? new Date(`2000-01-01T${formData.start_time}:00Z`).getTime() + selectedService.duration_minutes * 60000
        : null;
      
      const endTimeString = endTime 
        ? new Date(endTime).toISOString().substr(11, 5)
        : null;

      const { error } = await supabase
        .from('appointments')
        .insert({
          business_id: businessId,
          user_id: userId,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          date: formData.date,
          start_time: formData.start_time || null,
          end_time: endTimeString,
          service_id: formData.service_id || null,
          note: formData.note || null,
          status: 'pending'
        });

      if (error) throw error;

      // Increment usage count
      await incrementUsage();

      toast({
        title: "Appointment Created Successfully",
        description: "New appointment added to calendar"
      });

      setFormData({
        client_name: '',
        client_phone: '',
        date: '',
        start_time: '',
        service_id: '',
        note: ''
      });
      setIsDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Unable to create appointment",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const selectedService = services.find(s => s.id === editingAppointment.service_id);
      const endTime = selectedService && editingAppointment.start_time 
        ? new Date(`2000-01-01T${editingAppointment.start_time}:00Z`).getTime() + selectedService.duration_minutes * 60000
        : null;
      
      const endTimeString = endTime 
        ? new Date(endTime).toISOString().substr(11, 5)
        : null;

      const { error } = await supabase
        .from('appointments')
        .update({
          client_name: editingAppointment.client_name,
          client_phone: editingAppointment.client_phone,
          date: editingAppointment.date,
          start_time: editingAppointment.start_time,
          end_time: endTimeString,
          service_id: editingAppointment.service_id,
          note: editingAppointment.note,
          status: editingAppointment.status
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      toast({
        title: "Appointment Updated Successfully",
        description: "Appointment details saved"
      });

      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Unable to update appointment",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Deleted",
        description: "Appointment removed from calendar"
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Unable to delete appointment",
        variant: "destructive"
      });
    }
  };

  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.client_name} - ${services.find(s => s.id === apt.service_id)?.name || 'Service'}`,
    date: apt.date,
    start: apt.start_time ? `${apt.date}T${apt.start_time}` : apt.date,
    end: apt.end_time ? `${apt.date}T${apt.end_time}` : undefined,
    backgroundColor: apt.status === 'confirmed' ? '#10b981' : apt.status === 'pending' ? '#f59e0b' : '#ef4444'
  }));

  const filteredAppointments = filterAppointments(appointments);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {limits && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {limits.subscription_tier === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
                  {limits.subscription_tier === 'business' && <Zap className="w-4 h-4 text-blue-500" />}
                  <span className="font-medium">{getSubscriptionTierLabel(limits.subscription_tier)} Subscription</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {limits.appointments_used}/{limits.appointments_limit} appointments
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {limits.appointments_limit - limits.appointments_used} remaining this month
              </div>
              {limits.subscription_tier === 'free' && limits.appointments_used >= limits.appointments_limit * 0.8 && (
                <Button size="sm" onClick={() => createCheckoutSession('premium')}>
                  Upgrade Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Management
              </CardTitle>
              <CardDescription>
                View and manage all your appointments
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  <div>
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_phone">Phone</Label>
                    <Input
                      id="client_phone"
                      value={formData.client_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_time">Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service</Label>
                    <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} ({service.duration_minutes} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="note">Notes</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Appointment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('dayGridMonth')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('timeGridWeek')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('timeGridDay')}
                  >
                    Day
                  </Button>
                  <Button
                    variant={calendarView === 'listWeek' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('listWeek')}
                  >
                    Agenda
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView={calendarView}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: ''
                    }}
                    events={calendarEvents}
                    height="600px"
                    locale="en"
                    direction="ltr"
                    eventClick={(info) => {
                      const appointment = appointments.find(apt => apt.id === info.event.id);
                      if (appointment) {
                        setEditingAppointment(appointment);
                        setIsEditDialogOpen(true);
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="next-week">Next Week</SelectItem>
                      <SelectItem value="next-two-weeks">Next Two Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => {
                      const service = services.find(s => s.id === appointment.service_id);
                      return (
                        <Card key={appointment.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{appointment.client_name}</span>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {getStatusLabel(appointment.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(appointment.date).toLocaleDateString()}
                                  </div>
                                  {appointment.start_time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {appointment.start_time}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {appointment.client_phone}
                                  </div>
                                  {service && (
                                    <span>{service.name}</span>
                                  )}
                                </div>
                                {appointment.note && (
                                  <p className="text-sm text-muted-foreground">{appointment.note}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAppointment(appointment);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No Appointments</h3>
                      <p className="text-muted-foreground">
                        No appointments found for the selected filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_client_name">Client Name</Label>
                <Input
                  id="edit_client_name"
                  value={editingAppointment.client_name}
                  onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, client_name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_client_phone">Phone</Label>
                <Input
                  id="edit_client_phone"
                  value={editingAppointment.client_phone}
                  onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, client_phone: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_date">Date</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={editingAppointment.date}
                  onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, date: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_start_time">Time</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={editingAppointment.start_time || ''}
                  onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, start_time: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_service">Service</Label>
                <Select 
                  value={editingAppointment.service_id || ''} 
                  onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, service_id: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select 
                  value={editingAppointment.status} 
                  onValueChange={(value) => setEditingAppointment(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_note">Notes</Label>
                <Textarea
                  id="edit_note"
                  value={editingAppointment.note || ''}
                  onChange={(e) => setEditingAppointment(prev => prev ? { ...prev, note: e.target.value } : null)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateAppointment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsManagement;