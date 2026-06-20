import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import BrandLogo from './BrandLogo';
import { Button } from './ui/button';
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
      <DialogContent className="max-w-md gap-5 border-border/80 bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <div className="flex justify-center pb-1">
            <BrandLogo size="sm" iconOnly />
          </div>
          <DialogTitle>Adicionar a lista</DialogTitle>
          <DialogDescription>
            Escolhe uma lista para &quot;{animeTitle}&quot; ou cria uma nova.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">Criar nova lista</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newListName}
              onChange={(event) => {
                setNewListName(event.target.value);
                if (createError) setCreateError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleCreateAndSelect();
              }}
              placeholder="Nome da lista"
              className="flex-1 rounded-xl border border-border bg-background/80 px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <Button type="button" onClick={handleCreateAndSelect} className="sm:min-w-[130px]">
              <PlusIcon className="mr-1 h-4 w-4" />
              Criar
            </Button>
          </div>
          {createError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {createError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Listas existentes</p>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border/70 p-2">
            {lists.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Ainda nao tens listas. Cria uma acima.
              </p>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListId(list.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                    selectedListId === list.id
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-card hover:border-accent/40 hover:bg-accent/5'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      selectedListId === list.id ? 'border-accent bg-accent' : 'border-border'
                    )}
                  >
                    {selectedListId === list.id && (
                      <span className="h-2 w-2 rounded-full bg-accent-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{list.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {list.items.length} anime{list.items.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-stretch">
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
