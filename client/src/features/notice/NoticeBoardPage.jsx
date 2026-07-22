import React, { useEffect, useState } from 'react';
import { fetchNotices, createNotice, deleteNotice } from '../../services/notice.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    attachment_url: ''
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await fetchNotices({ search, category });
      setNotices(res.data.docs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [search, category]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createNotice(formData);
      setIsModalOpen(false);
      setFormData({ title: '', content: '', category: 'GENERAL', priority: 'MEDIUM', attachment_url: '' });
      loadNotices();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to publish notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      loadNotices();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete');
    }
  };

  const priorityColor = (p) => {
    if (p === 'URGENT') return 'bg-rose-950 text-rose-300 border-rose-800';
    if (p === 'HIGH') return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-slate-900 text-slate-300 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">📢 Digital Notice Board & Broadcast Engine</h1>
            <p className="text-slate-400 mt-1">Publish emergency announcements, general notices, election notices & multi-channel broadcasts</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Publish New Notice
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1 max-w-md">
              <Input
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="GENERAL">General Notice</option>
                <option value="EMERGENCY">Emergency Alert</option>
                <option value="FINANCIAL">Financial Notice</option>
                <option value="EVENT">Event Announcement</option>
                <option value="ELECTION">Election Notice</option>
              </select>
            </div>
            <span className="text-xs font-mono text-slate-400">{notices.length} Notice(s) Found</span>
          </div>
        </Card>

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No notices published yet. Click "+ Publish New Notice".</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((n) => (
              <Card key={n._id} className="!p-6 space-y-4 relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${priorityColor(n.priority)}`}>
                      {n.priority} • {n.category}
                    </span>
                    <button onClick={() => handleDelete(n._id)} className="text-xs text-rose-400 hover:text-rose-300 font-bold">✕</button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{n.title}</h3>
                  <p className="text-xs text-slate-300 whitespace-pre-line mt-2 leading-relaxed">{n.content}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-mono">
                  <span>📅 {new Date(n.published_at).toLocaleDateString()}</span>
                  <span>✍️ {n.created_by?.first_name || 'Admin'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Publish Notice</h2>
                  <button onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label>Notice Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg p-2.5"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="GENERAL">General Notice</option>
                        <option value="EMERGENCY">Emergency Alert</option>
                        <option value="FINANCIAL">Financial Notice</option>
                        <option value="EVENT">Event Announcement</option>
                        <option value="ELECTION">Election Notice</option>
                      </select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg p-2.5"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Notice Body / Content</Label>
                    <textarea
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Publish</Button>
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
