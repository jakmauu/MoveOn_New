import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coachAPI } from '../services/api';
import { Button, Alert, Card } from '../components/DesignSystem';
import AddTraineeModal from '../components/AddTraineeModal';

export default function CoachTraineesPage() {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchTrainees();
  }, []);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('👥 Fetching my trainees...');
      const response = await coachAPI.getMyTrainees();
      
      console.log('✅ Trainees response:', response);
      
      if (response.success) {
        setTrainees(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch trainees');
      }
    } catch (err) {
      console.error('❌ Error fetching trainees:', err);
      setError(err.message || 'Failed to load trainees');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrainee = async (relationshipId, traineeName) => {
    if (!confirm(`Are you sure you want to remove ${traineeName} from your team?`)) {
      return;
    }

    try {
      setRemovingId(relationshipId);
      
      console.log('🗑️ Removing trainee:', relationshipId);
      const response = await coachAPI.removeTrainee(relationshipId);
      
      console.log('✅ Remove response:', response);
      
      if (response.success) {
        // Remove from local state
        setTrainees(prev => prev.filter(t => t.relationship_id !== relationshipId));
      } else {
        throw new Error(response.message || 'Failed to remove trainee');
      }
    } catch (err) {
      console.error('❌ Error removing trainee:', err);
      alert(err.message || 'Failed to remove trainee. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddSuccess = () => {
    // Refresh trainees list after adding
    fetchTrainees();
  };

  const handleViewDetails = (traineeId) => {
    navigate(`/coach/trainee/${traineeId}`);
  };

  return (
    <div className="min-h-screen bg-[#001a3d] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">👥 My Trainees</h1>
            <p className="text-gray-300">Manage your team of trainees</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            ➕ Add Trainee
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="text-gray-400 mt-4">Loading trainees...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && trainees.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Trainees Yet</h2>
            <p className="text-gray-400 mb-6">
              Start building your team by adding trainees
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              ➕ Add Your First Trainee
            </Button>
          </Card>
        )}

        {/* Trainees Grid */}
        {!loading && trainees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainees.map((trainee) => (
              <Card key={trainee.relationship_id} className="p-6 hover:border-yellow-400/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
                      {trainee.full_name ? trainee.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{trainee.full_name || 'No Name'}</h3>
                      <p className="text-sm text-gray-400">@{trainee.username}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    trainee.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {trainee.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {trainee.email}
                  </div>
                  {trainee.phone_number && (
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {trainee.phone_number}
                    </div>
                  )}
                  {trainee.start_date && (
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Started: {new Date(trainee.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {trainee.notes && (
                  <div className="mb-4 p-3 bg-blue-900/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Notes:</p>
                    <p className="text-sm text-gray-300">{trainee.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewDetails(trainee.trainee_id)}
                    className="flex-1"
                  >
                    👁️ View Details
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveTrainee(trainee.relationship_id, trainee.full_name)}
                    disabled={removingId === trainee.relationship_id}
                  >
                    {removingId === trainee.relationship_id ? '⏳' : '🗑️'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Trainee Modal */}
      <AddTraineeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
