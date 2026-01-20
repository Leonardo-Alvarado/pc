'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, RefreshCw, QrCode, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Book } from '@/lib/data';

const allBooks: Book[] = [];

export function QrLabelDialog() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    year: 'all',
    nameSearch: '',
    bookName: 'all',
    official: 'all',
    category: 'all',
    status: 'all',
    qrSize: 'medium',
    includeInfo: 'detailed',
  });

  const [results, setResults] = useState({
    selectedBooks: 0,
    estimatedPages: 0,
  });

  const availableYears = useMemo(
    () => [...new Set(allBooks.map((book) => book.year))].sort((a, b) => b - a),
    [allBooks]
  );

  const availableTomes = useMemo(
    () => [...new Set(allBooks.map((book) => book.tomo))].sort(),
    [allBooks]
  );
  
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  useEffect(() => {
    const filtered = allBooks.filter(book => {
        const searchLower = filters.nameSearch.toLowerCase();
        const matchesSearch =
            filters.nameSearch === '' ||
            book.id.toLowerCase().includes(searchLower) ||
            book.tomo.toLowerCase().includes(searchLower);

        const matchesStatus = filters.status === 'all' || book.status === filters.status;
        const matchesYear = filters.year === 'all' || String(book.year) === filters.year;
        const matchesTome = filters.bookName === 'all' || book.tomo === filters.bookName;

        return matchesSearch && matchesStatus && matchesYear && matchesTome;
    });

    const selectedBooks = filtered.length;
    const qrSizeConfig = {
      small: 24,
      medium: 12,
      large: 6
    };
    const qrSize = filters.qrSize as keyof typeof qrSizeConfig;
    const pages = Math.ceil(selectedBooks / qrSizeConfig[qrSize]);
    
    setResults({
      selectedBooks: selectedBooks,
      estimatedPages: pages
    });
  }, [filters]);

  const handleUpdatePreview = () => {
    toast({
        title: 'Vista Previa Actualizada',
        description: 'La vista previa ha sido actualizada con los filtros actuales.',
    });
  };

  const handleGenerateLabels = () => {
    if (results.selectedBooks === 0) {
        toast({
            variant: 'destructive',
            title: 'No hay libros seleccionados',
            description: 'Aplica filtros para seleccionar libros y generar etiquetas.',
        });
        return;
    }
    toast({
      title: 'Generando Etiquetas...',
      description: `Se están generando ${results.selectedBooks} etiquetas en ${results.estimatedPages} páginas.`,
    });
    // Add PDF generation logic here
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" /> Exportar Etiquetas QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Exportar Etiquetas QR en Lote
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
            <FileText className="h-4 w-4 text-blue-500" />
            <AlertTitle className="font-semibold text-blue-900">Configuración de Etiquetas</AlertTitle>
            <AlertDescription className="text-blue-800/90">
              Genera una hoja A4 con múltiples códigos QR listos para imprimir y recortar.
              Cada etiqueta incluye el QR y la información del libro debajo.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-year">Filtrar por Año</Label>
              <Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}>
                <SelectTrigger id="filter-year">
                  <SelectValue placeholder="Todos los años" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                   {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-name">Buscar por Nombre</Label>
              <Input 
                id="search-name" 
                placeholder="Buscar libro por nombre..." 
                value={filters.nameSearch}
                onChange={(e) => handleFilterChange('nameSearch', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-book-name">Filtrar por Nombre de Libro</Label>
               <Select value={filters.bookName} onValueChange={(v) => handleFilterChange('bookName', v)}>
                <SelectTrigger id="filter-book-name">
                  <SelectValue placeholder="Todos los nombres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los nombres</SelectItem>
                   {availableTomes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-official">Filtrar por Funcionario</Label>
              <Select value={filters.official} onValueChange={(v) => handleFilterChange('official', v)}>
                <SelectTrigger id="filter-official">
                  <SelectValue placeholder="Todos los funcionarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los funcionarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-category">Filtrar por Categoría/Tipo</Label>
              <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status">Filtrar por Estado</Label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                   <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Uso">En Uso</SelectItem>
                  <SelectItem value="Archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="qr-size">Tamaño de QR (px)</Label>
              <Select value={filters.qrSize} onValueChange={(v) => handleFilterChange('qrSize', v)}>
                <SelectTrigger id="qr-size">
                  <SelectValue placeholder="Mediano (150px) - 12 etiquetas"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeño (100px) - 24 etiquetas</SelectItem>
                  <SelectItem value="medium">Mediano (150px) - 12 etiquetas</SelectItem>
                  <SelectItem value="large">Grande (200px) - 6 etiquetas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="include-info">Incluir información</Label>
              <Select value={filters.includeInfo} onValueChange={(v) => handleFilterChange('includeInfo', v)}>
                <SelectTrigger id="include-info">
                  <SelectValue placeholder="Detallada (Año - Libro - Registros)"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detallada (Año - Libro - Registros)</SelectItem>
                  <SelectItem value="simple">Simple (Registro)</SelectItem>
                  <SelectItem value="none">Solo QR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p><span className="font-bold">Libros seleccionados:</span> {results.selectedBooks}</p>
            <p><span className="font-bold">Páginas estimadas:</span> {results.estimatedPages}</p>
          </div>
        </div>
        <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end sm:space-x-2">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black" onClick={handleUpdatePreview}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizar Vista Previa
          </Button>
          <Button type="submit" onClick={handleGenerateLabels}>
            <Sparkles className="mr-2 h-4 w-4" /> Generar Etiquetas
          </Button>
           <DialogClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
