import React, { useState, useEffect } from 'react';
import { coachAPI } from '../services/api';
import { Button, Input, Alert } from './DesignSystem';

export default function AddTraineeModal({ isOpen, onClose, onSuccess }) {
  const [availableTrainees, setAvailableTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingTrainees, setFetchingTrainees] = useState(false);

  // Fetch available trainees when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTrainees();
    }
  }, [isOpen]);

  // Filter trainees based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTrainees(availableTrainees);
    } else {
      const filtered = availableTrainees.filter(trainee =>
        trainee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrainees(filtered);
    }
  }, [searchTerm, availableTrainees]);

  const fetchAvailableTrainees = async () => {
    try {
      setFetchingTrainees(true);
      setError('');
      
      console.log('🔍 Fetching available trainees...');
      const response = await coachAPI.getAvailableTrainees();
      
      console.log('✅ Available trainees response:', response);
      
      if (response.success) {
        setAvailableTrainees(response.data || []);
        setFilteredTrainees(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch trainees');
      }
    } catch (err) {
      console.error('❌ Error fetching trainees:', err);
      setError(err.message || 'Failed to load available trainees');
      setAvailableTrainees([]);
      setFilteredTrainees([]);
    } finally {
      setFetchingTrainees(false);
    }
  };

  const handleSelectTrainee = (trainee) => {
    setSelectedTrainee(trainee);
    setError('');
  };

  const handleAddTrainee = async () => {
    if (!selectedTrainee) {
      setError('Please select a trainee');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('➕ Adding trainee:', selectedTrainee);
      
      const response = await coachAPI.addTrainee({
        trainee_id: selectedTrainee.id,
        notes: notes.trim()
      });

      console.log('✅ Add trainee response:', response);

      if (response.success) {
        // Success! Close modal and refresh
        onSuccess && onSuccess();
        handleClose();
      } else {
        throw new Error(response.message || 'Failed to add trainee');
      }
    } catch (err) {
      console.error('❌ Error adding trainee:', err);
      setError(err.message || 'Failed to add trainee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTrainee(null);
    setNotes('');
    setSearchTerm('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#002855] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-700/30">
        {/* Header */}
        <div className="p-6 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-yellow-400">➕ Add Trainee</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-1">Select a trainee to add to your team</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Alert */}
          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="🔍 Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={fetchingTrainees || loading}
            />
          </div>

          {/* Loading State */}
          {fetchingTrainees && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="text-gray-400 mt-2">Loading trainees...</p>
            </div>
          )}

          {/* No Trainees */}
          {!fetchingTrainees && filteredTrainees.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">😕</div>
              <p className="text-gray-400">
                {searchTerm ? 'No trainees found matching your search' : 'No available trainees'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try a different search term' : 'All registered trainees are already added, or there are no trainees yet.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAvailableTrainees}
                className="mt-4"
              >
                🔄 Refresh
              </Button>
            </div>
          )}

          {/* Trainee List */}
          {!fetchingTrainees && filteredTrainees.length > 0 && (
            <div className="space-y-2">
              {filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  onClick={() => handleSelectTrainee(trainee)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedTrainee?.id === trainee.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-blue-700/30 hover:border-yellow-400/50 hover:bg-blue-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold">
                        {trainee.full_name ? trainee.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{trainee.full_name || 'No Name'}</h3>
                        <p className="text-sm text-gray-400">{trainee.email}</p>
                        <p className="text-xs text-gray-500">@{trainee.username}</p>
                      </div>
                    </div>
                    {selectedTrainee?.id === trainee.id && (
                      <div className="text-yellow-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes (only show if trainee selected) */}
          {selectedTrainee && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this trainee..."
                rows={3}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-blue-700/30 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTrainee}
            disabled={!selectedTrainee || loading}
          >
            {loading ? '⏳ Adding...' : '✅ Add Selected'}
          </Button>
        </div>
      </div>
    </div>
  );
}
