import React, { useEffect, useState } from 'react';
import { fetchMembers } from '../../services/member.service';
import { fetchCampaigns } from '../../services/donation.service';
import useAuthStore from '../../store/useAuthStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const BloodReliefDirectoryPage = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');
  const [search, setSearch] = useState('');

  // Personal blood donation state - clean real user tracking without demo defaults
  const [hasDonated, setHasDonated] = useState(() => localStorage.getItem(`blood_donated_${user?._id}`) === 'true');
  const [lastDonationDate, setLastDonationDate] = useState(() => localStorage.getItem(`blood_date_${user?._id}`) || '');
  const [isAvailableDonor, setIsAvailableDonor] = useState(() => localStorage.getItem(`blood_avail_${user?._id}`) !== 'false');
  const [donationCount, setDonationCount] = useState(() => parseInt(localStorage.getItem(`blood_count_${user?._id}`) || '0', 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputDate, setInputDate] = useState('');
  const [donationPlace, setDonationPlace] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [memRes, campRes] = await Promise.allSettled([
          fetchMembers({ search }),
          fetchCampaigns()
        ]);
        if (memRes.status === 'fulfilled') {
          setMembers(memRes.value.data?.docs || memRes.value.data || []);
        }
        if (campRes.status === 'fulfilled') {
          setCampaigns(campRes.value.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  const handleSaveDonation = (e) => {
    e.preventDefault();
    if (!inputDate) return;
    setHasDonated(true);
    setLastDonationDate(inputDate);
    const newCount = donationCount + 1;
    setDonationCount(newCount);
    localStorage.setItem(`blood_donated_${user?._id}`, 'true');
    localStorage.setItem(`blood_date_${user?._id}`, inputDate);
    localStorage.setItem(`blood_count_${user?._id}`, newCount.toString());
    setIsModalOpen(false);
    alert('🎉 ধন্যবাদ! আপনার রক্তদানের তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
  };

  const toggleAvailability = () => {
    const next = !isAvailableDonor;
    setIsAvailableDonor(next);
    localStorage.setItem(`blood_avail_${user?._id}`, next.toString());
  };

  // Calculate eligibility (90 days interval)
  const lastDateObj = lastDonationDate ? new Date(lastDonationDate) : null;
  const daysSinceLast = lastDateObj ? Math.floor((new Date() - lastDateObj) / (1000 * 60 * 60 * 24)) : 100;
  const isEligible = daysSinceLast >= 90;
  const daysRemaining = Math.max(0, 90 - daysSinceLast);

  const filteredMembers = members.filter(m => {
    if (!bloodGroup) return true;
    return (m.blood_group || 'O+').toUpperCase() === bloodGroup.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              🩸 Life Saving Humanitarian Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">🩸 ব্লাড ক্যাম্পেইন & ইমার্জেন্সি রক্তদাতা ডিরেক্টরি</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            জরুরি রক্তের প্রয়োজনে রক্তের গ্রুপ অনুযায়ী সন্ধান, ব্লাড ক্যাম্পেইন ও আপনার রক্তদানের তথ্য ও স্ট্যাটাস
          </p>
        </div>

        {/* PERSONAL BLOOD DONATION STATUS CARD */}
        <Card className="!p-6 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-rose-500/30 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 border-2 border-rose-400 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-rose-900/50">
                O+
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  আমার রক্তদান প্রোফাইল & স্ট্যাটাস
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    isEligible ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {isEligible ? '✅ রক্তদানের জন্য প্রস্তুত (Eligible)' : `⏳ আর ${daysRemaining} দিন পর প্রস্তুত`}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  সদস্য: <strong>{user?.first_name} {user?.last_name}</strong> • রক্তদাতা হিসেবে তালিকাভুক্ত
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                + আমি রক্ত দিয়েছি (Log Donation)
              </Button>
              <button
                onClick={toggleAvailability}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  isAvailableDonor
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isAvailableDonor ? '🟢 রক্তদানে প্রস্তুত (Active Donor)' : '⚪ বর্তমানে বিরত (Inactive)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">রক্ত দিয়েছেন কিনা?</span>
              <strong className="text-base text-rose-400 font-bold">
                {hasDonated ? '✅ হ্যাঁ, রক্তদান করেছেন' : '⚪ এখনো দেননি'}
              </strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">সর্বশেষ রক্তদানের তারিখ</span>
              <strong className="text-base text-slate-200 font-mono">
                {lastDonationDate ? new Date(lastDonationDate).toLocaleDateString() : 'তথ্য নেই'}
              </strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">মোট রক্তদানের সংখ্যা</span>
              <strong className="text-base text-emerald-400 font-mono">
                {donationCount} বার রক্তদান
              </strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">পরবর্তী রক্তদানের যোগ্যতা</span>
              <strong className={`text-base font-bold font-mono ${isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isEligible ? 'এখনই দান করতে পারবেন' : `${daysRemaining} দিন পর`}
              </strong>
            </div>
          </div>
        </Card>

        {/* ACTIVE BLOOD CAMPAIGNS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>🚩</span> চলমান ব্লাড ক্যাম্পেইন & স্বাস্থ্য ড্রাইভ
            </h2>
            <span className="text-xs font-mono text-rose-400">{campaigns.length} টি ক্যাম্পেইন</span>
          </div>

          {campaigns.length === 0 ? (
            <Card className="!p-6 text-center text-slate-500 text-sm">
              বর্তমানে কোনো বিশেষ রক্তদান বা স্বাস্থ্য ক্যাম্পেইন পরিচালিত হচ্ছে না।
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((c) => {
                const target = c.target_amount || 100;
                const raised = c.raised_amount || 0;
                const pct = Math.min(100, Math.round((raised / target) * 100));
                return (
                  <Card key={c._id} className="!p-5 space-y-3 hover:border-rose-500/50 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                        {c.status}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {pct}% সম্পন্ন
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="h-full bg-rose-500 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* EMERGENCY DONOR DIRECTORY SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>👥</span> জরুরি রক্তদাতা ডিরেক্টরি
            </h2>
          </div>

          {/* Blood Group Filter Bar */}
          <Card className="!p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setBloodGroup(bg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border flex-shrink-0 ${
                      bloodGroup === bg
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {bg === '' ? 'ALL GROUPS' : `🩸 ${bg}`}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <Input placeholder="রক্তদাতা বা এলাকা খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Donors Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">নির্বাচিত গ্রুপে কোনো রক্তদাতা পাওয়া যায়নি।</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((m) => {
                const phone = m.phone || m.user_id?.phone;
                return (
                  <Card key={m._id} className="!p-5 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-rose-400 font-mono px-3 py-1 bg-rose-950/60 border border-rose-800 rounded-xl">
                        🩸 {m.blood_group || 'O+'}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                        AVAILABLE DONOR
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{m.user_id?.first_name} {m.user_id?.last_name}</h3>
                      <p className="text-xs text-slate-400">{m.position_title || 'Member'} • Code: {m.member_code || '-'}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-xs space-y-1 font-mono text-slate-300">
                      <div>📍 Location: {m.address || 'তথ্য নেই'}</div>
                      <div>📞 Phone: <strong>{phone || 'তথ্য নেই'}</strong></div>
                    </div>

                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="block w-full text-center py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
                      >
                        📞 Call Emergency Donor
                      </a>
                    ) : (
                      <button
                        disabled
                        className="block w-full text-center py-2 bg-slate-800 text-slate-500 font-bold text-xs rounded-lg cursor-not-allowed"
                      >
                        📞 ফোন নম্বর দেওয়া নেই
                      </button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal for Logging Blood Donation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-100">🩸 রক্তদানের তথ্য সংরক্ষণ করুন</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">রক্তদানের তারিখ *</label>
                  <Input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">হাসপাতাল বা ক্যাম্পেইনের নাম</label>
                  <Input
                    type="text"
                    placeholder="e.g. ঢাকা মেডিকেল কলেজ ব্লাড ব্যাংক"
                    value={donationPlace}
                    onChange={(e) => setDonationPlace(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
                  💡 আপনার এক ব্যাগ রক্ত একটি অমূল্য জীবন বাঁচাতে পারে। তথ্য সংরক্ষণের জন্য ধন্যবাদ!
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                    বাতিল
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-500">
                    তথ্য সংরক্ষণ করুন
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

