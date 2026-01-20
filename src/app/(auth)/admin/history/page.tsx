'use client';

import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { Download, Search, FileWarning, FileText, FileSpreadsheet, Calendar as CalendarIcon, RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type MovementHistory } from '@/lib/data';
import { getMovementHistory } from './actions';


interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function HistoryPage() {
  const [history, setHistory] = useState<MovementHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [filters, setFilters] = useState<{
    query: string;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    action: string;
  }>({
    query: '',
    dateFrom: undefined,
    dateTo: undefined,
    action: 'all'
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const data = await getMovementHistory(filters);
    setHistory(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportPdf = () => {
    if (history.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay datos para exportar',
        description: 'No hay movimientos en el historial para exportar con los filtros aplicados.',
      });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text('Historial de Movimientos', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Exportado el: ${new Date().toLocaleDateString()}`, 14, 29);

    const tableColumn = [
      'Fecha/Hora',
      'Libro',
      'Usuario',
      'Estado Anterior',
      'Estado Nuevo',
      'Acción',
      'Persona',
      'Observaciones',
    ];
    const tableRows = history.map((item) => [
      item.dateTime,
      item.book,
      item.user,
      item.previousState,
      item.newState,
      item.action,
      item.person,
      item.observations,
    ]);

    doc.autoTable({
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [108, 92, 231],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      bodyStyles: {
        halign: 'center',
      },
    });

    doc.save(`historial-movimientos_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El historial se ha descargado como un archivo PDF.',
    });
    setIsExportDialogOpen(false);
  };

  const handleExportExcel = () => {
    if (history.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay datos para exportar',
        description: 'No hay movimientos en el historial para exportar con los filtros aplicados.',
      });
      return;
    }

    const title = 'Historial de Movimientos';
    const subtitle = `Exportado el: ${new Date().toLocaleDateString()}`;
    const headers = [
      'Fecha/Hora',
      'Libro',
      'Usuario',
      'Estado Anterior',
      'Estado Nuevo',
      'Acción',
      'Persona',
      'Observaciones',
    ];

    const data = history.map((item) => ({
      'Fecha/Hora': item.dateTime,
      'Libro': item.book,
      'Usuario': item.user,
      'Estado Anterior': item.previousState,
      'Estado Nuevo': item.newState,
      'Acción': item.action,
      'Persona': item.person,
      'Observaciones': item.observations,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      [{ v: title, s: { font: { sz: 18, bold: true }, alignment: { horizontal: 'center', vertical: 'center' } } }],
      [{ v: subtitle, s: { font: { sz: 12 }, alignment: { horizontal: 'center', vertical: 'center' } } }],
      [],
      headers.map(h => ({ v: h, s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "FF6C5CE7" } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } } })),
      ...data.map(row => Object.values(row).map(val => ({ v: val, s: { alignment: { horizontal: 'center', vertical: 'center' }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } } })))
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ];
    
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
    XLSX.writeFile(workbook, `historial-movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'El historial se ha descargado como un archivo Excel.',
    });
    setIsExportDialogOpen(false);
  };


  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-lg font-semibold md:text-2xl">Historial de Movimientos</h1>
      
      <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white" onClick={fetchHistory} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refrescar
          </Button>
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Historial
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Seleccionar Formato de Exportación</DialogTitle>
                <DialogDescription>
                    Elige el formato para descargar el historial de movimientos.
                </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                <Button onClick={handleExportPdf}>
                    <FileText className="mr-2 h-4 w-4" /> Exportar a PDF
                </Button>
                <Button
                    onClick={handleExportExcel}
                    variant="secondary"
                    className="bg-green-600 text-white hover:bg-green-700"
                >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
                </Button>
                </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            variant={isSearchVisible ? 'destructive' : 'default'}
          >
              <Search className="mr-2 h-4 w-4" />
              {isSearchVisible ? 'Ocultar Búsqueda' : 'Buscar y Filtrar'}
          </Button>
      </div>

      {isSearchVisible && (
        <Card className="p-6">
          <div className="grid gap-6">
            <Input 
              placeholder="Buscar por libro, observación o funcionario..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({...prev, query: e.target.value}))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Fecha Desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start font-normal text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters(prev => ({...prev, dateFrom: date === undefined ? undefined : date}))}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Fecha Hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start font-normal text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters(prev => ({...prev, dateTo: date === undefined ? undefined : date}))}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Acción</Label>
                <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({...prev, action: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Retiro">Retiro</SelectItem>
                    <SelectItem value="Devolución">Devolución</SelectItem>
                    <SelectItem value="Creación">Creación</SelectItem>
                    <SelectItem value="Archivado">Archivado</SelectItem>
                    <SelectItem value="Edición">Edición</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Libro</TableHead>
                    <TableHead className="hidden md:table-cell">Usuario</TableHead>
                    <TableHead className="hidden lg:table-cell">Estado Anterior</TableHead>
                    <TableHead>Estado Nuevo</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead className="hidden lg:table-cell">Persona</TableHead>
                    <TableHead className="hidden md:table-cell">Observaciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Cargando historial...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : history.length > 0 ? (
                    history.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.dateTime}</TableCell>
                            <TableCell>{item.book}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.user}</TableCell>
                            <TableCell className="hidden lg:table-cell">{item.previousState}</TableCell>
                            <TableCell>{item.newState}</TableCell>
                            <TableCell>{item.action}</TableCell>
                            <TableCell className="hidden lg:table-cell">{item.person}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.observations}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FileWarning className="h-5 w-5" />
                            <span>No se encontraron movimientos con los filtros aplicados</span>
                        </div>
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
