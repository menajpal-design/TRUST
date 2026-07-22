import React, { useEffect, useState } from 'react';
import { fetchEvents, createEvent, rsvpEvent, verifyTicketToken } from '../../services/event.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { formatCurrency } from '../../utils/formatCurrency';

export const EventDashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  const [ticketToken, setTicketToken] = useState('');
  const [ticketResult, setTicketResult] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: 100,
    ticket_price: 0
  });

  const loadEvents = async () => {
    try {
      const res = await fetchEvents();
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent({
        ...eventData,
        capacity: parseInt(eventData.capacity, 10),
        ticket_price: parseFloat(eventData.ticket_price)
      });
      setIsCreateModalOpen(false);
      loadEvents();
    } catch (e) {
      alert(e.response?.data?.message || 'Error creating event');
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      const res = await rsvpEvent(eventId);
      setSelectedTicket(res.data.ticket);
      alert('RSVP Confirmed! Your QR Ticket has been generated.');
    } catch (e) {
      alert(e.response?.data?.message || 'RSVP failed');
    }
  };

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyTicketToken(ticketToken);
      setTicketResult({ success: true, message: `Check-in Verified for ${res.data.user_id?.first_name} ${res.data.user_id?.last_name}` });
    } catch (e) {
      setTicketResult({ success: false, message: e.response?.data?.message || 'Invalid QR Ticket Token' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Events & Digital QR Tickets</h1>
            <p className="text-slate-400 mt-1">Schedule meetings, RSVP, generate digital QR tickets & scan check-ins</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsCheckinModalOpen(true)}>
              🔍 Ticket Check-in Scan
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Schedule Event
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No scheduled events. Click "+ Schedule Event" to create one.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((evt) => (
              <Card key={evt._id} className="!p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                    {evt.status}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {evt.ticket_price > 0 ? formatCurrency(evt.ticket_price) : 'FREE'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100">{evt.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <div>📍 {evt.location}</div>
                  <div>📅 {new Date(evt.start_time).toLocaleString()}</div>
                </div>

                <Button className="w-full text-xs font-bold" onClick={() => handleRSVP(evt._id)}>
                  🎟️ Get Digital QR Ticket
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Selected QR Ticket Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm">
              <Card className="text-center space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-100">Verified QR Event Ticket</h3>
                  <button onClick={() => setSelectedTicket(null)}>✕</button>
                </div>
                {selectedTicket.qr_code_url && (
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl">
                    <img src={selectedTicket.qr_code_url} alt="QR Ticket" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="text-xs font-mono text-indigo-400 font-bold">{selectedTicket.ticket_code}</div>
              </Card>
            </div>
          </div>
        )}

        {/* Schedule Event Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Schedule Event</h2>
                  <button onClick={() => setIsCreateModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label>Event Title</Label>
                    <Input type="text" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Location / Venue</Label>
                    <Input type="text" value={eventData.location} onChange={(e) => setEventData({ ...eventData, location: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input type="datetime-local" value={eventData.start_time} onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })} required />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="datetime-local" value={eventData.end_time} onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Capacity</Label>
                      <Input type="number" value={eventData.capacity} onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })} />
                    </div>
                    <div>
                      <Label>Ticket Price</Label>
                      <Input type="number" value={eventData.ticket_price} onChange={(e) => setEventData({ ...eventData, ticket_price: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input type="text" value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Schedule</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* Ticket Checkin Modal */}
        {isCheckinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">QR Ticket Check-in Scan</h2>
                  <button onClick={() => setIsCheckinModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleVerifyTicket} className="space-y-4">
                  <div>
                    <Label>Ticket Code / Token String</Label>
                    <Input type="text" placeholder="Paste or scan QR token" value={ticketToken} onChange={(e) => setTicketToken(e.target.value)} required />
                  </div>
                  {ticketResult && (
                    <div className={`p-3 rounded-lg text-xs font-bold ${ticketResult.success ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {ticketResult.message}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsCheckinModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Verify Check-in</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
