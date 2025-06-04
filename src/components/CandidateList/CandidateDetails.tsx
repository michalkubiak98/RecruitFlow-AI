import React, { useState } from 'react';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { Candidate } from '../../types';
import { candidateService, noteService } from '../../services/database';
import { Button, Input, Card } from '../UI';
import toast from 'react-hot-toast';

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdate: () => void;
}

export function CandidateDetails({ candidate, onClose, onUpdate }: CandidateDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: candidate.name,
    location: candidate.location || '',
    salary: candidate.salary || '',
    roles: candidate.roles || '',
    drives: candidate.drives
  });
  const [newNote, setNewNote] = useState('');

  const handleSave = async () => {
    try {
      await candidateService.update(candidate.id, editData);
      toast.success('Candidate updated');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update candidate');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await noteService.create(candidate.id, newNote);
      setNewNote('');
      toast.success('Note added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await candidateService.delete(candidate.id);
        toast.success('Candidate deleted');
        onClose();
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete candidate');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <h2 className="text-xl font-semibold">Candidate Details</h2>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic info */}
        <Card>
          <h3 className="font-medium mb-3">Basic Information</h3>
          <div className="space-y-3">
            <Input
              label="Name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Salary"
              value={editData.salary}
              onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Roles"
              value={editData.roles}
              onChange={(e) => setEditData({ ...editData, roles: e.target.value })}
              disabled={!isEditing}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="drives"
                checked={editData.drives}
                onChange={(e) => setEditData({ ...editData, drives: e.target.checked })}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 bg-dark-300 border-dark-400 rounded focus:ring-blue-500"
              />
              <label htmlFor="drives" className="text-sm text-gray-300">
                Can drive
              </label>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h3 className="font-medium mb-3">Notes</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1"
              />
              <Button onClick={handleAddNote}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {candidate.notes?.map((note) => (
                <div key={note.id} className="p-3 bg-dark-300 rounded-lg">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Spec tracking */}
        {candidate.specs && candidate.specs.length > 0 && (
          <Card>
            <h3 className="font-medium mb-3">Spec Tracking</h3>
            <div className="space-y-2">
              {candidate.specs.map((spec) => (
                <div key={spec.id} className="p-3 bg-dark-300 rounded-lg">
                  <p className="text-sm font-medium">{spec.role} at {spec.company}</p>
                  <p className="text-xs text-gray-400">Status: {spec.status}</p>
                  <p className="text-xs text-gray-400">
                    Sent: {new Date(spec.specSentDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
