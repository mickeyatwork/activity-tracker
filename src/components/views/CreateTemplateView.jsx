import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { ConfirmModal } from '../common/ConfirmModal';

export function CreateTemplateView() {
  const { activeTemplateId, getTemplate, saveTemplate, deleteTemplate, navigate } = useApp();
  const isEditing = Boolean(activeTemplateId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metrics, setMetrics] = useState(() => [
    { id: 'initial-1', name: '', type: 'time', unit: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (activeTemplateId) {
      const t = getTemplate(activeTemplateId);
      if (t) {
        setName(t.name || '');
        setDescription(t.description || '');
        setMetrics(t.metrics && t.metrics.length > 0 ? t.metrics : [
          { id: 'initial-1', name: '', type: 'time', unit: '' }
        ]);
      }
    }
  }, [activeTemplateId, getTemplate]);

  const addMetric = () => {
    setMetrics(prev => [...prev, { id: `m_${Date.now()}`, name: '', type: 'time', unit: '' }]);
  };

  const updateMetric = (id, field, value) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMetric = (id) => {
    if (metrics.length === 1) return;
    setMetrics(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveBtn = async () => {
    if (!name.trim()) {
      alert("Please enter an event name.");
      return;
    }
    
    const validMetrics = metrics.filter(m => m.name.trim() !== '');
    if (validMetrics.length === 0) {
      alert("Please add at least one valid metric.");
      return;
    }

    setSaving(true);
    try {
      await saveTemplate({
        id: activeTemplateId || `t_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        icon: 'Activity',
        metrics: validMetrics
      });
      navigate('templates');
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save template: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      await deleteTemplate(activeTemplateId);
      setShowDeleteModal(false);
      navigate('templates');
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('Failed to delete template: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-12 animate-in slide-in-from-bottom-4 duration-300">
      <TopHeader 
        title={isEditing ? "Edit Template" : "New Event Template"} 
        showBack 
        onBack={() => navigate('templates')} 
      />
      
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {isEditing && (
          <div className="bg-blue-50 text-blue-800 text-sm p-3.5 rounded-xl flex items-start space-x-2.5 border border-blue-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-blue-500" />
            <p>Updating a template applies changes to future records. New metrics will show as <em>N/A</em> on old records until you add a value.</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Quadkids, Swimming Gala"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief details about the event"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-700">Metrics to Record</label>
          </div>
          
          <div className="space-y-3 mb-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-white border border-gray-200 shadow-xs rounded-xl p-3 relative">
                {metrics.length > 1 && (
                  <button 
                    onClick={() => removeMetric(metric.id)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 shadow-xs hover:bg-red-200 transition cursor-pointer"
                    aria-label="Remove metric"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={metric.name}
                    onChange={e => updateMetric(metric.id, 'name', e.target.value)}
                    placeholder="Metric Name (e.g., 75m Sprint)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  
                  <div className="flex space-x-2">
                    <select 
                      value={metric.type}
                      onChange={e => updateMetric(metric.id, 'type', e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="time">Time</option>
                      <option value="distance">Distance</option>
                      <option value="number">Count / Score</option>
                      <option value="rating">Rating (1-5)</option>
                    </select>
                    
                    <input 
                      type="text" 
                      value={metric.unit}
                      onChange={e => updateMetric(metric.id, 'unit', e.target.value)}
                      placeholder="Unit (sec, m)"
                      className="w-24 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addMetric}
            className="w-full border-2 border-dashed border-gray-300 text-gray-600 rounded-lg p-3 text-sm font-semibold flex justify-center items-center hover:bg-gray-50 transition cursor-pointer"
          >
            <Plus size={16} className="mr-1" /> Add Another Metric
          </button>
        </div>

        <div className="pt-4 space-y-3">
          <button 
            onClick={handleSaveBtn}
            disabled={saving}
            className="w-full bg-indigo-600 text-white rounded-xl p-4 font-bold text-lg hover:bg-indigo-700 transition shadow-md flex justify-center items-center disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="animate-spin" /> : (isEditing ? "Update Template" : "Save Template")}
          </button>
          
          {isEditing && (
            <button 
              onClick={() => setShowDeleteModal(true)}
              disabled={saving}
              className="w-full bg-white text-red-600 border border-red-200 rounded-xl p-4 font-bold text-base hover:bg-red-50 transition flex justify-center items-center disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={18} className="mr-2" /> Delete Template
            </button>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={showDeleteModal}
        loading={saving}
        title="Delete Event Template?"
        message="Are you sure you want to delete this template? Any past activity records created with this template will lose metric structure."
        confirmText="Delete Template"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
