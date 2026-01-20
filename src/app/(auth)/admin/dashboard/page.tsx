'use client';

import { useState, useEffect } from 'react';
import {
  Book,
  PlusCircle,
  QrCode,
  Search,
  Activity
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type Activity as ActivityType } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/animated-counter"
import { getDashboardData, type DashboardData } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalBooks: 0,
      archivedBooks: 0,
      inUseBooks: 0,
      dailyMovements: 0
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(fetchedData => {
      setData(fetchedData);
      setLoading(false);
    });
  }, []);

  const cardStats = [
    { title: "Total de Libros", value: data.stats.totalBooks, icon: Book },
    { title: "En Archivos", value: data.stats.archivedBooks, icon: Book },
    { title: "En Uso", value: data.stats.inUseBooks, icon: Book },
    { title: "Movimientos Hoy", value: data.stats.dailyMovements, icon: Activity }
  ];
  
  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Panel Principal</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cardStats.map((stat, index) => (
            <Card key={index} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                 <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-10 w-1/2" /> : <AnimatedCounter value={stat.value} />}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/admin/qr-scan" className='flex-1'>
              <Button className='w-full'>
                  <QrCode className="mr-2 h-4 w-4"/> Escaneo Rápido
              </Button>
            </Link>
            <Link href="/admin/book-management" className='flex-1'>
              <Button variant="secondary" className='w-full'>
                  <Book className="mr-2 h-4 w-4"/> Ver Libros
              </Button>
            </Link>
            <Link href="/admin/book-management">
              <Button variant="outline" className='flex-1'>
                  <PlusCircle className="mr-2 h-4 w-4"/> Agregar Libro
              </Button>
            </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary"/>
                    <CardTitle>Consulta Rápida de Libros</CardTitle>
                </div>
                 <CardDescription>Busca un libro por año, tomo o registro.</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <Input
                    className="w-full"
                    placeholder="Escribe aquí para buscar..."
                  />
                </form>
              </CardContent>
          </Card>
          <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimos movimientos en el sistema.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando actividad...</p>
                ) : data.recentActivity.length > 0 ? data.recentActivity.map((activity, index) => (
                   <div key={index} className="flex items-center gap-4">
                     <Avatar className="hidden h-9 w-9 sm:flex">
                       <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="grid gap-1">
                       <p className="text-sm font-medium leading-none">
                         {activity.user}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         {activity.action}: Libro {activity.book}
                       </p>
                     </div>
                     <div className="ml-auto text-sm text-muted-foreground">{activity.time}</div>
                   </div>
                )) : (
                    <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                )}
              </CardContent>
            </Card>
        </div>
    </div>
  )
}
