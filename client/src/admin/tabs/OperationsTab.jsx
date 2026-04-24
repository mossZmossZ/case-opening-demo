import React, { useEffect, useState } from 'react';
import { adminApi, notifyPrizeDataChanged } from '../../lib/api';

const OPERATIONS = [
  {
    id: 'resetSessions',
    label: 'Reset Sessions',
    icon: 'person_remove',
    description: 'Delete all player registrations and spin history. Prize inventory is not affected.',
    confirmText: 'This will permanently delete all users and sessions. This cannot be undone.',
    danger: true,
    apiCall: (token) => adminApi.resetSessions(token),
    successMsg: (res) => `Done — ${res.sessionsDeleted} sessions and ${res.usersDeleted} users removed.`,
  },
  {
    id: 'resetStock',
    label: 'Reset Stock',
    icon: 'inventory',
    description: 'Restore every prize\'s remaining stock back to its original total. Sessions are not affected.',
    confirmText: 'This will refill all prize stocks to their original totals.',
    danger: false,
    apiCall: (token) => adminApi.resetStock(token),
    successMsg: (res) => `Done — ${res.updated} prize${res.updated !== 1 ? 's' : ''} restocked.`,
  },
  {
    id: 'generateDummy',
    label: 'Generate Dummy Prizes',
    icon: 'auto_awesome',
    description: 'Insert a set of demo prizes across all 4 tiers (Common → Legendary) so you can test the app without setting up prizes manually.',
    confirmText: 'This will add 7 demo prizes to your prize pool.',
    danger: false,
    apiCall: (token) => adminApi.generateDummy(token),
    successMsg: (res) => `Done — ${res.created} demo prize${res.created !== 1 ? 's' : ''} added.`,
  },
];

function OperationCard({ op, token, onRefresh }) {
  // state: idle → confirm → loading → result (success/error)
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleConfirm = async () => {
    setState('loading');
    try {
      const res = await op.apiCall(token);
      setMessage(op.successMsg(res));
      setIsError(false);
      setState('result');
      onRefresh();
    } catch (err) {
      setMessage(err.message || 'Operation failed.');
      setIsError(true);
      setState('result');
    }
  };

  const reset = () => { setState('idle'); setMessage(''); setIsError(false); };

  return (
    <div className={`bg-white border rounded-none p-6 flex flex-col gap-4 ${op.danger ? 'border-red-200' : 'border-outline-variant'}`}>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${op.danger ? 'bg-red-50' : 'bg-primary/8'}`}>
          <span
            className={`material-symbols-outlined text-xl ${op.danger ? 'text-red-500' : 'text-primary'}`}
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            {op.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">
            {op.label}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {op.description}
          </p>
        </div>
      </div>

      {/* Action area */}
      {state === 'idle' && (
        <button
          onClick={() => setState('confirm')}
          className={`self-start flex items-center gap-2 px-5 h-9 text-xs font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            op.danger
              ? 'border border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-red-400'
              : 'border border-outline-variant text-on-surface hover:border-primary hover:text-primary focus-visible:ring-primary/40'
          }`}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>{op.icon}</span>
          {op.label}
        </button>
      )}

      {state === 'confirm' && (
        <div className={`p-4 border ${op.danger ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
          <p className={`text-xs font-semibold mb-3 ${op.danger ? 'text-red-700' : 'text-amber-800'}`}>
            {op.confirmText}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className={`px-4 h-8 text-xs font-bold uppercase tracking-wide text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                op.danger
                  ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400'
                  : 'bg-primary hover:bg-primary-fixed focus-visible:ring-primary'
              }`}
            >
              Confirm
            </button>
            <button
              onClick={reset}
              className="px-4 h-8 text-xs font-bold uppercase tracking-wide border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base animate-spin-loader">progress_activity</span>
          Running…
        </div>
      )}

      {state === 'result' && (
        <div className={`flex items-start gap-3 p-3 border ${isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <span
            className={`material-symbols-outlined text-base flex-shrink-0 mt-0.5 ${isError ? 'text-red-500' : 'text-green-600'}`}
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isError ? 'error' : 'check_circle'}
          </span>
          <p className={`text-xs flex-1 ${isError ? 'text-red-700' : 'text-green-700'}`}>{message}</p>
          <button
            onClick={reset}
            className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function MaximumAttemptsCard({ token, settings, onRefresh }) {
  const [maximumAttempts, setMaximumAttempts] = useState(settings.maximumAttempts || 5);
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const isDirty = maximumAttempts !== (settings.maximumAttempts || 5);

  useEffect(() => {
    setMaximumAttempts(settings.maximumAttempts || 5);
  }, [settings.maximumAttempts]);

  const save = async () => {
    setState('loading');
    setMessage('');
    try {
      const updated = await adminApi.updateSettings(token, { maximumAttempts });
      setMaximumAttempts(updated.maximumAttempts);
      setMessage(`Maximum attempts set to ${updated.maximumAttempts}.`);
      setState('saved');
      notifyPrizeDataChanged();
      onRefresh();
    } catch (err) {
      setMessage(err.message || 'Failed to save maximum attempts.');
      setState('error');
    }
  };

  return (
    <div className="bg-white border border-outline-variant p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/8">
          <span
            className="material-symbols-outlined text-xl text-primary"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            counter_5
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">
            Maximum Attempts
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Set how many case opens a player can choose on the home page. Locked slots show as x.
          </p>
        </div>
      </div>

      <div>
        <p className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          Attempts Limit
        </p>
        <div className="flex gap-2" role="group" aria-label="Select maximum attempts">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setMaximumAttempts(n)}
              aria-pressed={maximumAttempts === n}
              className={`flex-1 h-10 font-mono text-sm font-bold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                maximumAttempts === n
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!isDirty || state === 'loading'}
          className="flex items-center gap-2 px-5 h-9 text-xs font-bold uppercase tracking-wide bg-primary text-on-primary hover:bg-primary-fixed disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            {state === 'loading' ? 'progress_activity' : 'save'}
          </span>
          Save Limit
        </button>
        {message && (
          <p
            className={`text-xs ${state === 'error' ? 'text-red-700' : 'text-green-700'}`}
            role={state === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function OperationsTab({ token, settings, onRefresh }) {
  return (
    <div className="flex flex-col gap-6">

      <div className="border-l-4 border-amber-400 pl-4 py-1 bg-amber-50">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Caution</p>
        <p className="text-xs text-amber-700 mt-0.5">
          These operations modify live data. Each action requires a confirmation step. Use with care during an active event.
        </p>
      </div>

      <MaximumAttemptsCard token={token} settings={settings} onRefresh={onRefresh} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {OPERATIONS.map(op => (
          <OperationCard key={op.id} op={op} token={token} onRefresh={onRefresh} />
        ))}
      </div>

    </div>
  );
}
