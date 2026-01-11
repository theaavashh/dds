'use client';

import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface FullDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialValue: string;
}

export default function FullDescriptionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue 
}: FullDescriptionModalProps) {
  const [content, setContent] = useState(initialValue);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Full Description</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="h-[600px]">
            <RichTextEditor
              value={content}
              onChange={(value) => setContent(value)}
            />
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}