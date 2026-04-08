import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  type: 'alert' | 'confirm';
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onClose, onConfirm, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-md w-full mx-4 relative overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">
          {title}
        </h2>
        
        <p className="mb-8 text-slate-400 text-sm font-medium leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end space-x-4">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all"
            >
              Cancel
            </button>
          )}
          <button
            onClick={type === 'confirm' ? onConfirm : onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all"
          >
            {type === 'confirm' ? 'Confirm' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;