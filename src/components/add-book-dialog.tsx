'use client';

import { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Search, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Book } from '@/lib/data';

type FormData = {
  year: string;
  tomeName: string;
  tomeNumber: string;
  regFrom: string;
  noRegFrom: boolean;
  regTo: string;
  noRegTo: boolean;
  status: string;
  observations: string;
};

const initialFormData: FormData = {
  year: '',
  tomeName: '',
  tomeNumber: '',
  regFrom: '',
  noRegFrom: false,
  regTo: '',
  noRegTo: false,
  status: 'Disponible',
  observations: '',
};

export function AddBookDialog({ onBookAdded }: { onBookAdded: (newBook: Book) => void }) {
  const { toast } = useToast();
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const isFormValid = useMemo(() => {
    return formData.year.trim() !== '' && formData.tomeName.trim() !== '';
  }, [formData.year, formData.tomeName]);

  const handleFieldChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleCheckboxChange = (
    field: keyof FormData,
    inputField: keyof FormData,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
      [inputField]: checked ? 's/n' : '',
    }));
  };

  const handleSave = () => {
    if (!isFormValid) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos requeridos',
        description:
          'Por favor, completa los campos de Año y Nombre del Tomo.',
      });
      return;
    }
    
    const newBook: Book = {
      id: `REG-${Date.now().toString().slice(-5)}`,
      tomo: formData.tomeName,
      year: parseInt(formData.year.split('-')[0].trim(), 10) || new Date().getFullYear(),
      entryDate: new Date().toISOString().split('T')[0],
      status: formData.status as Book['status'],
    };

    onBookAdded(newBook);
    
    toast({
      title: 'Libro Guardado',
      description: 'El nuevo libro ha sido agregado exitosamente.',
    });
    setFormData(initialFormData);
    setIsMainDialogOpen(false);
  };

  const handlePreview = async () => {
    if (!isFormValid) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos',
        description: 'Por favor, completa los campos requeridos (Año y Nombre del Tomo).',
      });
      return;
    }

    const bookData = {
      id: `REG-${Date.now().toString().slice(-5)}`,
      year: formData.year,
      tome: formData.tomeName,
      tomeNumber: formData.tomeNumber,
      register: `${formData.regFrom} - ${formData.regTo}`,
    };

    try {
      const jsonString = JSON.stringify(bookData);
      const dataUrl = await QRCode.toDataURL(jsonString, {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.9,
        margin: 1,
      });
      setQrCodeDataUrl(dataUrl);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error al generar QR',
        description: 'No se pudo generar el código QR. Inténtalo de nuevo.',
      });
    }
  };
  
  const handleCancel = () => {
    setFormData(initialFormData);
    setIsMainDialogOpen(false);
  }

  return (
    <>
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Libro
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Libro de Registro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="year-range" className="font-semibold">
                Año (puede ser rango: ej. "1920 - 1925") <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year-range"
                placeholder="Ej: 1920 o 1920 - 1925"
                className="mt-1"
                value={formData.year}
                onChange={(e) => handleFieldChange('year', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tome-name" className="font-semibold">
                  Nombre del Tomo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tome-name"
                  placeholder="Ej: Tomo I, Tomo A, etc."
                  className="mt-1"
                  value={formData.tomeName}
                  onChange={(e) => handleFieldChange('tomeName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tome-number" className="font-semibold">
                  Número de Tomo (opcional)
                </Label>
                <Input
                  id="tome-number"
                  placeholder="Ej: 1, 2, 3..."
                  className="mt-1"
                  value={formData.tomeNumber}
                  onChange={(e) => handleFieldChange('tomeNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-from" className="font-semibold">
                  Registro Desde
                </Label>
                <Input
                  id="reg-from"
                  placeholder="Ej: 1 o s/n"
                  className="mt-1"
                  value={formData.regFrom}
                  onChange={(e) => handleFieldChange('regFrom', e.target.value)}
                  disabled={formData.noRegFrom}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="no-reg-from"
                    checked={formData.noRegFrom}
                    onCheckedChange={(checked) => handleCheckboxChange('noRegFrom', 'regFrom', !!checked)}
                  />
                  <Label
                    htmlFor="no-reg-from"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    Sin número (s/n)
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="reg-to" className="font-semibold">
                  Registro Hasta
                </Label>
                <Input
                  id="reg-to"
                  placeholder="Ej: 100 o s/n"
                  className="mt-1"
                  value={formData.regTo}
                  onChange={(e) => handleFieldChange('regTo', e.target.value)}
                  disabled={formData.noRegTo}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="no-reg-to"
                    checked={formData.noRegTo}
                    onCheckedChange={(checked) => handleCheckboxChange('noRegTo', 'regTo', !!checked)}
                  />
                  <Label
                    htmlFor="no-reg-to"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    Sin número (s/n)
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="font-semibold">
                Estado
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Uso">En Uso</SelectItem>
                  <SelectItem value="Archivado">En archivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observations" className="font-semibold">
                Observaciones
              </Label>
              <Textarea
                id="observations"
                placeholder="Observaciones adicionales..."
                className="mt-1"
                value={formData.observations}
                onChange={(e) => handleFieldChange('observations', e.target.value)}
              />
            </div>
             <p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> Campos requeridos para generar QR y guardar.</p>
          </div>
          <DialogFooter className="flex-wrap gap-2 sm:justify-end">
            <Button
              onClick={handlePreview}
              disabled={!isFormValid}
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              <Search className="mr-2 h-4 w-4" /> Vista Previa QR
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid}>
              <Save className="mr-2 h-4 w-4" /> Guardar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vista Previa del Código QR</DialogTitle>
            <DialogDescription>
              Este es el código QR que se generará para el libro. Escanéalo con
              tu dispositivo para verificar la información.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Código QR generado"
                className="w-64 h-64 rounded-md border"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-md flex items-center justify-center">
                <p>Generando QR...</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md w-full">
              <p className="font-bold mb-1">Datos Codificados:</p>
              <pre className="whitespace-pre-wrap break-all text-left font-mono">
                {JSON.stringify({
                  id: 'REG-xxxx',
                  year: formData.year,
                  tome: formData.tomeName,
                  tomeNumber: formData.tomeNumber,
                  register: `${formData.regFrom} - ${formData.regTo}`,
                }, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
