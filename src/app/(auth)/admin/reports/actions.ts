'use server';
import pool from '@/lib/db';

export interface MonthlyMovement {
  month: string;
  Retiros: number;
  Devoluciones: number;
  Creados: number;
  Archivados: number;
}

export interface BookStatusDistribution {
  name: 'Disponible' | 'En Uso' | 'Archivado';
  value: number;
}

export async function getMonthlyMovements(): Promise<MonthlyMovement[]> {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(date_trunc('month', date_time), 'YYYY-MM') as month,
        COUNT(*) FILTER (WHERE action = 'Retiro') as "Retiros",
        COUNT(*) FILTER (WHERE action = 'Devolución') as "Devoluciones",
        COUNT(*) FILTER (WHERE action = 'Creación') as "Creados",
        COUNT(*) FILTER (WHERE action = 'Archivado') as "Archivados"
      FROM movements
      WHERE date_time > NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `);
    // pg returns counts as strings
    return result.rows.map(row => ({
        ...row,
        Retiros: parseInt(row.Retiros, 10),
        Devoluciones: parseInt(row.Devoluciones, 10),
        Creados: parseInt(row.Creados, 10),
        Archivados: parseInt(row.Archivados, 10),
    }));
  } catch (error) {
    console.error('Error fetching monthly movements:', error);
    return [];
  }
}

export async function getBookStatusDistribution(): Promise<BookStatusDistribution[]> {
  try {
    const result = await pool.query(`
      SELECT status as name, COUNT(*) as value
      FROM books
      GROUP BY status
    `);
    // pg returns counts as strings
     const parsedResult = result.rows.map(row => ({
        ...row,
        value: parseInt(row.value, 10),
    }));

    const allStatuses: BookStatusDistribution[] = [
      { name: 'Disponible', value: 0 },
      { name: 'En Uso', value: 0 },
      { name: 'Archivado', value: 0 },
    ];
    
    parsedResult.forEach(row => {
        const index = allStatuses.findIndex(s => s.name === row.name);
        if (index !== -1) {
            allStatuses[index].value = row.value;
        }
    });

    return allStatuses;

  } catch (error) {
    console.error('Error fetching book status distribution:', error);
    return [];
  }
}
