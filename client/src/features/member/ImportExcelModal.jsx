import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { importMembersExcel } from '../../services/member.service';

export const ImportExcelModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel (.xlsx / .csv) file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importMembersExcel(file);
      setResult(res.data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-100">Import Members from Excel</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <p className="text-xs text-slate-400 mb-4">
            Upload an Excel sheet (`.xlsx`) with columns in order: <br />
            <span className="font-mono text-indigo-400">1: First Name | 2: Last Name | 3: Email | 4: Phone | 5: Blood Group</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50">
              <input
                type="file"
                accept=".xlsx, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excelInput"
              />
              <label htmlFor="excelInput" className="cursor-pointer block">
                <div className="text-3xl mb-2">📊</div>
                <span className="text-sm font-medium text-slate-200">
                  {file ? file.name : 'Click to browse Excel file'}
                </span>
              </label>
            </div>

            {result && (
              <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-1 font-mono">
                <p className="text-emerald-400 font-bold">{result.message}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="text-rose-400 max-h-24 overflow-y-auto mt-2">
                    {result.errors.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" isLoading={loading} disabled={!file}>
                Upload & Import
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
