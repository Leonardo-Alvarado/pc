'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  BarChart2,
  Book,
  Archive,
  BookOpen,
  FileClock,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
  CartesianGrid,
  AreaChart,
  BarChart,
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { AnimatedCounter } from '@/components/animated-counter';
import { getMonthlyMovements, getBookStatusDistribution, type MonthlyMovement, type BookStatusDistribution } from './actions';
import { getDashboardData } from '../dashboard/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBooks: 0, archivedBooks: 0, inUseBooks: 0, totalRegistros: 0 });
  const [monthlyMovements, setMonthlyMovements] = useState<MonthlyMovement[]>([]);
  const [bookStatusData, setBookStatusData] = useState<BookStatusDistribution[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [dashboardData, monthlyData, statusData] = await Promise.all([
        getDashboardData(),
        getMonthlyMovements(),
        getBookStatusDistribution(),
      ]);
      setStats({
        totalBooks: dashboardData.stats.totalBooks,
        archivedBooks: dashboardData.stats.archivedBooks,
        inUseBooks: dashboardData.stats.inUseBooks,
        totalRegistros: dashboardData.stats.totalBooks, // Assuming totalRegistros is totalBooks
      });
      setMonthlyMovements(monthlyData);
      setBookStatusData(statusData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const cardStats = [
    { title: 'Total de Libros', value: stats.totalBooks, icon: Book },
    { title: 'En Archivos', value: stats.archivedBooks, icon: Archive },
    { title: 'En Uso', value: stats.inUseBooks, icon: BookOpen },
    { title: 'Total Registros', value: stats.totalRegistros, icon: FileClock },
  ];

  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);
    doc.text('Reporte General', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Fecha de exportación: ${new Date().toLocaleString()}`, 105, 35, {
      align: 'center',
    });

    doc.autoTable({
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: cardStats.map((stat) => [stat.title, stat.value]),
      theme: 'grid',
      headStyles: { fillColor: [108, 92, 231] },
    });

    if (monthlyMovements.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Movimientos Mensuales', 14, 20);
        doc.autoTable({
        startY: 25,
        head: [['Mes', 'Retiros', 'Devoluciones', 'Creados']],
        body: monthlyMovements.map((m) => [
            m.month,
            m.Retiros,
            m.Devoluciones,
            m.Creados,
        ]),
        theme: 'striped',
        });
    }

    doc.save(`reporte-general_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Éxito', description: 'Reporte en PDF generado.' });
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Stats worksheet
    const statsData = cardStats.map((stat) => ({
      Métrica: stat.title,
      Valor: stat.value,
    }));
    const ws1 = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Estadísticas Generales');

    // Movements worksheet
    if (monthlyMovements.length > 0) {
        const movementsData = monthlyMovements.map((m) => ({
            Mes: m.month,
            Retiros: m.Retiros,
            Devoluciones: m.Devoluciones,
            Creados: m.Creados,
        }));
        const ws2 = XLSX.utils.json_to_sheet(movementsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Movimientos Mensuales');
    }

    XLSX.writeFile(
      wb,
      `reporte-general_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    toast({ title: 'Éxito', description: 'Reporte en Excel generado.' });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">
          Reportes e Impresión
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cardStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5" />
            </CardHeader>
            <CardContent>
               {loading ? <Skeleton className="h-10 w-1/2 bg-white/30" /> : <AnimatedCounter value={stat.value} />}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="inventory">
              <FileText className="mr-2 h-4 w-4" /> Reporte de Inventario
            </TabsTrigger>
            <TabsTrigger value="movements">
              <FileClock className="mr-2 h-4 w-4" /> Reporte de Movimientos
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart2 className="mr-2 h-4 w-4" /> Estadísticas
            </TabsTrigger>
            <TabsTrigger value="detailed">
              <FileText className="mr-2 h-4 w-4" /> Reporte Detallado
            </TabsTrigger>
          </TabsList>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <Button
              onClick={handleExportPdf}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white sm:flex-none"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Movimientos por Mes</CardTitle>
                <CardDescription>
                  Análisis de retiros, devoluciones y libros creados
                  mensualmente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex h-[300px] w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyMovements}>
                    <defs>
                      <linearGradient
                        id="colorRetiros"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorDevoluciones"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#82ca9d"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#82ca9d"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Retiros"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorRetiros)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Devoluciones"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorDevoluciones)"
                    />
                    <Line
                      type="monotone"
                      dataKey="Creados"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Libros por Estado</CardTitle>
                <CardDescription>
                  Estado actual del inventario de libros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex h-[300px] w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={bookStatusData}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Cantidad de Libros"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inventory" className="mt-6 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta funcionalidad estará disponible próximamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="movements" className="mt-6 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta funcionalidad estará disponible próximamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="detailed" className="mt-6 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Reporte Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta funcionalidad estará disponible próximamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
