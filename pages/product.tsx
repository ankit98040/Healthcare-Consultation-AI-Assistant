"use client"

import { useState, useEffect, FormEvent } from 'react';
import { useAuth, Protect, PricingTable, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Link from 'next/link';

const SAMPLE_NOTES = [
  {
    title: "Cardiology Follow-up",
    patientName: "Sarah Jenkins",
    notes: "Patient reports mild chest tightness after climbing 2 flights of stairs. BP 138/88, HR 74 bpm. Currently on Lisinopril 10mg daily. Compliant with diet, reduced sodium intake. Ordered EKG and lipid panel. Advised to log daily morning blood pressure readings. Follow up in 4 weeks."
  },
  {
    title: "Respiratory Assessment",
    patientName: "Robert Chen",
    notes: "54 yo male presented with persistent dry cough and low-grade fever for 3 days. Chest X-ray clear. Lungs reveal mild bilateral wheezing. Oxygen saturation 97% on room air. Prescribed Albuterol inhaler PRN and short course of Oral Prednisone. Drink plenty of warm fluids and rest. Contact clinic if fever exceeds 102°F or dyspnea worsens."
  },
  {
    title: "Routine Pediatric Checkup",
    patientName: "Liam Davis (8 y/o)",
    notes: "Annual wellness checkup. Growth percentiles stable (65th percentile height, 50th percentile weight). Immunizations up to date (MMR booster administered today). Parents report good sleep and diet. Recommended 60 mins daily physical activity and annual dental cleaning."
  }
];

function ConsultationForm() {
    const { getToken } = useAuth();

    // Form state
    const [patientName, setPatientName] = useState('');
    const [visitDate, setVisitDate] = useState<Date | null>(new Date());
    const [notes, setNotes] = useState('');

    // Streaming & Copy state
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'actions' | 'email'>('all');

    function loadSample(sample: typeof SAMPLE_NOTES[0]) {
        setPatientName(sample.patientName);
        setVisitDate(new Date());
        setNotes(sample.notes);
        setOutput('');
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setOutput('');
        setLoading(true);

        try {
            const jwt = await getToken();
            if (!jwt) {
                setOutput('Error: Authentication token not available. Please sign in again.');
                setLoading(false);
                return;
            }

            const controller = new AbortController();
            let buffer = '';

            await fetchEventSource('/api', {
                signal: controller.signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    patient_name: patientName,
                    date_of_visit: visitDate?.toISOString().slice(0, 10),
                    notes,
                }),
                onmessage(ev) {
                    buffer += ev.data;
                    setOutput(buffer);
                },
                onclose() { 
                    setLoading(false); 
                },
                onerror(err) {
                    console.error('SSE error:', err);
                    controller.abort();
                    setLoading(false);
                },
            });
        } catch (err: any) {
            console.error('Submit error:', err);
            setOutput('An error occurred while generating the summary. Please try again.');
            setLoading(false);
        }
    }

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header / Navigation bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="h-9 w-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 hover:bg-blue-600/50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Clinical Assistant Workspace
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 ml-12">
                        Enter consultation observations below to generate structured records and patient letters.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        AI Engine Ready
                    </span>
                    <UserButton showName={true} />
                </div>
            </div>

            {/* Quick Sample Selector */}
            <div className="mb-6 p-4 rounded-xl glass-panel border border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Load Sample Consultation
                </p>
                <div className="flex flex-wrap gap-2">
                    {SAMPLE_NOTES.map((sample, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => loadSample(sample)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 border border-white/10 hover:border-blue-500/40 text-xs font-medium text-gray-200 transition-all"
                        >
                            + {sample.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Form Input Section */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                            <span className="text-blue-400">01.</span> Consultation Details
                        </h2>

                        <div className="space-y-1.5">
                            <label htmlFor="patient" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Patient Full Name
                            </label>
                            <input
                                id="patient"
                                type="text"
                                required
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="date" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Date of Visit
                            </label>
                            <div className="relative">
                                <DatePicker
                                    id="date"
                                    selected={visitDate}
                                    onChange={(d: Date | null) => setVisitDate(d)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select date"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="notes" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Doctor's Clinical Notes
                            </label>
                            <textarea
                                id="notes"
                                required
                                rows={9}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-y font-mono leading-relaxed"
                                placeholder="Type or paste doctor's notes, symptoms, vital signs, and preliminary diagnoses..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !notes.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Synthesizing Records...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate AI Clinical Summary</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Output Display Section */}
                <div className="lg:col-span-7">
                    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl min-h-[520px] flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10 mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-emerald-400">02.</span> AI Generated Documentation
                            </h2>

                            {output && (
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-emerald-400">Copied to Clipboard!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            <span>Copy Record</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {output ? (
                                <div className="markdown-content text-sm leading-relaxed p-4 rounded-xl bg-slate-950/70 border border-white/5 font-sans">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {output}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-center text-3xl mb-4">
                                        🩺
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-200 mb-1">No Documentation Generated Yet</h3>
                                    <p className="text-xs text-gray-400 max-w-sm">
                                        Fill in the consultation form on the left or select a sample patient case above, then click <span className="text-blue-400 font-medium">"Generate AI Clinical Summary"</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Product() {
    const router = useRouter();
    // Allow query params like ?success=true or ?subscribed=true or manual override toggle
    const [overrideSubscribed, setOverrideSubscribed] = useState(false);

    useEffect(() => {
        if (router.query.success === 'true' || router.query.subscribed === 'true' || router.query.redirect === 'app') {
            setOverrideSubscribed(true);
        }
    }, [router.query]);

    return (
        <main className="min-h-screen bg-[#0b0f19] text-gray-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

            {overrideSubscribed ? (
                <ConsultationForm />
            ) : (
                <Protect
                    condition={(has) => has({ plan: 'premium_subscription' })}
                    fallback={
                        <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
                            {/* Navigation Back */}
                            <div className="flex justify-between items-center mb-8">
                                <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                                    ← Back to Home
                                </Link>
                                <UserButton showName={true} />
                            </div>

                            <header className="text-center mb-12">
                                <span className="px-3.5 py-1 text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-500/30 rounded-full uppercase tracking-wider inline-block mb-4">
                                    Healthcare Provider Subscription
                                </span>
                                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-4">
                                    Unlock MediNotes Pro Assistant
                                </h1>
                                <p className="text-gray-400 text-base max-w-2xl mx-auto">
                                    Get unlimited access to AI consultation summaries, action items, and automated patient communication.
                                </p>
                            </header>

                            {/* Direct Access Bar for Subscribed / Dev Testing */}
                            <div className="mb-10 p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 text-center max-w-2xl mx-auto shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="text-emerald-400">✓</span> Already Subscribed or Testing?
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Click below to directly launch the Consultation Assistant.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOverrideSubscribed(true)}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 hover:scale-105 whitespace-nowrap"
                                >
                                    Continue to App →
                                </button>
                            </div>

                            <div className="max-w-4xl mx-auto glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <PricingTable />
                            </div>
                        </div>
                    }
                >
                    <ConsultationForm />
                </Protect>
            )}
        </main>
    );
}