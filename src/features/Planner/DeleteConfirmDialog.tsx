import React from 'react';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Props {
    deleteConfirm: any;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const DeleteConfirmDialog = ({ deleteConfirm, onOpenChange, onConfirm }: Props) => (
  <AlertDialog open={!!deleteConfirm} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-2 shadow-glow max-w-[400px]">
          <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-fredoka font-bold flex items-center gap-3"><Trash2 className="w-6 h-6 text-destructive" /> Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium">{deleteConfirm?.type === 'plan' ? "Are you sure you want to delete this entire plan? This action cannot be undone." : "Are you sure you want to remove this piece from your flow?"}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
              <AlertDialogCancel className="rounded-xl font-bold h-12">Cancel</AlertDialogCancel>
              <AlertDialogAction className="rounded-xl font-bold h-12 bg-destructive hover:bg-destructive/90 shadow-glow-red" onClick={onConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
  </AlertDialog>
);
