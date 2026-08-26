import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { fetchMembers } from '../../services/member.service';
import { fetchMemberFeeProfile, fetchDues } from '../../services/fee.service';
import { fetchReceipts } from '../../services/receipt.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

export const MemberProfilePage = () => {
  const { user: currentUser, activeOrganization } = useAuthStore();
  const [memberRecord, setMemberRecord] = useState(null);
  const [feeProfile, setFeeProfile] = useState(null);
  const [dues, setDues] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const memRes = await fetchMembers({ limit: 50 });
        const docs = memRes.data?.docs || memRes.data || [];
        const myMem = docs.find(m => {
          const u = m.user_id;
          return u && (u._id === currentUser?._id || u === currentUser?._id || u.email === currentUser?.email);
        }) || (docs.length > 0 ? docs[0] : null);

        if (isMounted && myMem) {
          setMemberRecord(myMem);
          const [fpRes, duesRes, recRes] = await Promise.allSettled([
            fetchMemberFeeProfile(myMem._id),
            fetchDues(),
            fetchReceipts()
          ]);

          if (fpRes.status === 'fulfilled') setFeeProfile(fpRes.value.data);
          if (duesRes.status === 'fulfilled') {
            const allDues = duesRes.value.data || [];
            const myDues = allDues.filter(d => {
              const uId = d.member_id?.user_id?._id || d.member_id?.user_id || d.member_id?._id || d.member_id;
              return String(uId) === String(currentUser?._id) || String(d.member_id?._id) === String(myMem._id);
            });
            setDues(myDues);
          }
          if (recRes.status === 'fulfilled') {
            const allRecs = recRes.value.data || [];
            const myRecs = allRecs.filter(r => 
              (r.payer_name && r.payer_name.toLowerCase().includes(currentUser?.first_name?.toLowerCase() || '')) ||
              (myMem.member_code && r.description && r.description.includes(myMem.member_code))
            );
            setReceipts(myRecs.length > 0 ? myRecs : allRecs);
          }
        }
      } catch (err) {
        console.error('Error loading member profile', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, [currentUser?._id]);

  const totalPaid = dues.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0);
  const totalDue = dues.reduce((acc, curr) => acc + Math.max(0, (curr.due_amount || 0) + (curr.late_fee || 0) - (curr.paid_amount || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                👤 Member Account Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">আমার প্রোফাইল & ডিজিটাল মেম্বার পোর্টাল</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              আপনার সদস্যপদ, স্মার্ট পিভিসি কার্ড, পরিশোধিত ফি ও রসিদ হিসাব
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/idcard">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                🆔 স্মার্ট PVC কার্ড
              </Button>
            </Link>
            <Link to="/fees">
              <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-400 font-bold">
                💳 ফি জমা দিন (Pay Due)
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Card Header */}
        <Card className="!p-6 sm:!p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-400 flex items-center justify-center font-bold text-3xl sm:text-4xl text-white shadow-2xl">
                {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : 'M'}
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full border border-emerald-400 shadow">
                VERIFIED
              </span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-bold font-mono">
                  {memberRecord?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-300 font-mono">
                মেম্বার আইডি কোড: <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{memberRecord?.member_code || 'MEM-2026-0001'}</strong>
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs">
                <span className="bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
                  🏛️ সংস্থা: <strong className="text-emerald-400">{activeOrganization?.name || 'UnionDesk BD'}</strong>
                </span>
                <span className="bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
                  👥 পদবি: <strong className="text-purple-300">{memberRecord?.position_title || 'General Member'}</strong>
                </span>
                <span className="bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
                  🩸 রক্তের গ্রুপ: <strong className="text-rose-400">{memberRecord?.blood_group || 'O+'}</strong>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-5 bg-emerald-950/30 border-emerald-500/40">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">মোট পরিশোধিত ফি (Total Paid)</span>
            <p className="text-3xl font-bold text-emerald-400 font-mono mt-2">{formatCurrency(totalPaid)}</p>
            <p className="text-[11px] text-slate-400 mt-1">যাচাইকৃত সকল প্রাপ্তি রসিদ</p>
          </Card>
          <Card className="!p-5 bg-rose-950/30 border-rose-500/40">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">বর্তমান বকেয়া ফি (Due Outstanding)</span>
            <p className="text-3xl font-bold text-rose-400 font-mono mt-2">{formatCurrency(totalDue)}</p>
            <p className="text-[11px] text-slate-400 mt-1">পরিশোধের অপেক্ষায়</p>
          </Card>
          <Card className="!p-5 bg-indigo-950/30 border-indigo-500/40">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">ফি স্ট্যাটাস ও ফ্রিকোয়েন্সি</span>
            <p className="text-xl font-bold text-indigo-300 font-mono mt-2">
              {memberRecord?.fee_profile?.fee_frequency || 'MONTHLY'} • {memberRecord?.fee_profile?.fee_status || 'ACTIVE'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              মাসিক ফি রেট: {formatCurrency(memberRecord?.fee_profile?.custom_fee_amount || 200)}
            </p>
          </Card>
        </div>

        {/* Quick Portal Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/fees" className="block group">
            <Card className="h-full !p-5 hover:border-emerald-500/60 transition-all">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                ফি জমা দিন ও হিসাব দেখুন
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                বকেয়া ফি পরিশোধ করুন (bKash/Nagad/Bank) এবং পূর্বের সকল মাসিক হিসাব দেখুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-emerald-400">টাকা জমা দিন →</span>
            </Card>
          </Link>

          <Link to="/receipts" className="block group">
            <Card className="h-full !p-5 hover:border-indigo-500/60 transition-all">
              <div className="text-3xl mb-2">🧾</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition-colors">
                আমার পেমেন্ট রসিদ সমূহ
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনার প্রদত্ত টাকার ডিজিটাল কিউআর কোডসহ রসিদ ডাউনলোড ও প্রিন্ট করুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-indigo-400">রসিদ তালিকা →</span>
            </Card>
          </Link>

          <Link to="/idcard" className="block group">
            <Card className="h-full !p-5 hover:border-purple-500/60 transition-all">
              <div className="text-3xl mb-2">🆔</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-purple-400 transition-colors">
                স্মার্ট পিভিসি আইডি কার্ড
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                অফিসিয়াল স্মার্ট আইডি কার্ড জেনারেট ও সরাসরি প্রিন্ট করুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-purple-400">আইডি কার্ড স্টুডিও →</span>
            </Card>
          </Link>

          <Link to="/blood-relief" className="block group">
            <Card className="h-full !p-5 hover:border-rose-500/60 transition-all">
              <div className="text-3xl mb-2">🩸</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-rose-400 transition-colors">
                রক্তদান স্ট্যাটাস ও ক্যাম্পেইন
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনি রক্ত দিয়েছেন কিনা স্ট্যাটাস আপডেট করুন ও জরুরি রক্তদাতা ডিরেক্টরি দেখুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-rose-400">ব্লাড পোর্টাল →</span>
            </Card>
          </Link>

          <Link to="/donations" className="block group">
            <Card className="h-full !p-5 hover:border-amber-500/60 transition-all">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors">
                পাবলিক ক্যাম্পেইন ও অনুদান
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                সংস্থার চলমান উন্নয়নমূলক ও ত্রাণ ক্যাম্পেইনে সরাসরি অনুদান প্রদান করুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-amber-400">ক্যাম্পেইন সমূহ →</span>
            </Card>
          </Link>

          <Link to="/meetings" className="block group">
            <Card className="h-full !p-5 hover:border-teal-500/60 transition-all">
              <div className="text-3xl mb-2">🗳️</div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-teal-400 transition-colors">
                অনলাইন ভোটিং ও সভা
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                সংস্থার নীতি নির্ধারণী অনলাইন পোলে ভোট দিন এবং সভার কার্যবিবরণী দেখুন।
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-teal-400">ভোট ও মিটিং →</span>
            </Card>
          </Link>
        </div>

        {/* Detailed Personal Details */}
        <Card className="!p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
            📋 ব্যক্তিগত যোগাযোগের তথ্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">ইমেইল ঠিকানা</span>
              <strong className="text-slate-200 font-mono break-all">{currentUser?.email}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">মোবাইল ফোন নম্বর</span>
              <strong className="text-emerald-400 font-mono">{memberRecord?.phone || currentUser?.phone || '+880 1700-000000'}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">সদস্যপদের ধরন (Tier)</span>
              <strong className="text-indigo-400">{memberRecord?.membership_type || 'GENERAL MEMBER'}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">যোগদানের তারিখ</span>
              <strong className="text-slate-300 font-mono">
                {memberRecord?.joining_date ? new Date(memberRecord.joining_date).toLocaleDateString() : '01/01/2026'}
              </strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">বর্তমান ঠিকানা</span>
              <strong className="text-slate-300">{memberRecord?.address || 'Dhaka, Bangladesh'}</strong>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">জরুরি যোগাযোগ</span>
              <strong className="text-rose-300 font-mono">{memberRecord?.emergency_contact || '+880 1800-000000'}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
