import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { fetchAIFinancialInsights, generateAINotice } from '../services/ai.service';

export const AIAssistantModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('finance'); // 'finance', 'notice'
  const [loading, setLoading] = useState(false);
  const [financeInsights, setFinanceInsights] = useState(null);

  const [topicInput, setTopicInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [noticeResult, setNoticeResult] = useState(null);

  const handleFetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetchAIFinancialInsights();
      setFinanceInsights(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateAINotice(topicInput, audienceInput);
      setNoticeResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl">
        <Card className="border-indigo-500/50 shadow-2xl relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                ✨
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">AI ERP Copilot Assistant</h2>
                <p className="text-xs text-indigo-400 font-mono">Gemini AI Synthesis Engine</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-slate-800 pb-3 mb-4">
            <button
              className={`text-xs font-bold ${activeTab === 'finance' ? 'text-indigo-400 border-b-2 border-indigo-500 pb-1' : 'text-slate-400'}`}
              onClick={() => setActiveTab('finance')}
            >
              📊 Financial Insights
            </button>
            <button
              className={`text-xs font-bold ${activeTab === 'notice' ? 'text-indigo-400 border-b-2 border-indigo-500 pb-1' : 'text-slate-400'}`}
              onClick={() => setActiveTab('notice')}
            >
              📢 Notice Drafter
            </button>
          </div>

          {/* Financial Insights Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Analyzes live income, expenses, cashbook balance, and budget allocations to synthesize executive financial advice.
              </p>

              <Button onClick={handleFetchInsights} isLoading={loading} className="w-full">
                Generate Live Financial Analysis
              </Button>

              {financeInsights && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-400">Financial Health Score:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{financeInsights.health_score}/100</span>
                  </div>
                  <div className="space-y-2">
                    {financeInsights.insights?.map((text, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-200">
                        <span className="text-indigo-400">💡</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notice Drafter Tab */}
          {activeTab === 'notice' && (
            <form onSubmit={handleDraftNotice} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Topic (e.g. Annual General Board Assembly 2026)"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Target Audience (e.g. Executive Board Members)"
                  value={audienceInput}
                  onChange={(e) => setAudienceInput(e.target.value)}
                />
              </div>

              <Button type="submit" isLoading={loading} className="w-full">
                Draft Official Notice
              </Button>

              {noticeResult && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-indigo-400 text-sm">{noticeResult.title}</h4>
                  <p className="whitespace-pre-wrap text-slate-300 font-mono text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {noticeResult.content}
                  </p>
                </div>
              )}
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
