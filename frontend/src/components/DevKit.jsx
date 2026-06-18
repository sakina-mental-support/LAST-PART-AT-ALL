import React, { useState } from 'react';
import Badge from './Badge';

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'ai_brain', label: 'AI Brain Control', icon: 'psychology' },
  { id: 'crisis', label: 'Crisis & Safety', icon: 'emergency' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  { id: 'exercises', label: 'Exercise System', icon: 'bolt' },
  { id: 'personalization', label: 'Personalization', icon: 'tune' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'providers', label: 'AI Providers', icon: 'cloud' },
  { id: 'security', label: 'Security & Keys', icon: 'shield' },
  { id: 'config', label: 'System Config', icon: 'settings' },
  { id: 'docs', label: 'SDK & Docs', icon: 'code' },
];

const USERS = [
  { id: 'u001', name: 'Sarah K.', mood: 'Anxious', risk: 'high', score: 72, sessions: 14 },
  { id: 'u002', name: 'Omar H.', mood: 'Calm', risk: 'low', score: 28, sessions: 31 },
  { id: 'u003', name: 'Lena M.', mood: 'Stressed', risk: 'medium', score: 55, sessions: 8 },
  { id: 'u004', name: 'James T.', mood: 'Balanced', risk: 'low', score: 20, sessions: 22 },
];

const RISK_COLOR = { low: 'bg-emerald-100 text-emerald-600', medium: 'bg-amber-100 text-amber-600', high: 'bg-rose-100 text-rose-600' };

const METRICS = [
  { label: 'Active Users', value: '1,284', icon: 'group', trend: '+12%', color: 'text-[#00adef]' },
  { label: 'Avg Anxiety Level', value: '42%', icon: 'psychology', trend: '-8%', color: 'text-indigo-500' },
  { label: 'Crisis Events Today', value: '3', icon: 'emergency', trend: '-2', color: 'text-rose-500' },
  { label: 'Recovery Rate', value: '78%', icon: 'trending_up', trend: '+5%', color: 'text-[#00adef]' },
];

const AI_PERSONAS = ['Your Sakina', 'Calm Therapist', 'Motivational Coach', 'Scientific Guide', 'Minimal Companion'];

const CRISIS_EVENTS = [
  { user: 'Sarah K.', level: 4, time: '2 min ago', status: 'Active' },
  { user: 'Anon#4421', level: 2, time: '18 min ago', status: 'Resolved' },
  { user: 'Mark D.', level: 3, time: '1 hr ago', status: 'Monitoring' },
];

const SDK_SNIPPET = `// Sakina EIS SDK - JavaScript
import { SakinaClient } from '@sakina/eis-sdk';

const client = new SakinaClient({ apiKey: 'sk_live_...' });

// Send emotion signal
await client.emotion.signal({
  userId: 'user_123',
  mood: 'anxious',
  intensity: 72
});

// Fetch user insights
const insights = await client.insights.get('user_123');

// Create intervention session
const session = await client.session.create({
  userId: 'user_123',
  type: 'cognitive_interrupt'
});`;

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-[32px] border border-gray-50 shadow-sm p-10 ${className}`}>
    <h3 className="text-[10px] font-black uppercase tracking-[6px] text-gray-300 mb-8">{title}</h3>
    {children}
  </div>
);

const sections = {
  overview: (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[6px] text-[#00adef] mb-4">Emotional OS</p>
        <h1 className="font-['Inter'] text-6xl font-bold text-[#091426] tracking-tighter uppercase leading-none">Control Room.</h1>
        <p className="text-gray-400 mt-4 text-lg max-w-2xl">Real-time control center for human emotional behavior systems. MiniMax 2.7 + NVIDIA API active.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((m, i) => (
          <div key={i} className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-50 group hover:-translate-y-2 transition-all">
            <div className="flex justify-between items-start mb-8">
              <span className={`material-symbols-outlined text-3xl ${m.color}`}>{m.icon}</span>
              <span className={`text-[10px] font-black ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{m.trend}</span>
            </div>
            <p className="text-4xl font-bold text-[#091426] mb-2">{m.value}</p>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Mood Distribution (Live)">
          <div className="space-y-4">
            {[['Calm/Happy', 38, '#00adef'], ['Balanced', 24, '#6366f1'], ['Anxious', 22, '#f59e0b'], ['Stressed', 16, '#f43f5e']].map(([label, pct, color]) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-bold text-[#091426] mb-2"><span>{label}</span><span>{pct}%</span></div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }}></div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="System Health">
          {[['AI Brain (MiniMax 2.7)', 'Online', 'emerald'], ['Crisis Engine', 'Online', 'emerald'], ['Personalization', 'Online', 'emerald'], ['NVIDIA API', 'Degraded', 'amber']].map(([svc, status, color]) => (
            <div key={svc} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
              <span className="text-sm font-bold text-[#091426]">{svc}</span>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${color}-50`}>
                <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></div>
                <span className={`text-[10px] font-black text-${color}-600 uppercase tracking-[2px]`}>{status}</span>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  ),

  users: (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">User Management.</h2>
          <p className="text-gray-400 mt-2">Emotional profiles, risk scores, and behavioral history.</p>
        </div>
        <button className="px-8 py-4 bg-[#091426] text-white rounded-2xl font-black uppercase tracking-[4px] text-[10px]">+ Add User</button>
      </div>
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 px-10 py-4 border-b border-gray-50 text-[10px] font-black uppercase tracking-[4px] text-gray-300">
          <span className="col-span-2">User</span><span>Mood</span><span>Risk Score</span><span>Sessions</span><span>Actions</span>
        </div>
        {USERS.map(u => (
          <div key={u.id} className="grid grid-cols-6 px-10 py-6 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors">
            <div className="col-span-2 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#00adef]/10 flex items-center justify-center text-[#00adef] font-black">{u.name[0]}</div>
              <div><p className="text-sm font-bold text-[#091426]">{u.name}</p><p className="text-[10px] text-gray-300 font-mono">{u.id}</p></div>
            </div>
            <span className="text-sm font-bold text-[#091426]">{u.mood}</span>
            <div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] ${RISK_COLOR[u.risk]}`}>{u.score}% {u.risk}</span>
            </div>
            <span className="text-sm font-bold text-gray-400">{u.sessions}</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-[10px] font-black text-[#00adef] bg-[#00adef]/10 rounded-xl hover:bg-[#00adef] hover:text-white transition-all">View</button>
              <button className="px-4 py-2 text-[10px] font-black text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all">Reset</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  ai_brain: (
    <div className="space-y-8">
      <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">AI Brain Control.</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Active Personality">
          <div className="space-y-3">
            {AI_PERSONAS.map(p => (
              <button key={p} className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl border border-gray-100 hover:border-[#00adef] hover:bg-[#00adef]/5 transition-all text-left">
                <span className="material-symbols-outlined text-2xl text-[#00adef]">psychology</span>
                <span className="text-sm font-bold text-[#091426]">{p}</span>
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Behavior Rules Engine">
          {[['anxiety > 70', 'Short responses + grounding', 'active'], ['panic_detected', 'Activate Safe Mode', 'active'], ['burnout_index > 80', 'Switch to Recovery Flow', 'inactive']].map(([cond, action, status]) => (
            <div key={cond} className="py-5 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-gray-50 px-3 py-1 rounded-lg font-mono text-[#091426]">IF {cond}</code>
                <div className={`w-10 h-5 rounded-full transition-all cursor-pointer ${status === 'active' ? 'bg-[#00adef]' : 'bg-gray-200'}`}><div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all ${status === 'active' ? 'translate-x-5' : ''}`}></div></div>
              </div>
              <p className="text-xs text-gray-400">→ {action}</p>
            </div>
          ))}
          <button className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-300 hover:border-[#00adef] hover:text-[#00adef] transition-all uppercase tracking-[4px]">+ Add Rule</button>
        </SectionCard>
        <SectionCard title="Sensitivity Controls" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-8">
            {[['Crisis Sensitivity', 75], ['Response Verbosity', 50], ['Emotional Softening', 80]].map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-[#091426]">{label}</span>
                  <span className="text-xs font-black text-[#00adef]">{val}%</span>
                </div>
                <input type="range" min="0" max="100" defaultValue={val} className="w-full accent-[#00adef]" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  ),

  crisis: (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">Crisis Center.</h2>
        <Badge variant="solid" color="teal" size="sm" className="!bg-emerald-100 !text-emerald-600 tracking-[4px]">System Safe</Badge>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[['Level 1', 'Mild Anxiety', 'calming message', 'emerald'], ['Level 2', 'Panic', 'guided breathing', 'amber'], ['Level 3', 'High Risk', 'safe mode UI', 'orange'], ['Level 4', 'Escalation', 'human review', 'rose']].map(([lvl, label, action, color]) => (
          <div key={lvl} className={`bg-${color}-50 border border-${color}-100 rounded-[28px] p-8`}>
            <p className={`text-[10px] font-black uppercase tracking-[4px] text-${color}-500 mb-3`}>{lvl}</p>
            <p className="text-lg font-bold text-[#091426] mb-2">{label}</p>
            <p className="text-xs text-gray-400">→ {action}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Live Crisis Feed">
        {CRISIS_EVENTS.map((e, i) => (
          <div key={i} className="flex items-center gap-6 py-5 border-b border-gray-50 last:border-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${e.level >= 3 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>L{e.level}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#091426]">{e.user}</p>
              <p className="text-xs text-gray-400">{e.time}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black ${e.status === 'Active' ? 'bg-rose-50 text-rose-600' : e.status === 'Monitoring' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{e.status}</span>
            <button className="px-5 py-2 bg-[#091426] text-white rounded-xl text-[10px] font-black">Review</button>
          </div>
        ))}
      </SectionCard>
    </div>
  ),

  analytics: (
    <div className="space-y-8">
      <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">Analytics & Forecasting.</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SectionCard title="Burnout Prediction Index" className="lg:col-span-1">
          <div className="text-center py-8">
            <div className="text-7xl font-bold text-[#091426] mb-2">34<span className="text-2xl text-gray-200">%</span></div>
            <p className="text-xs text-gray-400 uppercase tracking-[4px]">Risk Population</p>
            <div className="mt-8 h-2 bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '34%' }}></div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Weekly Emotional Forecast" className="lg:col-span-2">
          <div className="flex items-end gap-4 h-40 pt-4">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
              const h = [55, 62, 48, 70, 58, 45, 52][i];
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-[#00adef] to-[#6366f1] transition-all" style={{ height: `${h}%` }}></div>
                  <span className="text-[9px] font-black text-gray-300 uppercase">{d}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
        <SectionCard title="Causal Insights" className="lg:col-span-3">
          {[['Digital Overload → Anxiety Spike', '+72% correlation', 'rose'], ['Evening Sessions → Better Recovery', '+64% impact', 'teal'], ['2+ Journal Entries/Week → Resilience Gain', '+48% improvement', 'indigo']].map(([insight, stat, color]) => (
            <div key={insight} className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0">
              <p className="text-sm font-bold text-[#091426]">{insight}</p>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black bg-${color}-50 text-${color}-600`}>{stat}</span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  ),

  docs: (
    <div className="space-y-8">
      <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">SDK & Docs.</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SectionCard title="REST API Reference" className="lg:col-span-1">
          <div className="space-y-3">
            {[['GET', '/users', 'List all users'], ['GET', '/users/{id}/profile', 'Emotional profile'], ['POST', '/ai/config/update', 'Update AI config'], ['GET', '/crisis/events', 'Live crisis feed'], ['GET', '/analytics/predict', 'Emotional forecast'], ['PATCH', '/ai/personality', 'Set AI persona']].map(([method, path, desc]) => (
              <div key={path} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${method === 'GET' ? 'bg-emerald-50 text-emerald-600' : method === 'POST' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>{method}</span>
                <code className="text-xs font-mono text-[#091426] flex-1">{path}</code>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="JavaScript SDK" className="lg:col-span-2">
          <pre className="bg-[#091426] text-[#00adef] p-8 rounded-2xl text-xs font-mono leading-relaxed overflow-x-auto">
            {SDK_SNIPPET}
          </pre>
          <div className="mt-6 flex gap-4">
            <button className="px-8 py-4 bg-[#091426] text-white rounded-2xl text-[10px] font-black uppercase tracking-[4px]">Copy Code</button>
            <button className="px-8 py-4 border border-gray-100 text-[#091426] rounded-2xl text-[10px] font-black uppercase tracking-[4px]">Full Docs ↗</button>
          </div>
        </SectionCard>
      </div>
    </div>
  ),

  config: (
    <div className="space-y-8">
      <h2 className="font-['Inter'] text-5xl font-bold text-[#091426] tracking-tighter uppercase">System Config.</h2>
      <SectionCard title="Feature Flags">
        <div className="space-y-2">
          {[['AI Memory System', true], ['Crisis Mode', true], ['Personalization Engine', true], ['Predictive Analytics', false], ['A/B Testing Engine', false], ['Emotional Simulation Mode', false]].map(([flag, on]) => (
            <div key={flag} className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-bold text-[#091426]">{flag}</p>
              </div>
              <div className={`w-12 h-6 rounded-full cursor-pointer transition-all ${on ? 'bg-[#00adef]' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  ),
};

const defaultSection = (id) => (
  <div className="flex flex-col items-center justify-center h-96 opacity-30">
    <span className="material-symbols-outlined text-[80px] text-[#00adef] mb-4">{NAV.find(n => n.id === id)?.icon}</span>
    <p className="text-xl font-bold text-[#091426] uppercase tracking-[4px]">{NAV.find(n => n.id === id)?.label}</p>
    <p className="text-sm text-gray-400 mt-2">Module coming soon</p>
  </div>
);

const DevKit = () => {
  const [active, setActive] = useState('overview');

  return (
    <div className="fixed inset-0 z-[200] flex font-['Inter'] bg-[#f7f9fb]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#091426] flex flex-col py-10 gap-1 overflow-y-auto flex-shrink-0">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#00adef] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">psychology_alt</span>
            </div>
            <span className="font-['Inter'] text-xl font-bold text-white">DevKit</span>
          </div>
          <p className="text-[9px] text-[#00adef] font-black uppercase tracking-[5px] opacity-60">EIS Control Room</p>
        </div>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-4 px-8 py-4 transition-all text-left ${active === item.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <span className={`material-symbols-outlined text-xl ${active === item.id ? 'text-[#00adef]' : ''}`}>{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
            {active === item.id && <div className="ml-auto w-1 h-6 bg-[#00adef] rounded-full"></div>}
          </button>
        ))}
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-16">
        {sections[active] || defaultSection(active)}
      </main>

      {/* Close Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all z-50"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
};

export default DevKit;
