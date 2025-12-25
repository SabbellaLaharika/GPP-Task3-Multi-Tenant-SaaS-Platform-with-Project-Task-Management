import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
              
              <div className="mt-6 flex gap-3">
                <Button onClick={onConfirm} variant={confirmVariant} className="flex-1">
                  {confirmText}
                </Button>
                <Button onClick={onClose} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
