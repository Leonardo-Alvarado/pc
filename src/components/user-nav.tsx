'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useRouter, usePathname } from "next/navigation"

const adminUser = {
  name: 'Administrador',
  email: 'admin@registro.com',
};

const standardUser = {
  name: 'Usuario',
  email: 'user@registro.com',
};

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  
  const user = isAdminRoute ? adminUser : standardUser;

  const handleRoleChange = (value: string) => {
    if (value === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
        <Select defaultValue={isAdminRoute ? 'admin' : 'user'} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-auto min-w-[150px] hidden md:flex">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="admin">Modo Administrador</SelectItem>
                <SelectItem value="user">Modo Usuario</SelectItem>
            </SelectContent>
        </Select>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href="/login">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </Link>
                </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}
