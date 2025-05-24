import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CustomStatus } from '../../types/task.type';
import { X } from 'lucide-react';

const colorOptions = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

interface CustomStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<boolean>;
  editingStatus?: CustomStatus;
  title?: string;
}

const CustomStatusDialog = ({
  isOpen,
  onClose,
  onSave,
  editingStatus,
  title = 'Create Custom Status',
}: CustomStatusDialogProps) => {
  const [name, setName] = useState(editingStatus?.name || '');
  const [color, setColor] = useState(editingStatus?.color || colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Status name is required');
      inputRef.current?.focus();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await onSave(name.trim(), color);
      
      if (success) {
        onClose();
        setName('');
        setColor(colorOptions[0]);
      } else {
        setError('Failed to save custom status');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status-name">Status Name</Label>
            <Input
              id="status-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., In Testing, Blocked, Ready for QA"
              className="col-span-3"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-6 h-6 rounded-full ${
                    color === colorOption ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-2">
            <Label>Preview</Label>
            <div className="mt-1 p-2 border rounded-md">
              <div
                className="text-sm font-medium px-2 py-1 rounded-md text-white w-fit"
                style={{ backgroundColor: color }}
              >
                {name || 'Status Name'}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center"
          >
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : editingStatus ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomStatusDialog;