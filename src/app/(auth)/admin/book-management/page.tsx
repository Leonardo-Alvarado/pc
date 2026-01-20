'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FileDown,
  Library,
  QrCode,
  Search,
  FilePenLine,
  Trash2,
  Eye,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Book } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { QrLabelDialog } from '@/components/qr-label-dialog';
import { AddBookDialog } from '@/components/add-book-dialog';
import { getBooks, addBook, deleteBook } from './actions';

const ITEMS_PER_PAGE = 10;

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function BookManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [year, setYear] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [viewedBook, setViewedBook] = useState<Book | null>(null);
  const [editedBook, setEditedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);
  
  useEffect(() => {
    if (viewedBook) {
      const bookData = {
        id: viewedBook.id,
        year: viewedBook.year,
        tomo: viewedBook.tomo,
      };
      QRCode.toDataURL(JSON.stringify(bookData), {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.9,
        margin: 1,
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error(err);
      });
    }
  }, [viewedBook]);

  const currentYear = new Date().getFullYear();
  const startYear = 1990;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        book.id.toLowerCase().includes(searchLower) ||
        book.tomo.toLowerCase().includes(searchLower) ||
        String(book.year).includes(searchLower);

      const matchesStatus = status === 'all' || book.status === status;

      const matchesYear = year === 'all' || String(book.year) === year;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [search, status, year, books]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getStatusVariant = (
    status: Book['status']
  ): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Disponible':
        return 'default';
      case 'En Uso':
        return 'destructive';
      case 'Archivado':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    const result = await deleteBook(bookToDelete.id);

    if (result.success) {
      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.id !== bookToDelete.id)
      );
      toast({
        title: 'Libro Eliminado',
        description: `El libro ${bookToDelete.id} ha sido eliminado.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: result.message,
      });
    }
    setBookToDelete(null);
  };

  const handleAddBook = async (newBook: Book) => {
    const result = await addBook(newBook);
    if (result.success) {
      getBooks().then(setBooks);
      toast({
        title: 'Libro Agregado',
        description: `El libro ${newBook.id} ha sido guardado exitosamente.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: result.message,
      });
    }
  };
  
  const handleExportPdf = () => {
    if (filteredBooks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay datos para exportar',
        description: 'Aplica filtros diferentes o agrega libros a la lista.',
      });
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text('Lista de Libros', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Exportado el: ${new Date().toLocaleDateString()}`, 14, 29);

    const tableColumn = [
      'ID/Registro',
      'Tomo',
      'Año',
      'Estado',
      'Fecha de Ingreso',
    ];
    const tableRows = filteredBooks.map((book) => [
      book.id,
      book.tomo,
      book.year,
      book.status,
      book.entryDate,
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

    doc.save(`lista-libros_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'Exportación Exitosa',
      description: 'La lista de libros se ha descargado como un archivo PDF.',
    });
    setIsExportDialogOpen(false);
  };

  const handleExportExcel = () => {
    if (filteredBooks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay datos para exportar',
        description: 'Aplica filtros diferentes o agrega libros a la lista.',
      });
      return;
    }

    const title = 'Lista de Libros';
    const subtitle = `Exportado el: ${new Date().toLocaleDateString()}`;
    const headers = [
      'ID/Registro',
      'Tomo',
      'Año',
      'Estado',
      'Fecha de Ingreso',
    ];

    const data = filteredBooks.map((book) => ({
      'ID/Registro': book.id,
      'Tomo': book.tomo,
      'Año': book.year,
      'Estado': book.status,
      'Fecha de Ingreso': book.entryDate,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      [{ v: title, s: { font: { sz: 18, bold: true }, alignment: { horizontal: 'center' } } }],
      [{ v: subtitle, s: { font: { sz: 12 }, alignment: { horizontal: 'center' } } }],
      [],
      headers.map(h => ({ v: h, s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "FF6C5CE7" } }, alignment: { horizontal: 'center' }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } } })),
      ...data.map(row => Object.values(row).map(val => ({ v: val, s: { alignment: { horizontal: 'center' }, border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} } } })))
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    ];
    
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Libros');
    XLSX.writeFile(workbook, `lista-libros_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Exportación Exitosa',
      description: 'La lista de libros se ha descargado como un archivo Excel.',
    });
    setIsExportDialogOpen(false);
  };


  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Libros</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AddBookDialog onBookAdded={handleAddBook} />
        <Link href="/admin/library-view">
          <Button variant="outline">
            <Library className="mr-2 h-4 w-4" /> Vista Biblioteca 2D
          </Button>
        </Link>
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Exportar Lista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Seleccionar Formato de Exportación</DialogTitle>
              <DialogDescription>
                Elige el formato para descargar la lista de libros. La
                exportación respetará los filtros aplicados.
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
        <QrLabelDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por ID, tomo o año..."
                className="w-full rounded-lg bg-background pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Uso">En Uso</SelectItem>
                  <SelectItem value="Archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={year}
                onValueChange={(value) => {
                  setYear(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 text-left">ID/Registro</TableHead>
                <TableHead className="hidden py-3 text-center md:table-cell">Tomo</TableHead>
                <TableHead className="py-3 text-center">Año</TableHead>
                <TableHead className="py-3 text-center">Estado</TableHead>
                <TableHead className="hidden py-3 text-center md:table-cell">Fecha de Ingreso</TableHead>
                <TableHead className="py-3 text-right">
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="py-3 font-medium text-left">
                      {book.id}
                    </TableCell>
                    <TableCell className="hidden py-3 text-center md:table-cell">{book.tomo}</TableCell>
                    <TableCell className="py-3 text-center">{book.year}</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant={getStatusVariant(book.status)}>
                        {book.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden py-3 text-center md:table-cell">{book.entryDate}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:bg-sky-100 hover:text-sky-600"
                          onClick={() => setViewedBook(book)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-yellow-100 hover:text-yellow-600"
                          onClick={() => setEditedBook(book)}
                        >
                          <FilePenLine className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setBookToDelete(book)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron libros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Mostrando{' '}
              <strong>
                {paginatedBooks.length > 0
                  ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                  : 0}
                -
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBooks.length)}
              </strong>{' '}
              de <strong>{filteredBooks.length}</strong> libros
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  currentPage === totalPages || paginatedBooks.length === 0
                }
              >
                Siguiente
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* View Book Dialog */}
      <Dialog open={!!viewedBook} onOpenChange={(open) => !open && setViewedBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vista Previa del Código QR</DialogTitle>
            <DialogDescription>
              Este es el código QR que se generará para el libro. Escanéalo con
              tu dispositivo para verificar la información.
            </DialogDescription>
          </DialogHeader>
          {viewedBook && (
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
                    id: viewedBook.id,
                    year: viewedBook.year,
                    tomo: viewedBook.tomo,
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewedBook(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog Placeholder */}
      <Dialog open={!!editedBook} onOpenChange={(open) => !open && setEditedBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Libro</DialogTitle>
            <DialogDescription>
              Esta funcionalidad estará disponible próximamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditedBook(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Book Alert Dialog */}
      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el libro
              de tus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
