import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, Heart, Moon, User, Activity, Scale, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserData } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, differenceInYears } from 'date-fns';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    weight: '',
    dob: '',
    age: '',
    height: '',
    periodDuration: 5,
    cycleLength: 28,
    lastPeriodDate: new Date().toISOString().split('T')[0],
    periodHistory: [new Date().toISOString().split('T')[0]],
    isRegular: true,
    takingPills: false,
    sexuallyActive: false,
    sleepRoutine: '',
    onboardingComplete: false,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  const handleDOBChange = (dob: string) => {
    const age = differenceInYears(new Date(), new Date(dob)).toString();
    setFormData({ ...formData, dob, age });
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const steps = [
    {
      title: "Welcome to LunaFlow",
      subtitle: "Let's start with the basics. What's your name and email?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold opacity-60">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink transition-all"
              placeholder="Aisha"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold opacity-60">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink transition-all"
              placeholder="aisha@example.com"
            />
          </div>
        </div>
      )
    },
    {
      title: "Body Metrics",
      subtitle: "This helps us calculate your health insights.",
      content: (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl">
            <Calendar className="text-brand-rose" />
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => handleDOBChange(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl">
            <Scale className="text-brand-rose" />
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl"
                placeholder="60"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl">
            <Ruler className="text-brand-rose" />
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl"
                placeholder="165"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Cycle",
      subtitle: "When did your last period start?",
      content: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="size-5" />
              </button>
              <h3 className="font-serif font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold opacity-40 py-2">{day}</div>
              ))}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map(day => (
                <button
                  key={day.toISOString()}
                  onClick={() => setFormData({ ...formData, lastPeriodDate: day.toISOString().split('T')[0] })}
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center text-sm transition-all",
                    isSameDay(day, new Date(formData.lastPeriodDate))
                      ? "pink-gradient text-white shadow-lg"
                      : "hover:bg-brand-pink/10"
                  )}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl space-y-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Period Duration (Days)</label>
              <input
                type="number"
                value={formData.periodDuration}
                onChange={e => setFormData({ ...formData, periodDuration: parseInt(e.target.value) || 5 })}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-bold"
              />
            </div>
            <div className="bg-white p-4 rounded-2xl space-y-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Cycle Length (Days)</label>
              <input
                type="number"
                value={formData.cycleLength}
                onChange={e => setFormData({ ...formData, cycleLength: parseInt(e.target.value) || 28 })}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-bold"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <span className="font-medium">Is your cycle regular?</span>
            <button
              onClick={() => setFormData({ ...formData, isRegular: !formData.isRegular })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                formData.isRegular ? "bg-brand-rose" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                formData.isRegular ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Lifestyle",
      subtitle: "A few more details for better recommendations.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <div className="flex items-center gap-3">
              <Activity className="text-brand-rose size-5" />
              <span className="font-medium">Sexually active?</span>
            </div>
            <button
              onClick={() => setFormData({ ...formData, sexuallyActive: !formData.sexuallyActive })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                formData.sexuallyActive ? "bg-brand-rose" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                formData.sexuallyActive ? "left-7" : "left-1"
              )} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
            <div className="flex items-center gap-3">
              <Heart className="text-brand-rose size-5" />
              <span className="font-medium">Taking pills?</span>
            </div>
            <button
              onClick={() => setFormData({ ...formData, takingPills: !formData.takingPills })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                formData.takingPills ? "bg-brand-rose" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                formData.takingPills ? "left-7" : "left-1"
              )} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold opacity-60 flex items-center gap-2">
              <Moon className="size-3" /> Sleep Routine
            </label>
            <textarea
              value={formData.sleepRoutine}
              onChange={e => setFormData({ ...formData, sleepRoutine: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-pink transition-all h-24"
              placeholder="e.g., 7-8 hours, usually sleep at 11 PM"
            />
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step];

  const handleFinish = () => {
    onComplete({ ...formData, onboardingComplete: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-cream">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="size-16 pink-gradient rounded-full flex items-center justify-center shadow-lg shadow-brand-pink/20">
            <Heart className="text-white size-8" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentStepData.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-4xl font-serif font-bold text-gray-800"
            >
              {currentStepData.title}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepData.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500"
            >
              {currentStepData.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          layout
          className="min-h-[300px]"
        >
          {currentStepData.content}
        </motion.div>

        <div className="flex items-center justify-between pt-8">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="text-gray-400 font-medium disabled:opacity-0 transition-opacity"
          >
            Back
          </button>
          
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "size-2 rounded-full transition-all duration-500",
                  i === step ? "w-6 bg-brand-rose" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          <button
            onClick={step === steps.length - 1 ? handleFinish : nextStep}
            className="size-14 pink-gradient rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-pink/40 hover:scale-105 active:scale-95 transition-transform"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
