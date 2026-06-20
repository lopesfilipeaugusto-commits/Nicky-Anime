import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';

function SelectListModal({ isOpen, lists, onSelect, onCancel, animeTitle, onCreateList }) {
  const [selectedListId, setSelectedListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedListId(null);
      setNewListName('');
      setCreateError('');
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedListId === null) return;
    const selectedList = lists.find((list) => list.id === selectedListId);
    if (selectedList) {
      onSelect(selectedList);
    }
  };

  const handleCreateAndSelect = () => {
    const result = onCreateList?.(newListName);

    if (!result?.ok) {
      if (result?.reason === 'duplicate_name') {
        setCreateError('Ja existe uma lista com esse nome.');
        return;
      }
      setCreateError('Escreve um nome valido para a nova lista.');
      return;
    }

    onSelect(result.list);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar a Lista</DialogTitle>
          <DialogDescription>
            Seleciona uma lista para adicionar &quot;{animeTitle}&quot;:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="text"
            value={newListName}
            onChange={(e) => {
              setNewListName(e.target.value);
              if (createError) setCreateError('');
            }}
            placeholder="Dar nome a uma nova lista"
          />
          <Button type="button" variant="outline" onClick={handleCreateAndSelect} className="w-full">
            Criar lista
          </Button>
          {createError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {createError}
            </p>
          )}
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => setSelectedListId(list.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                selectedListId === list.id
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-card hover:bg-accent/5'
              )}
            >
              <input
                type="radio"
                name="list"
                value={list.id}
                checked={selectedListId === list.id}
                onChange={() => setSelectedListId(list.id)}
                className="cursor-pointer"
                readOnly
              />
              <span className="text-sm">
                {list.name} ({list.items.length} anime{list.items.length !== 1 ? 's' : ''})
              </span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSelect} disabled={selectedListId === null} className="flex-1">
            Adicionar
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SelectListModal;
