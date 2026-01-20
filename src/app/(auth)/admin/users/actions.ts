'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';
import { type UserAccount } from '@/lib/data';

export async function getUsers(): Promise<UserAccount[]> {
  try {
    const result = await pool.query(
      `SELECT id, name, username, email, role, TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt" FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function addUser(user: Omit<UserAccount, 'id' | 'createdAt'>): Promise<{ success: boolean; message?: string }> {
  const { name, username, email, role } = user;
  const newId = `user_${Date.now()}`;
  try {
    await pool.query(
      'INSERT INTO users (id, name, username, email, role) VALUES ($1, $2, $3, $4, $5)',
      [newId, name, username, email, role]
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
     console.error('Error adding user:', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
       return { success: false, message: `El usuario con ese nombre de usuario o email ya existe.` };
    }
    return { success: false, message: 'No se pudo agregar el usuario.' };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'No se pudo eliminar el usuario.' };
  }
}
