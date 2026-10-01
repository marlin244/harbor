/**
 * Resource catalog with search and filters (browsing/booking view for end users)
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Package } from 'lucide-react';
import { t } from '@/lib/i18n';

interface ResourceCatalogProps {
  onSelectRoom?: (roomId: string) => void;
  onSelectAsset?: (assetId: string) => void;
}

export function ResourceCatalog({ onSelectRoom, onSelectAsset }: ResourceCatalogProps) {
  const { rooms, assets } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set([...rooms, ...assets].map((r) => r.category).filter(Boolean))) as string[],
    [rooms, assets]
  );
  const locations = useMemo(
    () => Array.from(new Set([...rooms, ...assets].map((r) => r.location).filter(Boolean))) as string[],
    [rooms, assets]
  );

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCapacity = capacityFilter === null || room.capacity >= capacityFilter;
      const matchesCategory = categoryFilter === null || room.category === categoryFilter;
      const matchesLocation = locationFilter === null || room.location === locationFilter;
      return matchesSearch && matchesCapacity && matchesCategory && matchesLocation;
    });
  }, [rooms, searchQuery, capacityFilter, categoryFilter, locationFilter]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === null || asset.category === categoryFilter;
      const matchesLocation = locationFilter === null || asset.location === locationFilter;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [assets, searchQuery, categoryFilter, locationFilter]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rooms">{t('rooms')} ({filteredRooms.length})</TabsTrigger>
          <TabsTrigger value="assets">{t('assets')} ({filteredAssets.length})</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap gap-2 mt-4">
          <select
            value={capacityFilter || ''}
            onChange={(e) => setCapacityFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-input rounded-xl bg-card text-sm"
          >
            <option value="">{t('allCapacities')}</option>
            <option value="10">10+</option>
            <option value="20">20+</option>
            <option value="30">30+</option>
          </select>
          {categories.length > 0 && (
            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="px-3 py-2 border border-input rounded-xl bg-card text-sm"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          {locations.length > 0 && (
            <select
              value={locationFilter || ''}
              onChange={(e) => setLocationFilter(e.target.value || null)}
              className="px-3 py-2 border border-input rounded-xl bg-card text-sm"
            >
              <option value="">{t('allLocations')}</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          )}
          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchResources')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="rooms" className="space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noRoomsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="hover:border-primary/50 hover:shadow-sm transition">
                  <CardHeader>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>{t('capacity')}: {room.capacity} {t('people')}</CardDescription>
                    {(room.category || room.location) && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {room.category && <Badge variant="outline">{room.category}</Badge>}
                        {room.location && <Badge variant="outline">{room.location}</Badge>}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {room.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {room.features.map((feature) => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {onSelectRoom && (
                      <Button
                        size="sm"
                        onClick={() => onSelectRoom(room.id)}
                        className="w-full"
                      >
                        {t('bookRoom')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('noAssetsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="hover:border-primary/50 hover:shadow-sm transition">
                  <CardHeader>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>{t('inventoryCode')}: {asset.inventoryCode}</CardDescription>
                    {(asset.category || asset.location) && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {asset.category && <Badge variant="outline">{asset.category}</Badge>}
                        {asset.location && <Badge variant="outline">{asset.location}</Badge>}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <Badge
                        variant={asset.status === 'available' ? 'default' : 'secondary'}
                      >
                        {asset.status === 'available' ? t('available') : asset.status === 'unavailable' ? t('unavailable') : t('maintenance')}
                      </Badge>
                    </div>
                    {onSelectAsset && (
                      <Button
                        size="sm"
                        onClick={() => onSelectAsset(asset.id)}
                        className="w-full"
                      >
                        {t('bookAsset')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
