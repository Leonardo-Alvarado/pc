'use server';

import pool from '@/lib/db';
import { type MovementHistory } from '@/lib/data';

export async function getMovementHistory(filters: {
  query: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  action: string;
}): Promise<MovementHistory[]> {
  try {
    let query = `
      SELECT
        TO_CHAR(m.date_time, 'YYYY-MM-DD HH24:MI:SS') as "dateTime",
        m.book_id as "book",
        COALESCE(u.name, 'Usuario Eliminado') as "user",
        m.previous_state as "previousState",
        m.new_state as "newState",
        m.action,
        m.person,
        m.observations
      FROM movements m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE 1 = 1
    `;
    const queryParams: any[] = [];

    if (filters.query) {
      queryParams.push(`%${filters.query.toLowerCase()}%`);
      query += ` AND (
        LOWER(m.book_id) LIKE $${queryParams.length} OR
        LOWER(m.observations) LIKE $${queryParams.length} OR
        LOWER(u.name) LIKE $${queryParams.length} OR
        LOWER(m.person) LIKE $${queryParams.length}
      )`;
    }

    if (filters.action && filters.action !== 'all') {
      queryParams.push(filters.action);
      query += ` AND m.action = $${queryParams.length}`;
    }
    
    if (filters.dateFrom) {
        queryParams.push(filters.dateFrom);
        query += ` AND m.date_time >= $${queryParams.length}`;
    }

    if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        queryParams.push(dateTo);
        query += ` AND m.date_time <= $${queryParams.length}`;
    }

    query += ' ORDER BY m.date_time DESC';

    const result = await pool.query(query, queryParams);
    return result.rows;

  } catch (error) {
    console.error('Error fetching movement history:', error);
    return [];
  }
}
