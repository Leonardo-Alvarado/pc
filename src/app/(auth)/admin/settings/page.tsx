'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from './actions';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSeeder, setShowSeeder] = useState(true);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsLoading(true);
    const result = await seedDatabase();
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Base de Datos Poblada',
        description: result.message,
        className: 'bg-green-500 text-white',
      });
      setShowSeeder(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al poblar la base de datos',
        description: result.message,
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Configuración del Sistema</h1>
      {showSeeder && (
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary" />
                  </div>
              </div>
              <div className="flex-grow">
                <CardTitle>Gestión de Datos de Prueba</CardTitle>
                <CardDescription>
                  Esta acción te permite reiniciar y poblar tu base de datos con un
                  conjunto completo de datos de prueba realistas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-950">
              <AlertTitle className="font-bold">¡Atención! Acción Destructiva</AlertTitle>
              <AlertDescription>
                Al continuar, se **borrarán permanentemente todos los datos existentes** en
                las tablas de libros, usuarios y movimientos. Las tablas se
                recrearán y se llenarán con nuevos datos de prueba.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                   {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Poblando Base de Datos...' : 'Poblar Base de Datos'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se borrarán todas las tablas y se reemplazarán con datos de prueba. Esto afectará a todos los usuarios del sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeedDatabase}>
                    Sí, borrar y poblar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
