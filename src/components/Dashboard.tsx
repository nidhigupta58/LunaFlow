import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Droplets, 
  Moon, 
  Activity, 
  Utensils, 
  Plus,
  Settings,
  LogOut,
  Heart,
  Home as HomeIcon,
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  Ruler,
  Scale,
  X,
  Check
} from 'lucide-react';
import { UserData, CalendarTokens, AIRecommendation } from '../types';
import { getHealthRecommendations, getDailyTip } from '../lib/gemini';
import { formatDate, cn } from '../lib/utils';
import { addDays, format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, subDays, differenceInYears, subMonths, addMonths } from 'date-fns';

interface DashboardProps {
  userData: UserData;
  tokens: CalendarTokens | null;
  onConnectCalendar: () => void;
  onLogout: () => void;
  onUpdateUser: (data: UserData) => void;
}

type Tab = 'home' | 'calendar' | 'insights' | 'profile';

export default function Dashboard({ userData, tokens, onConnectCalendar, onLogout, onUpdateUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null);
  const [dailyTip, setDailyTip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogPeriod, setShowLogPeriod] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [editData, setEditData] = useState<UserData>(userData);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (showSettings) {
      setEditData(userData);
    }
  }, [showSettings, userData]);

  useEffect(() => {
    async function fetchData() {
      const [rec, tip] = await Promise.all([
        getHealthRecommendations(userData),
        getDailyTip()
      ]);
      setRecommendations(rec);
      setDailyTip(tip);
      setLoading(false);
    }
    fetchData();
  }, [userData]);

  const lastPeriod = new Date(userData.lastPeriodDate);
  const cycleLength = userData.cycleLength || 28;
  const periodDuration = userData.periodDuration || 5;
  const nextPeriod = addDays(lastPeriod, cycleLength);
  const daysUntil = differenceInDays(nextPeriod, new Date());
  
  const age = userData.age;
  const dob = userData.dob ? format(new Date(userData.dob), 'MMM d, yyyy') : 'N/A';

  const handleAddToCalendar = async () => {
    if (!tokens) {
      onConnectCalendar();
      return;
    }

    const event = {
      summary: 'LunaFlow: Expected Period Start',
      description: 'Your period is predicted to start today. Take care of yourself!',
      start: {
        date: format(nextPeriod, 'yyyy-MM-dd'),
      },
      end: {
        date: format(nextPeriod, 'yyyy-MM-dd'),
      },
    };

    try {
      const res = await fetch('/api/calendar/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, event }),
      });
      if (res.ok) {
        alert('Event added to Google Calendar!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = () => {
    onUpdateUser(editData);
    setShowSettings(false);
  };

  const handleLogPeriod = () => {
    const history = userData.periodHistory || [userData.lastPeriodDate];
    // Avoid duplicate dates
    if (history.includes(logDate)) {
      setShowLogPeriod(false);
      return;
    }

    const newHistory = [...history, logDate].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestDate = newHistory[0];

    // Simple irregularity check: if the gap between the last two periods 
    // differs from cycleLength by more than 3 days
    let isRegular = userData.isRegular;
    if (newHistory.length >= 2) {
      const last = new Date(newHistory[0]);
      const prev = new Date(newHistory[1]);
      const gap = differenceInDays(last, prev);
      if (Math.abs(gap - (userData.cycleLength || 28)) > 3) {
        isRegular = false;
      } else {
        isRegular = true;
      }
    }

    onUpdateUser({
      ...userData,
      lastPeriodDate: latestDate,
      periodHistory: newHistory,
      isRegular
    });
    setShowLogPeriod(false);
  };

  const handleDOBChange = (dob: string) => {
    const age = differenceInYears(new Date(), new Date(dob)).toString();
    setEditData({ ...editData, dob, age });
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8"
    >
      {/* Cycle Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pink-gradient rounded-[40px] p-8 text-white shadow-2xl shadow-brand-pink/30 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80">Next Period In</p>
              <h3 className="text-6xl font-serif font-bold">{daysUntil > 0 ? daysUntil : 0} Days</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <CalendarIcon className="size-6" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full" 
                style={{ width: `${Math.min(100, (cycleLength - daysUntil) / cycleLength * 100)}%` }} 
              />
            </div>
            <span className="font-medium">{format(nextPeriod, 'MMM d')}</span>
          </div>

          <button 
            onClick={handleAddToCalendar}
            className="w-full py-4 bg-white text-brand-rose font-bold rounded-2xl shadow-lg hover:bg-brand-cream transition-colors flex items-center justify-center gap-2"
          >
            <CalendarIcon className="size-4" />
            {tokens ? 'Sync to Google Calendar' : 'Connect Google Calendar'}
          </button>
        </div>
        
        <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 size-40 bg-brand-deep/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
          <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Moon className="text-blue-400 size-5" />
          </div>
          <p className="text-xs font-bold opacity-40 uppercase">Sleep</p>
          <p className="font-medium text-sm line-clamp-1">{userData.sleepRoutine || '7-8 Hours'}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
          <div className="size-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Scale className="text-orange-400 size-5" />
          </div>
          <p className="text-xs font-bold opacity-40 uppercase">Weight</p>
          <p className="font-medium text-sm">{userData.weight} kg</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
          <div className="size-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Ruler className="text-green-400 size-5" />
          </div>
          <p className="text-xs font-bold opacity-40 uppercase">Height</p>
          <p className="font-medium text-sm">{userData.height} cm</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
          <div className="size-10 bg-pink-50 rounded-xl flex items-center justify-center">
            <Heart className="text-pink-400 size-5" />
          </div>
          <p className="text-xs font-bold opacity-40 uppercase">Age</p>
          <p className="font-medium text-sm">{age} years</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
          <div className="size-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Activity className="text-purple-400 size-5" />
          </div>
          <p className="text-xs font-bold opacity-40 uppercase">DOB</p>
          <p className="font-medium text-sm">{dob}</p>
        </div>
      </div>

      {/* Daily Tip */}
      <div className="bg-brand-rose/10 border border-brand-rose/20 p-6 rounded-3xl flex gap-4 items-start">
        <div className="size-10 bg-brand-rose rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="text-white size-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-brand-rose tracking-widest mb-1">Daily Wellness Tip</p>
          <p className="text-sm font-medium italic text-gray-700">"{dailyTip}"</p>
        </div>
      </div>
    </motion.div>
  );

  const renderInsights = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-3xl font-bold">AI Recommendations</h4>
        <Sparkles className="text-brand-rose size-6 animate-pulse" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-8 rounded-[32px] h-48 animate-pulse" />
          ))}
        </div>
      ) : recommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Diet Card */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-cream hover:border-brand-pink/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Utensils className="text-orange-400 size-5" />
              </div>
              <h5 className="font-bold text-lg">{recommendations.diet.title}</h5>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{recommendations.diet.content}</p>
          </div>

          {/* Exercise Card */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-cream hover:border-brand-pink/30 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="text-blue-400 size-5" />
              </div>
              <h5 className="font-bold text-lg">{recommendations.exercise.title}</h5>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{recommendations.exercise.content}</p>
          </div>

          {/* Wellness Card */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-cream hover:border-brand-pink/30 transition-colors group md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="text-pink-400 size-5" />
              </div>
              <h5 className="font-bold text-lg">{recommendations.wellness.title}</h5>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{recommendations.wellness.content}</p>
          </div>

          {/* Message Card */}
          <div className="pink-gradient p-8 rounded-[32px] text-white md:col-span-2 text-center">
            <p className="font-serif text-xl italic opacity-90">"{recommendations.message}"</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[32px] text-center text-gray-400">
          Unable to load recommendations.
        </div>
      )}
    </motion.div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const start = startOfMonth(currentCalendarMonth);
    const end = endOfMonth(currentCalendarMonth);
    const days = eachDayOfInterval({ start, end });

    // Helper to find if a day is in any cycle (past or future)
    const getDayStatus = (day: Date) => {
      const history = userData.periodHistory || [userData.lastPeriodDate];
      const cycleLen = userData.cycleLength || 28;
      const periodLen = userData.periodDuration || 5;

      // Check historical and predicted cycles for each entry in history
      // We only need to check a few cycles around each historical point
      for (const pDate of history) {
        const lastPeriodDate = new Date(pDate);
        
        for (let i = -1; i <= 1; i++) {
          const cycleStart = addDays(lastPeriodDate, i * cycleLen);
          const cycleEnd = addDays(cycleStart, periodLen - 1);
          
          // Period check
          if (isWithinInterval(day, { start: cycleStart, end: cycleEnd })) {
            const dayOfPeriod = differenceInDays(day, cycleStart);
            let droplets = 0;
            if (dayOfPeriod === 0) droplets = 3;
            else if (dayOfPeriod === 1) droplets = 2;
            else droplets = 1;
            return { type: 'period', droplets, intensity: 1 };
          }

          // Ovulation check
          const nextCycleStart = addDays(cycleStart, cycleLen);
          const ovulationDay = subDays(nextCycleStart, 14);
          const ovulationWindow = {
            start: subDays(ovulationDay, 2),
            end: addDays(ovulationDay, 2)
          };
          
          if (isWithinInterval(day, ovulationWindow)) {
            const dist = Math.abs(differenceInDays(day, ovulationDay));
            const intensity = dist === 0 ? 1 : dist === 1 ? 0.7 : 0.4;
            return { type: 'ovulation', intensity };
          }

          // Safe days check
          const dayInCycle = differenceInDays(day, cycleStart) % cycleLen;
          if (dayInCycle >= 19 || (dayInCycle >= periodLen && dayInCycle <= 9)) {
             let intensity = 0.3;
             if (dayInCycle >= 25) intensity = 1;
             else if (dayInCycle >= 21) intensity = 0.7;
             else if (dayInCycle >= 19) intensity = 0.5;
             
             return { type: 'safe', intensity };
          }
        }
      }
      return { type: 'none', intensity: 0 };
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-3xl font-bold">Cycle Calendar</h4>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-brand-pink/10 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button 
              onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-brand-pink/10 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h5 className="text-xl font-bold">{format(currentCalendarMonth, 'MMMM yyyy')}</h5>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                <div className="size-2 bg-brand-rose rounded-full" /> Period
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                <div className="size-2 bg-blue-400 rounded-full" /> Ovulation
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                <div className="size-2 bg-green-400 rounded-full" /> Safe Days
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-xs font-bold opacity-30">{d}</div>
            ))}
            {Array.from({ length: start.getDay() }).map((_, i) => <div key={i} />)}
            {days.map(day => {
              const status = getDayStatus(day);
              const isToday = isSameDay(day, today);

              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                    status.type === 'period' ? "bg-brand-rose text-white shadow-lg shadow-brand-rose/20" : "hover:bg-gray-50",
                    isToday && status.type !== 'period' && "border-2 border-brand-rose text-brand-rose"
                  )}
                  style={{
                    backgroundColor: status.type === 'ovulation' 
                      ? `rgba(96, 165, 250, ${status.intensity})` // blue-400 with intensity
                      : status.type === 'safe'
                      ? `rgba(74, 222, 128, ${status.intensity})` // green-400 with intensity
                      : undefined,
                    color: (status.type === 'ovulation' || status.type === 'safe') && status.intensity > 0.6 ? 'white' : undefined
                  }}
                >
                  <span>{format(day, 'd')}</span>
                  {status.type === 'period' && status.droplets && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: status.droplets }).map((_, i) => (
                        <Droplets key={i} className="size-2 fill-current" />
                      ))}
                    </div>
                  )}
                  {status.type === 'ovulation' && status.intensity === 1 && (
                    <div className="absolute top-1 right-1 size-1 bg-white rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <h4 className="font-serif text-3xl font-bold">Profile</h4>
      <div className="bg-white rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 pink-gradient text-white flex items-center gap-6">
          <div className="size-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <UserIcon className="size-10" />
          </div>
          <div>
            <h5 className="text-2xl font-bold">{userData.name}</h5>
            <p className="opacity-80">{userData.email}</p>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="size-5 opacity-40" />
              <span className="font-medium">Account Settings</span>
            </div>
            <ChevronRight className="size-5 opacity-20" />
          </button>
          <button onClick={onConnectCalendar} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <CalendarIcon className="size-5 opacity-40" />
              <span className="font-medium">Google Calendar</span>
            </div>
            <span className={cn("text-xs font-bold px-2 py-1 rounded-full", tokens ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")}>
              {tokens ? 'Connected' : 'Disconnected'}
            </span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="size-5" />
              <span className="font-medium">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-brand-cream pb-32 max-w-5xl mx-auto">
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                <h3 className="text-2xl font-serif font-bold">Account Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="size-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Full Name</label>
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Date of Birth</label>
                    <input 
                      type="date" 
                      value={editData.dob} 
                      onChange={e => handleDOBChange(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={editData.weight} 
                      onChange={e => setEditData({...editData, weight: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Height (cm)</label>
                    <input 
                      type="number" 
                      value={editData.height} 
                      onChange={e => setEditData({...editData, height: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Period Duration (Days)</label>
                    <input 
                      type="number" 
                      value={editData.periodDuration} 
                      onChange={e => setEditData({...editData, periodDuration: parseInt(e.target.value) || 5})}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-40">Cycle Length (Days)</label>
                    <input 
                      type="number" 
                      value={editData.cycleLength} 
                      onChange={e => setEditData({...editData, cycleLength: parseInt(e.target.value) || 28})}
                      className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold opacity-40">Sleep Routine</label>
                  <textarea 
                    value={editData.sleepRoutine} 
                    onChange={e => setEditData({...editData, sleepRoutine: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink h-24"
                  />
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-4 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="flex-1 py-4 rounded-2xl pink-gradient text-white font-bold shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2"
                >
                  <Check className="size-5" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Period Modal */}
      <AnimatePresence>
        {showLogPeriod && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                <h3 className="text-2xl font-serif font-bold">Log Period</h3>
                <button onClick={() => setShowLogPeriod(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="size-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="size-16 pink-gradient rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Droplets className="text-white size-8" />
                  </div>
                  <p className="text-gray-500 text-sm">When did your period start in {format(currentCalendarMonth, 'MMMM')}?</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold opacity-40">Start Date</label>
                  <input 
                    type="date" 
                    value={logDate} 
                    onChange={e => setLogDate(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>

                <div className="bg-white p-4 rounded-2xl flex items-center gap-3">
                  <Activity className="text-brand-rose size-5" />
                  <p className="text-xs text-gray-600">Logging your periods helps LunaFlow track your cycle regularity more accurately.</p>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setShowLogPeriod(false)}
                  className="flex-1 py-4 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogPeriod}
                  className="flex-1 py-4 rounded-2xl pink-gradient text-white font-bold shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2"
                >
                  <Check className="size-5" /> Log Start
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-brand-cream/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="size-10 pink-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Droplets className="text-white size-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold">LunaFlow</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Hello,</p>
            <p className="font-bold text-sm">{userData.name}</p>
          </div>
          <button onClick={() => setActiveTab('profile')} className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <UserIcon className="size-6 opacity-40" />
          </button>
        </div>
      </header>

      <main className="px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'profile' && renderProfile()}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 pointer-events-none">
        <div className="glass rounded-full px-8 py-4 flex items-center gap-8 md:gap-16 shadow-2xl pointer-events-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn("transition-all", activeTab === 'home' ? "text-brand-rose scale-110" : "text-gray-400 hover:text-gray-600")}
          >
            <HomeIcon className="size-6" />
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn("transition-all", activeTab === 'calendar' ? "text-brand-rose scale-110" : "text-gray-400 hover:text-gray-600")}
          >
            <CalendarIcon className="size-6" />
          </button>
          <button 
            onClick={() => {
              setLogDate(format(currentCalendarMonth, 'yyyy-MM-dd'));
              setShowLogPeriod(true);
            }}
            className="size-14 pink-gradient rounded-full flex items-center justify-center -mt-16 shadow-lg border-4 border-brand-cream cursor-pointer hover:scale-110 transition-transform"
          >
            <Plus className="text-white size-7" />
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={cn("transition-all", activeTab === 'insights' ? "text-brand-rose scale-110" : "text-gray-400 hover:text-gray-600")}
          >
            <Sparkles className="size-6" />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn("transition-all", activeTab === 'profile' ? "text-brand-rose scale-110" : "text-gray-400 hover:text-gray-600")}
          >
            <UserIcon className="size-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
