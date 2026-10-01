/**
 * Data import/export component
 */

import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { AppData } from '@/types';
import { t } from '@/lib/i18n';
import { checkSelfIntersections, checkReferentialIntegrity, isValidISO8601 } from '@/lib/bookingUtils';

interface ImportPreview {
  rooms: { count: number; action: string }[];
  assets: { count: number; action: string }[];
  bookings: { count: number; action: string }[];
  errors: string[];
}

export function DataImportExport() {
  const { exportData, importData, rooms, assets, bookings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importPolicy, setImportPolicy] = useState<'replace' | 'merge'>('merge');
  const [importFile, setImportFile] = useState<AppData | null>(null);

  const handleExport = async () => {
    await exportData();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as AppData;

      // Validate data structure
      if (!data.rooms || !data.assets || !data.bookings) {
        toast.error(t('invalidFileFormat'));
        return;
      }

      // Validate bookings
      const errors: string[] = [];

      // Check self-intersections in imported data
      const selfConflicts = checkSelfIntersections(data.bookings);
      if (selfConflicts.length > 0) {
        errors.push(`${selfConflicts.length} self-intersecting bookings in import file`);
      }

      // Check referential integrity
      const roomIds = new Set(data.rooms.map((r) => r.id));
      const assetIds = new Set(data.assets.map((a) => a.id));
      const invalidRefs = checkReferentialIntegrity(data.bookings, roomIds, assetIds);
      if (invalidRefs.length > 0) {
        errors.push(`${invalidRefs.length} bookings with invalid resource references`);
      }

      // Check timestamp format
      for (const booking of data.bookings) {
        if (!isValidISO8601(booking.start) || !isValidISO8601(booking.end)) {
          errors.push(`Booking "${booking.title}" has invalid timestamp format`);
        }
      }

      // Generate preview
      const preview: ImportPreview = {
        rooms: [{ count: data.rooms.length, action: 'Import' }],
        assets: [{ count: data.assets.length, action: 'Import' }],
        bookings: [{ count: data.bookings.length, action: 'Import' }],
        errors,
      };

      setImportFile(data);
      setImportPreview(preview);
    } catch (error) {
      console.error('Failed to parse file:', error);
      toast.error(t('failedToParseJSON'));
    }
  };

  const handleImport = async () => {
    if (!importFile || !importPreview) return;

    if (importPreview.errors.length > 0) {
      toast.error(t('cannotImportWithErrors'));
      return;
    }

    try {
      await importData(importFile, importPolicy);
      setImportFile(null);
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to import:', error);
      toast.error(t('failedToImportData'));
    }
  };

  const handleCancel = () => {
    setImportFile(null);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">{t('export')}</TabsTrigger>
          <TabsTrigger value="import">{t('import')}</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>{t('exportData')}</CardTitle>
              <CardDescription>
                {t('exportDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">{t('currentDataSummary')}</p>
                <ul className="text-sm space-y-1">
                  <li>• Rooms: {rooms.length}</li>
                  <li>• Assets: {assets.length}</li>
                  <li>• Bookings: {bookings.length}</li>
                </ul>
              </div>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {t('exportAsJSON')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>{t('importData')}</CardTitle>
              <CardDescription>
                {t('importDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!importPreview ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('selectJSONFile')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="bg-accent p-4 rounded-xl">
                      <p className="text-sm font-medium text-accent-foreground mb-2">{t('importPreview')}</p>
                      <ul className="text-sm text-accent-foreground/80 space-y-1">
                        <li>• Rooms: {importPreview.rooms[0].count}</li>
                        <li>• Assets: {importPreview.assets[0].count}</li>
                        <li>• Bookings: {importPreview.bookings[0].count}</li>
                      </ul>
                    </div>

                    {importPreview.errors.length > 0 && (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <p className="font-medium text-rose-900">{t('validationErrors')}</p>
                        </div>
                        <ul className="text-sm text-rose-800 space-y-1">
                          {importPreview.errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importPreview.errors.length === 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm text-emerald-800">{t('fileValidationPassed')}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium">{t('importPolicy')}</label>
                      <div className="space-y-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="policy"
                            value="merge"
                            checked={importPolicy === 'merge'}
                            onChange={(e) => setImportPolicy(e.target.value as 'merge' | 'replace')}
                          />
                          <span className="text-sm">{t('mergePolicy')}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="policy"
                            value="replace"
                            checked={importPolicy === 'replace'}
                            onChange={(e) => setImportPolicy(e.target.value as 'merge' | 'replace')}
                          />
                          <span className="text-sm">{t('replaceAllPolicy')}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={importPreview.errors.length > 0}
                      className="flex-1"
                    >
                      Import Data
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
