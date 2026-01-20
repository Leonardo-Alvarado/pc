'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';
import { type Book } from '@/lib/data';

export async function getBooks(): Promise<Book[]> {
  try {
    const result = await pool.query(
      `SELECT id, tomo, year, TO_CHAR(entry_date, 'YYYY-MM-DD') as "entryDate", status FROM books ORDER BY entry_date DESC, id DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function addBook(book: Book): Promise<{ success: boolean; message?: string }> {
  const { id, tomo, year, entryDate, status } = book;
  try {
    await pool.query(
      'INSERT INTO books (id, tomo, year, entry_date, status) VALUES ($1, $2, $3, $4, $5)',
      [id, tomo, year, entryDate, status]
    );
    revalidatePath('/admin/book-management');
    return { success: true };
  } catch (error) {
    console.error('Error adding book:', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
       return { success: false, message: `El libro con ID ${id} ya existe.` };
    }
    return { success: false, message: 'No se pudo agregar el libro.' };
  }
}


export async function deleteBook(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    revalidatePath('/admin/book-management');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { success: false, message: 'No se pudo eliminar el libro.' };
  }
}
