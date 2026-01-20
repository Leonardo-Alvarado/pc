'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
    Camera, 
    UploadCloud, 
    ScanLine, 
    StopCircle,
    Check,
    List,
    Trash2,
    BookCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function QrScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleQrCodeResult = useCallback((code: string) => {
    if (isBatchMode) {
      if (!scannedCodes.includes(code)) {
        setScannedCodes(prev => [code, ...prev]);
         toast({
          title: "Código Agregado",
          description: `El código ${code} ha sido añadido a la lista.`,
          className: "bg-green-500 text-white",
        });
      }
    } else {
      setIsScanning(false);
      toast({
        title: "Libro Encontrado",
        description: `Código del libro: ${code}`,
        action: <Button variant="secondary" size="sm">Ver Detalles</Button>,
      });
    }
  }, [isBatchMode, scannedCodes, toast]);


  const scanFrame = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (isScanning) requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                handleQrCodeResult(code.data);
            }
        } catch (e) {
            console.error("jsQR error:", e);
        }
    }

    if(isScanning) requestAnimationFrame(scanFrame);
  }, [isScanning, handleQrCodeResult]);


  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Error de Cámara",
        description: "Tu navegador no soporta el acceso a la cámara.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Acceso a Cámara Denegado",
        description: "Por favor, habilita los permisos de cámara en tu navegador.",
      });
    }
  }, [toast, scanFrame]);

  const handleStartScan = () => {
    setIsScanning(true);
    startCamera();
  };

  const handleStopScan = () => {
    setIsScanning(false);
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const image = new Image();
        image.onload = async () => {
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            try {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    handleQrCodeResult(code.data);
                } else {
                    toast({
                        variant: "destructive",
                        title: "No se encontró QR",
                        description: "No se pudo detectar un código QR en la imagen subida.",
                    });
                }
            } catch (e) {
                 toast({
                    variant: "destructive",
                    title: "Error al leer imagen",
                    description: "Hubo un problema al procesar la imagen.",
                });
            }
        };
        image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };

  const clearScannedCodes = () => {
    setScannedCodes([]);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex w-full flex-col gap-6">
       <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Escaneo de Código QR</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <Button onClick={handleStartScan} disabled={isScanning}>
                <ScanLine className="mr-2 h-4 w-4" /> Iniciar Escáner
                </Button>
                <Button variant="outline" onClick={handleStopScan} disabled={!isScanning}>
                <StopCircle className="mr-2 h-4 w-4" /> Detener Escáner
                </Button>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="batch-mode"
                        checked={isBatchMode}
                        onCheckedChange={(checked) => {
                            setIsBatchMode(checked);
                            setScannedCodes([]);
                        }}
                    />
                    <Label htmlFor="batch-mode">Modo Lote</Label>
                </div>
            </div>

            <Card className="w-full aspect-video relative overflow-hidden">
              <CardContent className="p-0 flex items-center justify-center h-full bg-muted">
                  <video ref={videoRef} className={`w-full h-full object-cover ${!isScanning && 'hidden'}`} autoPlay muted playsInline />
                  {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="h-16 w-16 mb-4"/>
                          <p>El escáner está detenido</p>
                      </div>
                  )}
                  {isScanning && hasCameraPermission === null && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <p>Solicitando permiso de cámara...</p>
                      </div>
                  )}
                  {hasCameraPermission === false && (
                      <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center p-4">
                          <Alert variant="destructive">
                              <AlertTitle>Error de Cámara</AlertTitle>
                              <AlertDescription>
                              No se pudo acceder a la cámara. Por favor, revisa los permisos en tu navegador.
                              </AlertDescription>
                          </Alert>
                      </div>
                  )}
                  {isScanning && hasCameraPermission && (
                       <div className="absolute inset-0 border-4 border-primary/50 rounded-md pointer-events-none">
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/70 -translate-y-1/2 animate-[scan-y_3s_ease-in-out_infinite]"></div>
                       </div>
                  )}
              </CardContent>
            </Card>
        </div>
        <div className="flex flex-col gap-4">
            <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer flex-grow">
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 font-semibold">
                    <span className="text-primary">Haz clic aquí</span> o arrastra una imagen
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3"/>
                    Encuentra un libro subiendo su QR
                </p>
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                />
            </div>
             <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="h-5 w-5 text-primary"/>
                            <CardTitle>Resultados (Modo Lote)</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearScannedCodes} disabled={scannedCodes.length === 0}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        {isBatchMode ? "Los códigos escaneados aparecerán aquí." : "Activa el Modo Lote para escanear varios códigos."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isBatchMode && scannedCodes.length > 0 && (
                        <ul className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                            {scannedCodes.map((code, index) => (
                                <li key={index} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                    <BookCheck className="h-4 w-4 text-green-500" />
                                    <span>{code}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {isBatchMode && scannedCodes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aún no hay códigos escaneados.</p>
                    )}
                    {!isBatchMode && (
                        <p className="text-sm text-muted-foreground text-center py-4">El modo lote está desactivado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
