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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] border border-slate-700 p-6 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.7)] max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <p className="mb-6 text-slate-300">{message}</p>
        <div className="flex justify-end space-x-4">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={type === 'confirm' ? onConfirm : onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            {type === 'confirm' ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;