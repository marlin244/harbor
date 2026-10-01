/**
 * Admin page: resource management (add/edit/delete rooms and assets)
 * Kept on a separate route from the booking app so regular booking flows
 * never expose management controls.
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResourceForm } from '@/components/ResourceForm';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { Asset, Room } from '@/types';

export default function Admin() {
  const { rooms, assets, addRoom, updateRoom, deleteRoom, addAsset, updateAsset, deleteAsset } = useApp();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);

  const handleDeleteRoom = (roomId: string) => {
    if (confirm(t('deleteRoomConfirm'))) {
      deleteRoom(roomId);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm(t('deleteAssetConfirm'))) {
      deleteAsset(assetId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto py-8">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Назад к бронированию
            </Link>
          </div>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-2">
            Административная панель
          </span>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t('manageResources')}</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">{t('rooms')}</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingRoom(null);
                setShowRoomForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addRoomButton')}
            </Button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('noRoomsFound')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <CardDescription>{t('capacity')}: {room.capacity} {t('people')}</CardDescription>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRoom(room);
                            setShowRoomForm(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {room.category && <Badge variant="outline">{room.category}</Badge>}
                      {room.location && <Badge variant="outline">{room.location}</Badge>}
                      {room.requiresApproval && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {t('requiresApproval')}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  {room.features.length > 0 && (
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {room.features.map((feature) => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">{t('assets')}</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingAsset(null);
                setShowAssetForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addAssetButton')}
            </Button>
          </div>

          {assets.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('noAssetsFound')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <CardDescription>{t('inventoryCode')}: {asset.inventoryCode}</CardDescription>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAsset(asset);
                            setShowAssetForm(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant={asset.status === 'available' ? 'default' : 'secondary'}>
                        {asset.status === 'available' ? t('available') : asset.status === 'unavailable' ? t('unavailable') : t('maintenance')}
                      </Badge>
                      {asset.category && <Badge variant="outline">{asset.category}</Badge>}
                      {asset.location && <Badge variant="outline">{asset.location}</Badge>}
                      {asset.requiresApproval && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {t('requiresApproval')}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRoom ? t('editRoom') : t('addRoomButton')}</DialogTitle>
          </DialogHeader>
          <ResourceForm
            resourceType="room"
            resource={editingRoom || undefined}
            onSubmit={(resource) => {
              if (editingRoom) {
                updateRoom(resource as Room);
              } else {
                addRoom(resource as Room);
              }
              setShowRoomForm(false);
              setEditingRoom(null);
            }}
            onCancel={() => {
              setShowRoomForm(false);
              setEditingRoom(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssetForm} onOpenChange={setShowAssetForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAsset ? t('editAsset') : t('addAssetButton')}</DialogTitle>
          </DialogHeader>
          <ResourceForm
            resourceType="asset"
            resource={editingAsset || undefined}
            onSubmit={(resource) => {
              if (editingAsset) {
                updateAsset(resource as Asset);
              } else {
                addAsset(resource as Asset);
              }
              setShowAssetForm(false);
              setEditingAsset(null);
            }}
            onCancel={() => {
              setShowAssetForm(false);
              setEditingAsset(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
