import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const visitSchema = z.object({
  patient_id: z.string().min(1, 'Required'),
  staff_id: z.string().min(1, 'Required'),
  scheduled_at: z.string().min(1, 'Required'),
  location: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});

type VisitFormValues = z.infer<typeof visitSchema>;

interface Visit {
  id: string;
  patient_id: string;
  staff_id: string;
  scheduled_at: string;
  status: string;
  location: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  staff: {
    full_name: string;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Staff {
  id: string;
  full_name: string;
}

export const Schedule: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema)
  });

  useEffect(() => {
    fetchVisits();
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [patientsRes, staffRes] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name').order('last_name'),
        supabase.from('profiles').select('id, full_name').order('full_name')
      ]);
      setPatients(patientsRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients(first_name, last_name),
          staff:profiles(full_name)
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VisitFormValues) => {
    try {
      const { error } = await supabase
        .from('visits')
        .insert([{
          ...data,
          status: 'scheduled'
        }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      reset();
      fetchVisits();
      alert('Visit scheduled successfully!');
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      alert('Error scheduling visit: ' + error.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 italic">Schedule</h1>
          <p className="text-zinc-500">Manage nursing visits and caregiver appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-full">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="rounded-full px-6" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Sidebar Placeholder */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-zinc-900">March 2026</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="p-1"><ChevronLeft size={18} /></Button>
                <Button variant="ghost" size="sm" className="p-1"><ChevronRight size={18} /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 mb-4">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    i + 1 === 4 ? 'bg-partners-blue-dark text-white' : 'hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-partners-blue-dark p-6 rounded-3xl text-white shadow-lg shadow-partners-blue-dark/20">
            <h4 className="font-bold mb-2">Today's Summary</h4>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Total Visits</span>
                <span className="font-bold">
                  {visits.filter(v => new Date(v.scheduled_at).toDateString() === new Date().toDateString()).length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Completed</span>
                <span className="font-bold">
                  {visits.filter(v => 
                    new Date(v.scheduled_at).toDateString() === new Date().toDateString() && 
                    v.status === 'completed'
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Pending</span>
                <span className="font-bold">
                  {visits.filter(v => 
                    new Date(v.scheduled_at).toDateString() === new Date().toDateString() && 
                    v.status !== 'completed'
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visit List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Clock className="text-partners-blue-dark" size={20} />
            Upcoming Visits
          </h3>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-zinc-200 animate-pulse"></div>
            ))
          ) : visits.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-zinc-200 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                <CalendarIcon size={32} />
              </div>
              <p className="text-zinc-500">No visits scheduled for this period.</p>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>Schedule First Visit</Button>
            </div>
          ) : (
            visits.map((visit) => (
              <div key={visit.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-partners-blue-dark">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{visit.patient.last_name}, {visit.patient.first_name}</h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-zinc-400" />
                        {visit.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-zinc-400" />
                        Staff: {visit.staff.full_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      visit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      visit.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {visit.status}
                    </span>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Visit"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Patient</label>
            <select
              {...register('patient_id')}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-red-500">{errors.patient_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Assigned Staff</label>
            <select
              {...register('staff_id')}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
            >
              <option value="">Select Staff</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {errors.staff_id && <p className="text-xs text-red-500">{errors.staff_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Scheduled Date & Time</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="datetime-local"
                {...register('scheduled_at')}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
              />
            </div>
            {errors.scheduled_at && <p className="text-xs text-red-500">{errors.scheduled_at.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                {...register('location')}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
                placeholder="Patient's Home"
              />
            </div>
            {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
              placeholder="Any special instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
