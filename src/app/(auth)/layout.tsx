'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Book,
  History,
  FileText,
  Users,
  Settings,
  Library,
  Menu,
  LogOut,
  QrCode,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { UserNav } from '@/components/user-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  const adminMenuItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Escaneo QR', icon: QrCode, href: '/admin/qr-scan' },
    { name: 'Gestión de Libros', icon: Book, href: '/admin/book-management' },
    { name: 'Historial', icon: History, href: '/admin/history' },
    { name: 'Reportes', icon: FileText, href: '/admin/reports' },
    { name: 'Usuarios', icon: Users, href: '/admin/users' },
    { name: 'Configuración', icon: Settings, href: '/admin/settings' },
  ];

  const userMenuItems = [
    { name: 'Biblioteca 2D', icon: Library, href: '/user/dashboard' },
  ];
  
  const menuItems = isAdminRoute ? adminMenuItems : userMenuItems;

  const NavContent = ({ items }: { items: {name: string, icon: React.ElementType, href: string }[] }) => {
    return (
      <nav className="grid items-start gap-1 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
              pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    );
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40" style={{'--background': '257 60% 95%'} as React.CSSProperties}>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
         <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4 pt-6">
                <div className='rounded-lg bg-card p-4'>
                    <NavContent items={menuItems} />
                </div>
                <div className="mt-auto p-4 border-t">
                  <Link
                    href="/login"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Link>
                </div>
            </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <Library className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
                <h1 className="font-bold text-lg">Sistema de Libros</h1>
                <p className="text-xs text-muted-foreground">Control con QR</p>
            </div>
        </div>
        <div className="ml-auto">
          <UserNav />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-64 border-r bg-card p-4">
          <div className="flex-1 rounded-lg p-2 shadow-sm">
            <NavContent items={menuItems} />
          </div>
          {isAdminRoute && (
               <div className="mt-auto p-4 border-t">
                  <Link
                    href="/login"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Link>
               </div>
          )}
        </aside>
        <main className="flex-1 p-2 sm:p-4 md:p-6">
            <div className='bg-card rounded-lg shadow-sm p-4 md:p-6 h-full'>
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
