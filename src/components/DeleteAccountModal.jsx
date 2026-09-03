import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { currentUser, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText.toUpperCase() !== 'DELETE') {
      soundEffects.playError();
      setErrorMessage('Please type "DELETE" to confirm account and data erasure.');
      return;
    }

    setIsDeleting(true);
    soundEffects.playClick();

    try {
      await deleteAccount();
      onClose();
      alert("Your account and personal data have been permanently erased in compliance with Google Play Privacy Policies.");
    } catch (err) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Error erasing account data.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl shadow-[0_20px_50px_rgba(244,63,94,0.3)] overflow-hidden">
        
        {/* Top Danger Bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-5">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-1 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white font-outfit">
              Delete Account & Data
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with Google Play developer policies, this action permanently purges your profile, contact records, and active trial session passes from our systems.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Warning: This cannot be undone</span>
            </p>
            <p className="text-[11px] text-rose-300/80">
              Account: <strong className="text-white">{currentUser.name}</strong> ({currentUser.phone})
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">
                Type <strong className="text-rose-400">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setErrorMessage(''); }}
                placeholder="DELETE"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono text-center tracking-widest uppercase"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Erase Account'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
