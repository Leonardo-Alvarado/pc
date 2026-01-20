# BookRegistry - Sistema de Control de Libros con QR

Este es un proyecto Next.js creado en Firebase Studio para gestionar el inventario y los movimientos de libros de registro mediante códigos QR.

## Cómo Exportar y Ejecutar el Proyecto en Local (Visual Studio Code)

Sigue estos pasos para configurar y ejecutar el proyecto en tu propio entorno de desarrollo.

### 1. Prerrequisitos

Antes de empezar, asegúrate de tener instalado el siguiente software en tu máquina:

*   **Visual Studio Code**: El editor de código. [Descargar aquí](https://code.visualstudio.com/).
*   **Node.js**: Se recomienda la versión LTS. Esto incluye `npm` (Node Package Manager). [Descargar aquí](https://nodejs.org/).
*   **PostgreSQL**: El sistema de gestión de base de datos. [Descargar aquí](https://www.postgresql.org/download/).

### 2. Configuración de la Base de Datos

1.  **Inicia PostgreSQL**: Asegúrate de que tu servidor de base de datos PostgreSQL esté en ejecución.
2.  **Crea la Base de Datos**: Crea una nueva base de datos con el nombre `qr_registry`.
3.  **Verifica las Credenciales**: La aplicación está configurada para conectarse con las siguientes credenciales (definidas en el archivo `.env`). Asegúrate de que coincidan con la configuración de tu usuario de PostgreSQL:
    *   **Usuario**: `postgres`
    *   **Contraseña**: `3510`
    *   **Puerto**: `5432`

### 3. Configuración del Proyecto

1.  **Descarga el Proyecto**: Descarga el código fuente completo del proyecto como un archivo ZIP y descomprímelo en una carpeta en tu ordenador.
2.  **Abre en VS Code**: Abre la carpeta del proyecto en Visual Studio Code.
3.  **Instala las Dependencias**:
    *   Abre una nueva terminal dentro de VS Code (`Terminal` > `New Terminal`).
    *   Ejecuta el siguiente comando para instalar todos los paquetes y dependencias necesarios:
        ```bash
        npm install
        ```
    *   Este comando leerá el archivo `package.json` y descargará todo lo necesario (Next.js, React, pg, Tailwind CSS, etc.) en una carpeta llamada `node_modules`.

### 4. Ejecutar la Aplicación

1.  **Iniciar el Servidor de Desarrollo**: En la misma terminal de VS Code, ejecuta el siguiente comando:
    ```bash
    npm run dev
    ```
2.  **Abrir en el Navegador**: ¡Listo! El servidor se iniciará y podrás acceder a tu aplicación en la siguiente dirección: [http://localhost:9002](http://localhost:9002).

### 5. Crear y Poblar las Tablas de la Base de Datos

La primera vez que ejecutes el proyecto, la base de datos estará vacía.

1.  **Crear el Esquema**: El archivo `docs/schema.sql` contiene los comandos `CREATE TABLE` para todas las tablas que el sistema necesita. Puedes ejecutar este script en tu base de datos `qr_registry` para prepararla.
2.  **Poblar con Datos de Prueba**:
    *   Navega a la sección **Configuración del Sistema** dentro de la aplicación.
    *   Haz clic en el botón **"Poblar Base de Datos"**. Esta acción ejecutará un script que borrará las tablas existentes y las llenará con una gran cantidad de datos de prueba realistas para simular un entorno de producción.

### Archivos: ¿Qué transferir y qué no?

Debes transferir **todos los archivos** del proyecto descargado. Las únicas carpetas que podrías ignorar, ya que se generan automáticamente durante el proceso de instalación y ejecución, son:

*   `node_modules/`: Esta carpeta se crea al ejecutar `npm install`.
*   `.next/`: Esta carpeta se crea al ejecutar `npm run dev`.
