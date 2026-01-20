'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { type UserAccount as User } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { AddUserDialog } from '@/components/add-user-dialog';
import { Button } from '@/components/ui/button';
import { getUsers, addUser, deleteUser } from './actions';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleAddUser = async (newUser: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    const result = await addUser(newUser);
    if (result.success) {
      getUsers().then(setUsers);
      toast({
        title: 'Usuario Agregado',
        description: `El usuario ${newUser.name} ha sido agregado correctamente.`,
      });
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al agregar usuario',
        description: result.message,
      });
      return false;
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete.id);

    if (result.success) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      toast({
        title: 'Usuario Eliminado',
        description: `El usuario ${userToDelete.name} ha sido eliminado correctamente.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: result.message ?? 'No se pudo eliminar el usuario.',
      });
    }
    setUserToDelete(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <AddUserDialog onUserAdded={handleAddUser} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow">
              <p><span className="font-semibold text-muted-foreground">Usuario:</span> {user.username}</p>
              <p><span className="font-semibold text-muted-foreground">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-muted-foreground">Rol:</span> {user.role}</p>
              <p><span className="font-semibold text-muted-foreground">Creado:</span> {user.createdAt}</p>
            </CardContent>
            <div className="p-6 pt-0">
               <Button variant="destructive" className="w-full" onClick={() => setUserToDelete(user)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </div>
          </Card>
        ))}
        {users.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full py-10">No hay usuarios. Agrega uno para empezar.</p>
        )}
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
              de tus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
