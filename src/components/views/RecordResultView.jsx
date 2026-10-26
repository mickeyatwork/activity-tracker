import React, { useState, useEffect, useRef } from 'react';
import { Trophy, CheckCircle2, Trash2, Loader2, Save, BookmarkCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { ConfirmModal } from '../common/ConfirmModal';
import { DatePickerUK } from '../common/DatePickerUK';
import { formatDateUK } from '../../utils/date';

export function RecordResultView() {
  const { 
    activeResultId, 
    results, 
    children, 
    templates, 
    saveResult, 
    deleteResult, 
    navigate 
  } = useApp();

  const isEditing = Boolean(activeResultId);

  const [recordId, setRecordId] = useState(() => activeResultId || `r_${Date.now()}`);
  const [selectedChild, setSelectedChild] = useState(() => (children.length === 1 ? children[0].id : ''));
  const [selectedTemplate, setSelectedTemplate] = useState(() => (templates.length === 1 ? templates[0].id : ''));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [metricValues, setMetricValues] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasInitialized = useRef(false);

  // Initialize form state ONLY when activeResultId changes or on first mount
  // (Prevents database mutations from wiping out user input while typing!)
  useEffect(() => {
    if (activeResultId) {
      const result = results.find(r => r.id === activeResultId);
      if (result) {
        setRecordId(result.id);
        setSelectedChild(result.childId || result.child_id || '');
        setSelectedTemplate(result.templateId || result.template_id || '');
        setDate(result.date || new Date().toISOString().split('T')[0]);
        setNotes(result.notes || '');
        setMetricValues(result.values || {});
      }
    } else if (!hasInitialized.current) {
      hasInitialized.current = true;
      setSelectedChild(children.length === 1 ? children[0].id : '');
      setSelectedTemplate(templates.length === 1 ? templates[0].id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setMetricValues({});
    }
  }, [activeResultId]); // Intentionally only depend on activeResultId

  // Gently fill in single defaults without wiping user inputs
  useEffect(() => {
    if (!selectedTemplate && templates.length === 1) {
      setSelectedTemplate(templates[0].id);
    }
    if (!selectedChild && children.length === 1) {
      setSelectedChild(children[0].id);
    }
  }, [templates, children, selectedTemplate, selectedChild]);

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    setMetricValues({});
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplate);

  // Save Progress: Saves as in_progress and KEEPS USER ON THE PAGE
  const handleSaveProgress = async () => {
    if (!selectedChild || !selectedTemplate) {
      alert("Please select a person and an event template first.");
      return;
    }

    setSaving(true);
    setSaveMessage('');
    try {
      const saved = await saveResult({
        id: recordId,
        childId: selectedChild,
        templateId: selectedTemplate,
        date,
        notes,
        values: metricValues,
        status: 'in_progress'
      });
      if (saved?.id) {
        setRecordId(saved.id);
      }
      setSaveMessage('Progress saved! You can continue entering values.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save progress:', err);
      alert('Error saving progress: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save & Complete: Saves as completed and RETURNS TO DASHBOARD
  const handleSaveAndComplete = async () => {
    if (!selectedChild || !selectedTemplate) {
      alert("Please select a person and an event template.");
      return;
    }

    setSaving(true);
    try {
      await saveResult({
        id: recordId,
        childId: selectedChild,
        templateId: selectedTemplate,
        date,
        notes,
        values: metricValues,
        status: 'completed'
      });
      navigate('dashboard');
    } catch (err) {
      console.error('Failed to complete activity:', err);
      alert('Error completing activity: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      await deleteResult(recordId);
      setShowDeleteModal(false);
      navigate('dashboard');
    } catch (err) {
      console.error('Failed to delete result:', err);
      alert('Failed to delete record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (children.length === 0 || templates.length === 0) {
    return (
      <div className="pb-12 flex flex-col items-center justify-center p-8 min-h-[80vh] text-center text-gray-500 max-w-md mx-auto">
        <Trophy className="mb-4 text-gray-300" size={56} />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Setup Required</h2>
        <p className="mb-6 text-sm text-gray-500">
          You need to add at least one person and one event template before you can record an activity.
        </p>
        <div className="flex flex-col w-full space-y-2">
          {children.length === 0 && (
            <button 
              onClick={() => navigate('dashboard')}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition"
            >
              Add a Person First
            </button>
          )}
          {templates.length === 0 && (
            <button 
              onClick={() => navigate('templates')}
              className="w-full bg-indigo-50 text-indigo-700 rounded-xl py-3 font-semibold text-sm hover:bg-indigo-100 transition"
            >
              Configure Event Templates
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <TopHeader 
        title={isEditing ? "Edit Activity" : "Log Activity"} 
        showBack={true}
        onBack={() => navigate('dashboard')}
      />
      
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        <div className="space-y-4">
          {/* Person Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Who participated?</label>
            <div className="grid grid-cols-2 gap-3">
              {children.map(child => (
                <button
                  type="button"
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-3 rounded-xl border-2 flex items-center space-x-2 transition-all cursor-pointer ${
                    selectedChild === child.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-xs' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${child.color} text-white shrink-0`}>
                    {child.avatar}
                  </div>
                  <span className="font-semibold truncate">{child.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What event was it?</label>
            <select 
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {templates.length !== 1 && (
                <option value="" disabled>Select an event type...</option>
              )}
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <DatePickerUK 
              value={date}
              onChange={setDate}
            />
          </div>
        </div>

        {/* Dynamic Metrics Form */}
        {activeTemplate && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-xs animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-indigo-900 flex items-center">
                <Trophy size={18} className="mr-2" />
                Record Results
              </h3>
              <div className="flex items-center space-x-2">
                {saveMessage && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center animate-in fade-in">
                    <CheckCircle2 size={12} className="mr-1 text-emerald-600" /> Saved
                  </span>
                )}
                <button 
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={saving || !selectedChild || !selectedTemplate}
                  className="bg-white hover:bg-indigo-100/70 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center shadow-2xs transition cursor-pointer disabled:opacity-40"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <><Save size={13} className="mr-1" /> Save</>}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeTemplate.metrics && activeTemplate.metrics.map(metric => (
                <div key={metric.id}>
                  <label className="block text-sm font-medium text-indigo-800 mb-1 flex justify-between">
                    <span>{metric.name}</span>
                    {metric.unit && <span className="text-indigo-400 text-xs font-normal">{metric.unit}</span>}
                  </label>
                  <input 
                    type={metric.type === 'number' || metric.type === 'distance' ? 'number' : 'text'}
                    step="any"
                    placeholder={`Enter ${metric.type}...`}
                    value={metricValues[metric.id] || ''}
                    onChange={e => setMetricValues({...metricValues, [metric.id]: e.target.value})}
                    className="w-full bg-white border border-indigo-200 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes & Highlights</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g., Felt really confident today! Pushed through the rain."
            rows={3}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          {saveMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center shadow-xs animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 mr-2 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button 
              type="button"
              onClick={handleSaveProgress}
              disabled={saving || !selectedChild || !selectedTemplate}
              className={`w-1/2 flex items-center justify-center rounded-xl p-4 font-bold text-sm transition shadow-xs border border-indigo-200 cursor-pointer ${
                selectedChild && selectedTemplate 
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-98' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50 border-gray-200'
              }`}
            >
              {saving ? <Loader2 className="animate-spin" /> : <><BookmarkCheck size={16} className="mr-1.5" /> Save Progress</>}
            </button>

            <button 
              type="button"
              onClick={handleSaveAndComplete}
              disabled={saving || !selectedChild || !selectedTemplate}
              className={`w-1/2 flex items-center justify-center text-white rounded-xl p-4 font-bold text-sm transition shadow-md cursor-pointer ${
                selectedChild && selectedTemplate 
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98' 
                  : 'bg-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={16} className="mr-1.5" /> Save & Complete</>}
            </button>
          </div>

          {isEditing && (
            <button 
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={saving}
              className="w-full bg-white text-rose-600 border border-rose-200 rounded-xl p-3.5 font-bold text-sm hover:bg-rose-50 transition flex justify-center items-center disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={16} className="mr-2" /> Delete Record
            </button>
          )}
        </div>
      </div>

      {/* Delete Record Custom Modal */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        loading={saving}
        title="Delete Activity Record?"
        message="Are you sure you want to permanently delete this activity record? This cannot be undone."
        confirmText="Delete Record"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
