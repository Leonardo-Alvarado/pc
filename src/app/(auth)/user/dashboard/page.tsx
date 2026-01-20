'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  BookX,
  Library,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Book } from '@/lib/data';
import { CategoryManagementDialog } from '@/components/category-management-dialog';
import { getBooks } from '../admin/book-management/actions';

const ITEMS_PER_PAGE = 8;

export default function UserDashboard() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [year, setYear] = useState('all');
  const [tome, setTome] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getBooks().then(books => {
      setAllBooks(books);
      setLoading(false);
    });
  }, []);

  const availableYears = useMemo(
    () => [...new Set(allBooks.map((book) => book.year))].sort((a, b) => b - a),
    [allBooks]
  );
  const availableTomes = useMemo(
    () => [...new Set(allBooks.map((book) => book.tomo))].sort(),
    [allBooks]
  );

  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        searchLower === '' ||
        book.id.toLowerCase().includes(searchLower) ||
        book.tomo.toLowerCase().includes(searchLower) ||
        String(book.year).includes(searchLower);

      const matchesStatus = status === 'all' || book.status === status;
      const matchesYear = year === 'all' || String(book.year) === year;
      const matchesTome = tome === 'all' || book.tomo === tome;

      return matchesSearch && matchesStatus && matchesYear && matchesTome;
    });
  }, [search, status, year, tome, allBooks]);

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

  const getStatusClasses = (status: Book['status']) => {
    switch (status) {
      case 'Disponible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'En Uso':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Archivado':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-4">
        <Library className="h-6 w-6 text-primary" />
        <h1 className="font-semibold text-lg md:text-2xl">
          Biblioteca 2D - Vista de Solo Lectura
        </h1>
      </div>

      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="w-full pl-10"
            placeholder="Buscar por año, tomo, registro..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Año" />
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
          <Select
            value={tome}
            onValueChange={(value) => {
              setTome(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nombre de Libro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los nombres</SelectItem>
              {availableTomes.map((t, index) => (
                <SelectItem key={`${t}-${index}`} value={t}>
                  Tomo {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CategoryManagementDialog />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-l-4 border-primary bg-muted/50 p-3 rounded-r-lg text-sm">
          <span className="font-semibold text-muted-foreground">
            Vista de Solo Lectura:
          </span>
          <span className="text-green-600 font-semibold mx-1">
            <span className="text-green-500 mr-1">●</span>Verde = Disponible
          </span>{' '}
          |
          <span className="text-red-600 font-semibold ml-1">
            <span className="text-red-500 mr-1">●</span>Rojo = En Uso
          </span>{' '}
          |
          <span className="text-muted-foreground ml-1">
            Haz clic en cualquier libro para ver detalles
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
             Página {totalPages > 0 ? currentPage : 0} de {totalPages} ({filteredBooks.length} libros)
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || paginatedBooks.length === 0}
          >
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
             <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-lg">
                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4 text-primary/50" />
                <p className="font-semibold">Cargando libros...</p>
            </div>
        ) : paginatedBooks.length > 0 ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                   <div className="p-4 bg-gray-200 rounded-md mb-3">
                     <Library className="w-10 h-10 text-gray-500" />
                   </div>
                  <h3 className="font-bold">{book.id}</h3>
                  <p className="text-sm text-muted-foreground">Tomo {book.tomo} - {book.year}</p>
                   <Badge className={`mt-2 ${getStatusClasses(book.status)}`}>
                    {book.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-lg">
            <BookX className="mx-auto h-12 w-12 mb-4 text-primary/50" />
            <p className="font-semibold">No se encontraron libros</p>
            <p className="text-sm">con los filtros aplicados o no se han agregado libros aún.</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {totalPages > 0 ? currentPage : 0} de {totalPages} ({filteredBooks.length} libros)
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || paginatedBooks.length === 0}
          >
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
