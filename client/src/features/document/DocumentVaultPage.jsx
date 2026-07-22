import React, { useEffect, useState } from 'react';
import { fetchDocuments, uploadDocument, deleteDocument } from '../../services/document.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export const DocumentVaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({ title: '', category: 'CONSTITUTION', file_url: '', file_type: 'PDF' });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetchDocuments({ category, search });
      setDocuments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [category, search]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await uploadDocument(formData);
      setIsModalOpen(false);
      setFormData({ title: '', category: 'CONSTITUTION', file_url: '', file_type: 'PDF' });
      loadDocuments();
    } catch (e) {
      alert(e.response?.data?.message || 'Error uploading document');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete document?')) return;
    try {
      await deleteDocument(id);
      loadDocuments();
    } catch (e) {
      alert(e.response?.data?.message || 'Error deleting document');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">📂 Central Document & Constitution Vault</h1>
            <p className="text-slate-400 mt-1">Store, manage & download constitution (গঠনতন্ত্র), audit reports & legal resolutions</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Upload Document
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 flex-1 max-w-md">
              <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select
                className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="CONSTITUTION">Constitution (গঠনতন্ত্র)</option>
                <option value="AUDIT_REPORT">Audit Report</option>
                <option value="MEETING_RESOLUTION">Meeting Resolution</option>
                <option value="OFFICE_REGISTRATION">Office Certificate</option>
              </select>
            </div>
            <span className="text-xs font-mono text-slate-400">{documents.length} Document(s) Vaulted</span>
          </div>
        </Card>

        {/* Documents Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No documents uploaded yet. Click "+ Upload Document".</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Document Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">File Specs</th>
                    <th className="px-4 py-3">Uploaded Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-100">📄 {doc.title}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{doc.file_type} • {doc.file_size}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-right space-x-3">
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">
                          📥 Download
                        </a>
                        <button onClick={() => handleDelete(doc._id)} className="text-xs text-rose-400 hover:text-rose-300 font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Upload Document</h2>
                  <button onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label>Document Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg p-2.5"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="CONSTITUTION">Constitution (গঠনতন্ত্র)</option>
                      <option value="AUDIT_REPORT">Audit Report</option>
                      <option value="MEETING_RESOLUTION">Meeting Resolution</option>
                      <option value="OFFICE_REGISTRATION">Office Certificate</option>
                    </select>
                  </div>
                  <div>
                    <Label>File URL / Cloud Link</Label>
                    <Input placeholder="https://example.com/constitution.pdf" value={formData.file_url} onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Upload Document</Button>
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
