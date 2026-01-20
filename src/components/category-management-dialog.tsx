'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Plus, Tag, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function CategoryManagementDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="accent"
          className="flex-shrink-0 h-10 w-10 bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Gestionar Categorías</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-yellow-500" />
            Gestión de Categorías
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
             <Lightbulb className="h-4 w-4 text-blue-500" />
            <AlertTitle className="font-semibold text-blue-900">Información</AlertTitle>
            <AlertDescription className="text-blue-800/90">
              Las categorías se asignan automáticamente según el nombre del libro. Puedes agregar nuevas categorías personalizadas.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name" className="text-foreground font-semibold">
                Nueva Categoría
              </Label>
              <Input id="category-name" placeholder="Nombre de la nueva categoría" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="keywords" className="text-foreground font-semibold">
                Palabras clave (separadas por comas)
              </Label>
              <Textarea
                id="keywords"
                placeholder="ej: hipoteca, préstamo, garantía"
                className="mt-1"
              />
               <p className="text-xs text-muted-foreground mt-1">
                Los libros que contengan estas palabras se asignarán automáticamente a esta categoría.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
             <h3 className="font-semibold">Categorías Existentes</h3>
             <Card className="text-center bg-muted/50">
                <CardContent className="p-6 text-sm text-muted-foreground">
                    No hay categorías personalizadas. Las categorías por defecto se asignan automáticamente.
                </CardContent>
             </Card>
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="accent">
              <X className="mr-2 h-4 w-4" /> Cerrar
            </Button>
          </DialogClose>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
