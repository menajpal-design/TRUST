import React, { useEffect, useState } from 'react';
import { fetchMeetings, createMeeting, addMeetingResolution, fetchVotes, createVote, castVote } from '../../services/meeting.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export const MeetingVotingPage = () => {
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetings, setMeetings] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const [meetingForm, setMeetingForm] = useState({ title: '', meeting_type: 'GENERAL', agenda: '', location: '', scheduled_at: '' });
  const [voteForm, setVoteForm] = useState({ title: '', description: '', category: 'COMMITTEE_ELECTION', opt1: '', opt2: '', opt3: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([fetchMeetings(), fetchVotes()]);
      setMeetings(mRes.data || []);
      setVotes(vRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await createMeeting(meetingForm);
      setIsMeetingModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error scheduling meeting');
    }
  };

  const handleCreateVote = async (e) => {
    e.preventDefault();
    const options = [voteForm.opt1, voteForm.opt2, voteForm.opt3].filter(Boolean);
    try {
      await createVote({ title: voteForm.title, description: voteForm.description, category: voteForm.category, options });
      setIsVoteModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error creating vote');
    }
  };

  const handleCastVote = async (voteId, optionId) => {
    try {
      await castVote(voteId, optionId);
      alert('Secret Vote cast successfully!');
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cast vote');
    }
  };

  const handleAddResolution = async (meetingId) => {
    if (!resolutionText) return;
    try {
      await addMeetingResolution(meetingId, { title: 'Executive Approval', description: resolutionText });
      setResolutionText('');
      setSelectedMeetingId(null);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save resolution');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">📋 Meeting Resolutions & E-Voting Polls</h1>
            <p className="text-slate-400 mt-1">Schedule executive meetings, record Minutes of Meeting (MoM) & run secret digital election votes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsVoteModalOpen(true)}>
              🗳️ Create E-Vote Poll
            </Button>
            <Button onClick={() => setIsMeetingModalOpen(true)}>
              + Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="!p-4">
          <div className="flex border-b border-slate-800 space-x-6">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'meetings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📅 Scheduled Meetings & MoM ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab('voting')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'voting' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🗳️ Secret E-Voting Elections ({votes.length})
            </button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : activeTab === 'meetings' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meetings.map((m) => (
              <Card key={m._id} className="!p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {m.meeting_type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">📍 {m.location}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">{m.title}</h3>
                <p className="text-xs text-slate-300"><strong>Agenda:</strong> {m.agenda}</p>

                {/* Resolutions */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Meeting Resolutions (MoM):</span>
                  {m.resolutions?.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No formal resolutions recorded yet.</div>
                  ) : (
                    m.resolutions?.map((r, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded-lg text-xs border border-slate-800">
                        <strong className="text-emerald-400 block">{r.title}</strong>
                        <p className="text-slate-300 mt-0.5">{r.description}</p>
                      </div>
                    ))
                  )}

                  {selectedMeetingId === m._id ? (
                    <div className="space-y-2 pt-2">
                      <Input placeholder="Enter resolution description..." value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedMeetingId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleAddResolution(m._id)}>Save Resolution</Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setSelectedMeetingId(m._id)} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold block pt-1">
                      + Add Resolution
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {votes.map((v) => (
              <Card key={v._id} className="!p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {v.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Total Votes: {v.voters?.length || 0}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">{v.title}</h3>
                <p className="text-xs text-slate-300">{v.description}</p>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cast Secret Ballot:</span>
                  {v.options?.map((opt) => (
                    <div key={opt.option_id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-sm font-semibold text-slate-200">{opt.option_text}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400 font-bold">{opt.votes_count} votes</span>
                        <Button size="sm" onClick={() => handleCastVote(v._id, opt.option_id)}>Vote</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Schedule Meeting</h2>
                  <button onClick={() => setIsMeetingModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div>
                    <Label>Meeting Title</Label>
                    <Input value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Meeting Type</Label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg p-2.5"
                      value={meetingForm.meeting_type}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
                    >
                      <option value="GENERAL">General Meeting</option>
                      <option value="EXECUTIVE">Executive Committee</option>
                      <option value="COMMITTEE">Sub-Committee</option>
                      <option value="EMERGENCY">Emergency Meeting</option>
                    </select>
                  </div>
                  <div>
                    <Label>Scheduled Date & Time</Label>
                    <Input type="datetime-local" value={meetingForm.scheduled_at} onChange={(e) => setMeetingForm({ ...meetingForm, scheduled_at: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Agenda & Key Discussion Topics</Label>
                    <Input value={meetingForm.agenda} onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsMeetingModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Schedule</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* E-Vote Poll Modal */}
        {isVoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create E-Vote Poll</h2>
                  <button onClick={() => setIsVoteModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateVote} className="space-y-4">
                  <div>
                    <Label>Poll Title / Candidate Name</Label>
                    <Input value={voteForm.title} onChange={(e) => setVoteForm({ ...voteForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Option 1</Label>
                    <Input value={voteForm.opt1} onChange={(e) => setVoteForm({ ...voteForm, opt1: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Option 2</Label>
                    <Input value={voteForm.opt2} onChange={(e) => setVoteForm({ ...voteForm, opt2: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Option 3 (Optional)</Label>
                    <Input value={voteForm.opt3} onChange={(e) => setVoteForm({ ...voteForm, opt3: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsVoteModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Publish Election Poll</Button>
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
