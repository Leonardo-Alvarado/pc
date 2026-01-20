export type Book = {
  id: string;
  tomo: string;
  year: number;
  entryDate: string;
  status: 'En Uso' | 'Archivado' | 'Disponible';
};

export type Activity = {
  user: string;
  action: string;
  time: string;
  book: string;
};

export type UserAccount = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'Administrador' | 'Usuario estándar';
  createdAt: string;
};

export type MovementHistory = {
  dateTime: string;
  book: string;
  user: string;
  previousState: string | null;
  newState: string;
  action: 'Retiro' | 'Archivado' | 'Devolución' | 'Creación' | 'Edición';
  person: string | null;
  observations: string | null;
};

export type Category = {
  id: number;
  name: string;
  keywords: string[];
};
