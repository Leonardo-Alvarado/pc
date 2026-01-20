'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, QrCode } from 'lucide-react';

export function QrScannerDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Escanear QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Escanear Código QR</DialogTitle>
          <DialogDescription>
            Apunte la cámara al código QR del libro para registrar la entrada o salida.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg my-4">
          <div className="relative w-64 h-64 bg-black rounded-md flex items-center justify-center">
            <Camera className="h-16 w-16 text-muted-foreground" />
            <div className="absolute top-0 left-0 w-full h-full animate-pulse">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/70 -translate-y-1/2"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
