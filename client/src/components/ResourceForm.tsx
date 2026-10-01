/**
 * Create/edit form for a Room or an Asset, shared between both resource types
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { t } from '@/lib/i18n';
import type { Asset, Room } from '@/types';

interface ResourceFormProps {
  resourceType: 'room' | 'asset';
  resource?: Room | Asset;
  onSubmit: (resource: Room | Asset) => void;
  onCancel: () => void;
}

export function ResourceForm({ resourceType, resource, onSubmit, onCancel }: ResourceFormProps) {
  const room = resourceType === 'room' ? (resource as Room | undefined) : undefined;
  const asset = resourceType === 'asset' ? (resource as Asset | undefined) : undefined;

  const [name, setName] = useState(resource?.name || '');
  const [capacity, setCapacity] = useState(room?.capacity ? String(room.capacity) : '');
  const [features, setFeatures] = useState(room?.features?.join(', ') || '');
  const [inventoryCode, setInventoryCode] = useState(asset?.inventoryCode || '');
  const [status, setStatus] = useState<Asset['status']>(asset?.status || 'available');
  const [category, setCategory] = useState(resource?.category || '');
  const [location, setLocation] = useState(resource?.location || '');
  const [requiresApproval, setRequiresApproval] = useState(resource?.requiresApproval || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (resourceType === 'room') {
      const newRoom: Room = {
        id: resource?.id || `room-${Date.now()}`,
        name,
        capacity: parseInt(capacity, 10) || 0,
        features: features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        category: category || undefined,
        location: location || undefined,
        requiresApproval,
      };
      onSubmit(newRoom);
    } else {
      const newAsset: Asset = {
        id: resource?.id || `asset-${Date.now()}`,
        name,
        inventoryCode,
        status,
        category: category || undefined,
        location: location || undefined,
        requiresApproval,
      };
      onSubmit(newAsset);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="resource-name">{t('title')}</Label>
        <Input id="resource-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      {resourceType === 'room' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="resource-capacity">{t('capacity')}</Label>
            <Input
              id="resource-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="resource-features">{t('features')}</Label>
            <Input
              id="resource-features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="projector, whiteboard"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="resource-inventory-code">{t('inventoryCode')}</Label>
            <Input
              id="resource-inventory-code"
              value={inventoryCode}
              onChange={(e) => setInventoryCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="resource-status">{t('status')}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Asset['status'])}>
              <SelectTrigger id="resource-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">{t('available')}</SelectItem>
                <SelectItem value="unavailable">{t('unavailable')}</SelectItem>
                <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="resource-category">{t('category')}</Label>
          <Input id="resource-category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="resource-location">{t('location')}</Label>
          <Input id="resource-location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="resource-requires-approval"
          checked={requiresApproval}
          onCheckedChange={(checked) => setRequiresApproval(checked === true)}
        />
        <Label htmlFor="resource-requires-approval" className="font-normal">
          {t('requiresApproval')}
        </Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">{resource ? t('save') : t('create')}</Button>
      </div>
    </form>
  );
}
