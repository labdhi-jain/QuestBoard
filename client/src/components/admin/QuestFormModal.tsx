import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Quest, QuestCategory, VerificationType, QuestStatus } from '../../types/api';

export interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Quest>) => Promise<void>;
  questToEdit?: Quest | null;
  availablePrereqs?: Quest[];
}

export const QuestFormModal: React.FC<QuestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  questToEdit,
  availablePrereqs = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [pointValue, setPointValue] = useState<number>(20);
  const [category, setCategory] = useState<QuestCategory>('EXPLORE');
  const [verificationType, setVerificationType] = useState<VerificationType>('QR');
  const [status, setStatus] = useState<QuestStatus>('DRAFT');
  const [prerequisiteQuestId, setPrerequisiteQuestId] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questToEdit) {
      setTitle(questToEdit.title);
      setDescription(questToEdit.description);
      setLocationHint(questToEdit.locationHint);
      setPointValue(questToEdit.pointValue);
      setCategory(questToEdit.category);
      setVerificationType(questToEdit.verificationType);
      setStatus(questToEdit.status);
      setPrerequisiteQuestId(questToEdit.prerequisiteQuestId || '');
    } else {
      setTitle('');
      setDescription('');
      setLocationHint('');
      setPointValue(20);
      setCategory('EXPLORE');
      setVerificationType('QR');
      setStatus('DRAFT');
      setPrerequisiteQuestId('');
    }
    setError(null);
  }, [questToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Business validation (US-08)
    if (status === 'PUBLISHED') {
      if (!title.trim()) {
        setError('A published quest must have a valid title.');
        return;
      }
      if (pointValue <= 0) {
        setError('A published quest must award at least 1 point.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        locationHint: locationHint.trim(),
        pointValue: Number(pointValue),
        category,
        verificationType,
        status,
        prerequisiteQuestId: prerequisiteQuestId || null,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save quest';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={questToEdit ? 'Edit Quest' : 'Create New Quest'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-pink-light/30 border-2 border-pink text-ink text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <Input
          label="Quest Title *"
          placeholder="e.g. Find the Silent Floor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="space-y-1.5 text-left">
          <label className="block font-heading font-bold text-sm text-ink">
            Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should the student do?"
            className="w-full bg-white border-2.5 border-ink rounded-xl px-4 py-2.5 font-body text-ink text-sm outline-none shadow-hard-sm focus:shadow-hard"
            required
          />
        </div>

        <Input
          label="Location Hint *"
          placeholder="e.g. Library, 4th Floor North Wing"
          value={locationHint}
          onChange={(e) => setLocationHint(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Point Value *"
            type="number"
            min={1}
            max={500}
            value={pointValue}
            onChange={(e) => setPointValue(parseInt(e.target.value, 10) || 0)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block font-heading font-bold text-sm text-ink">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestCategory)}
              className="w-full bg-white border-2.5 border-ink rounded-xl px-3.5 py-2.5 font-heading font-bold text-ink text-sm outline-none shadow-hard-sm"
            >
              <option value="EXPLORE">🗺️ Explore</option>
              <option value="ACADEMICS">📚 Academics</option>
              <option value="SOCIAL">🎉 Social</option>
              <option value="WELLNESS">🌿 Wellness</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block font-heading font-bold text-sm text-ink">
              Verification Method
            </label>
            <select
              value={verificationType}
              onChange={(e) => setVerificationType(e.target.value as VerificationType)}
              className="w-full bg-white border-2.5 border-ink rounded-xl px-3.5 py-2.5 font-heading font-bold text-ink text-sm outline-none shadow-hard-sm"
            >
              <option value="QR">📱 QR Code Scan</option>
              <option value="MANUAL">🤝 Manual Admin Verification</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block font-heading font-bold text-sm text-ink">
              Publish Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuestStatus)}
              className="w-full bg-white border-2.5 border-ink rounded-xl px-3.5 py-2.5 font-heading font-bold text-ink text-sm outline-none shadow-hard-sm"
            >
              <option value="DRAFT">📝 Draft (Hidden from students)</option>
              <option value="PUBLISHED">🚀 Published (Active on board)</option>
              <option value="ARCHIVED">📦 Archived</option>
            </select>
          </div>
        </div>

        {/* Optional Prerequisite Quest */}
        <div className="space-y-1.5 text-left">
          <label className="block font-heading font-bold text-sm text-ink">
            Prerequisite Quest (Optional)
          </label>
          <select
            value={prerequisiteQuestId}
            onChange={(e) => setPrerequisiteQuestId(e.target.value)}
            className="w-full bg-white border-2.5 border-ink rounded-xl px-3.5 py-2.5 font-body text-ink text-sm outline-none shadow-hard-sm"
          >
            <option value="">None (Available immediately)</option>
            {availablePrereqs
              .filter((q) => !questToEdit || q.id !== questToEdit.id)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  Requires: {q.title} ({q.pointValue} pts)
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-500">
            If chosen, students will see this quest as LOCKED until they complete the prerequisite.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
          <Button type="button" variant="white" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="violet" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : questToEdit ? 'Save Changes' : 'Create Quest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
