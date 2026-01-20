'use server';

import pool from '@/lib/db';
import { type Activity } from '@/lib/data';

export interface DashboardStats {
  totalBooks: number;
  archivedBooks: number;
  inUseBooks: number;
  dailyMovements: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const statsPromise = pool.query(`
      SELECT
        (SELECT COUNT(*) FROM books) as "totalBooks",
        (SELECT COUNT(*) FROM books WHERE status = 'Archivado') as "archivedBooks",
        (SELECT COUNT(*) FROM books WHERE status = 'En Uso') as "inUseBooks",
        (SELECT COUNT(*) FROM movements WHERE date_time >= NOW() - INTERVAL '24 hours') as "dailyMovements"
    `);

    const activityPromise = pool.query(`
      SELECT
        m.action,
        TO_CHAR(m.date_time, 'HH24:MI') as time,
        b.id as book,
        u.name as user
      FROM movements m
      JOIN books b ON m.book_id = b.id
      JOIN users u ON m.user_id = u.id
      ORDER BY m.date_time DESC
      LIMIT 5
    `);

    const [statsResult, activityResult] = await Promise.all([statsPromise, activityPromise]);
    
    const stats = statsResult.rows[0] as DashboardStats;
    // pg returns counts as strings, so we need to parse them
    const parsedStats: DashboardStats = {
      totalBooks: parseInt(stats.totalBooks as any, 10) || 0,
      archivedBooks: parseInt(stats.archivedBooks as any, 10) || 0,
      inUseBooks: parseInt(stats.inUseBooks as any, 10) || 0,
      dailyMovements: parseInt(stats.dailyMovements as any, 10) || 0
    };
    
    const recentActivity = activityResult.rows as Activity[];

    return { stats: parsedStats, recentActivity };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      stats: {
        totalBooks: 0,
        archivedBooks: 0,
        inUseBooks: 0,
        dailyMovements: 0,
      },
      recentActivity: [],
    };
  }
}
