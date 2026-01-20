'use server';

import pool from '@/lib/db';

const firstNames = ['Juan', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Carlos', 'Sofía', 'Miguel', 'Elena', 'Pedro', 'Isabel'];
const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín'];
const tomeData = [
    { name: 'Nacimientos', prefix: 'NAC' },
    { name: 'Matrimonios', prefix: 'MAT' },
    { name: 'Defunciones', prefix: 'DEF' },
    { name: 'Índices', prefix: 'IND' },
    { name: 'Varios', prefix: 'VAR' },
    { name: 'Especiales', prefix: 'ESP' },
];

const movementObservations = {
    Retiro: [
        'Retirado para trámite de certificación.',
        'Solicitado para consulta interna por funcionario.',
        'Retirado para digitalización de folio.',
        'Préstamo a oficina de archivo central.'
    ],
    Devolución: [
        'Devuelto a estantería principal.',
        'Finalizada consulta interna.',
        'Proceso de digitalización completado.'
    ],
    Archivado: [
        'Archivado por antigüedad según normativa.',
        'Libro en mal estado, enviado a restauración.',
        'Movido a archivo histórico pasivo.'
    ]
}


function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  let client;
  try {
    client = await pool.connect();
    console.log('Starting database seeding...');

    const setupQueries = `
      DROP TABLE IF EXISTS movements;
      DROP TABLE IF EXISTS books;
      DROP TABLE IF EXISTS users;
      DROP TYPE IF EXISTS book_status;
      DROP TYPE IF EXISTS user_role;
      DROP TYPE IF EXISTS movement_action;

      CREATE TYPE book_status AS ENUM ('Disponible', 'En Uso', 'Archivado');
      CREATE TYPE user_role AS ENUM ('Administrador', 'Usuario estándar');
      CREATE TYPE movement_action AS ENUM ('Retiro', 'Archivado', 'Devolución', 'Creación', 'Edición');

      CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          role user_role NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE books (
          id TEXT PRIMARY KEY,
          tomo TEXT NOT NULL,
          year INTEGER NOT NULL,
          entry_date DATE NOT NULL,
          status book_status NOT NULL
      );

      CREATE TABLE movements (
          id SERIAL PRIMARY KEY,
          date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id),
          previous_state book_status,
          new_state book_status NOT NULL,
          action movement_action NOT NULL,
          person TEXT,
          observations TEXT
      );
    `;

    console.log('Executing setup queries...');
    await client.query(setupQueries);
    console.log('Tables and types created successfully.');

    // --- Generate Users ---
    console.log('Generating users...');
    const users = [];
    const adminUser = {
      id: `user_${Date.now()}`,
      name: 'Luis Pérez',
      username: 'admin',
      email: 'admin@registro.com',
      role: 'Administrador'
    };
    users.push(adminUser);

    for (let i = 0; i < 14; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}${i}`;
      users.push({
        id: `user_${Date.now() + i + 1}`,
        name: `${firstName} ${lastName}`,
        username: username,
        email: `${username}@ejemplo.com`,
        role: Math.random() > 0.8 ? 'Administrador' : 'Usuario estándar'
      });
    }

    // --- Generate Books and initial movements ---
    console.log('Generating books and creation movements...');
    const books = [];
    const initialMovements = [];
    for (let i = 0; i < 500; i++) {
      const year = Math.floor(Math.random() * (new Date().getFullYear() - 1990 + 1)) + 1990;
      const entryDate = getRandomDate(new Date(year, 0, 1), new Date());
      const selectedTome = getRandomElement(tomeData);

      const book = {
        id: `${year}-${selectedTome.prefix}-${String(i + 1).padStart(4, '0')}`,
        tomo: selectedTome.name,
        year: year,
        entryDate: entryDate.toISOString().split('T')[0],
        status: 'Disponible' as const
      };
      books.push(book);

      initialMovements.push({
        book_id: book.id,
        user_id: getRandomElement(users).id,
        previous_state: null,
        new_state: 'Disponible',
        action: 'Creación',
        date_time: entryDate.toISOString(),
        person: null,
        observations: `Creación inicial del libro de ${selectedTome.name.toLowerCase()} del año ${year}.`
      });
    }
    
    // --- Generate subsequent movements and update book status ---
    console.log('Generating subsequent movements...');
    const subsequentMovements = [];
    for (const book of books) {
      let lastStatus: 'Disponible' | 'En Uso' | 'Archivado' = 'Disponible';
      let lastDate = new Date(book.entryDate);

      // Simulate a few movements for some books
      const numberOfMovements = Math.floor(Math.random() * 5);
      for (let j = 0; j < numberOfMovements; j++) {
          const movementDate = getRandomDate(lastDate, new Date());
          lastDate = movementDate;
          const user = getRandomElement(users);
          
          if (lastStatus === 'Disponible') {
              const action = Math.random() > 0.3 ? 'Retiro' : 'Archivado';
              const newState = action === 'Retiro' ? 'En Uso' : 'Archivado';
              subsequentMovements.push({
                  book_id: book.id,
                  user_id: user.id,
                  previous_state: lastStatus,
                  new_state: newState,
                  action: action,
                  date_time: movementDate.toISOString(),
                  person: action === 'Retiro' ? `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}` : null,
                  observations: getRandomElement(movementObservations[action as keyof typeof movementObservations])
              });
              lastStatus = newState;
          } else if (lastStatus === 'En Uso') {
              subsequentMovements.push({
                  book_id: book.id,
                  user_id: user.id,
                  previous_state: lastStatus,
                  new_state: 'Disponible',
                  action: 'Devolución',
                  date_time: movementDate.toISOString(),
                  person: null,
                  observations: getRandomElement(movementObservations['Devolución'])
              });
              lastStatus = 'Disponible';
          }
          // No actions from 'Archivado' state in this simulation
      }
      // Update final book status
      book.status = lastStatus;
    }


    await client.query('BEGIN');
    
    console.log('Inserting users...');
    for (const user of users) {
      await client.query(
        'INSERT INTO users (id, name, username, email, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [user.id, user.name, user.username, user.email, user.role]
      );
    }

    console.log('Inserting books...');
    for (const book of books) {
      await client.query(
        'INSERT INTO books (id, tomo, year, entry_date, status) VALUES ($1, $2, $3, $4, $5)',
        [book.id, book.tomo, book.year, book.entryDate, book.status]
      );
    }
    
    console.log('Inserting movements...');
    const allMovements = [...initialMovements, ...subsequentMovements];
    for (const movement of allMovements) {
        await client.query(
            'INSERT INTO movements (date_time, book_id, user_id, previous_state, new_state, action, person, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [movement.date_time, movement.book_id, movement.user_id, movement.previous_state, movement.new_state, movement.action, movement.person, movement.observations]
        );
    }

    await client.query('COMMIT');
    console.log('Database seeding completed successfully.');
    return { success: true, message: `Se crearon ${users.length} usuarios, ${books.length} libros y ${allMovements.length} movimientos.` };

  } catch (error: any) {
    if (client) {
        // If an error occurs after the transaction has begun
        await client.query('ROLLBACK').catch(err => console.error('Error rolling back transaction:', err));
    }
    console.error('Error seeding database:', error);
     if (error.code === 'ECONNREFUSED') {
      return { success: false, message: `Error de Conexión: No se pudo conectar a la base de datos. Asegúrate de que PostgreSQL esté corriendo en el puerto ${process.env.DB_PORT || 5432}.` };
    }
    return { success: false, message: `Ocurrió un error: ${error.message}` };
  } finally {
    if (client) {
      client.release();
    }
  }
}
