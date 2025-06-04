import { useState, useEffect } from 'react';
import { X, Save, User, MapPin, DollarSign, Briefcase, Building, Car, StickyNote, ChevronDown } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Partial<Candidate>) => void;
}

export function CandidateModal({ candidate, isOpen, onClose, onSave }: CandidateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    salary: '',
    roles: '',
    industry: '' as 'life science' | 'food science' | '',
    drives: false,
    notes: ''
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        location: candidate.location,
        salary: candidate.salary,
        roles: candidate.roles,
        industry: candidate.industry,
        drives: candidate.drives,
        notes: candidate.notes || ''
      });
    }
  }, [candidate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-lg border border-dark-300 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <h2 className="text-xl font-semibold text-white">
            {candidate?.id === 0 ? 'Add Candidate' : 'Edit Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none placeholder-gray-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Role/Position
            </label>
            <input
              type="text"
              value={formData.roles}
              onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
              placeholder="e.g., Developer, QA Specialist, Marketing Manager"
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Industry
            </label>
            <div className="relative">
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value as any })}
                className="w-full px-3 py-2 pr-10 bg-dark-100 text-white rounded-lg border border-dark-300 
                         focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Industry</option>
                <option value="life science">Life Science</option>
                <option value="food science">Food Science</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Salary Expectation
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., 50k, 60-70k"
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <StickyNote className="w-4 h-4 inline mr-2" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this candidate..."
              rows={3}
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
            />
          </div>

          {/* Driving */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="drives"
              checked={formData.drives}
              onChange={(e) => setFormData({ ...formData, drives: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-dark-100 border-dark-300 rounded 
                       focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="drives" className="text-sm text-gray-300 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Can drive
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 border border-dark-300 rounded-lg 
                       hover:bg-dark-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
