-- Этот скрипт выполняет восстановление базы данных GameItemsDB из резервной копии.
-- This script restores the GameItemsDB database from a backup file.

-- Переключаемся на системную базу данных master.
-- Switch to the master database.
USE master;
GO

-- Переводим базу данных GameItemsDB в режим одного пользователя, чтобы завершить все активные подключения.
-- Set the GameItemsDB database to single-user mode to terminate all active connections.
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'GameItemsDB')
BEGIN
    ALTER DATABASE GameItemsDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    PRINT 'Database GameItemsDB is set to SINGLE_USER mode.';
END;
GO

-- Выполняем восстановление базы данных из указанного файла резервной копии.
-- Restore the database from the specified backup file.
RESTORE DATABASE GameItemsDB
FROM DISK = 'D:\Server-Api-BnS-2017\GAME_ITEMS_DB\GameItemsDB.bak' -- Путь к файлу резервной копии (.bak). -- Path to the backup file (.bak).

WITH
    -- Задаём путь для основного файла данных (.mdf) после восстановления.
    -- Specifies the path for the main data file (.mdf) after restoration.
    MOVE 'GameItemsDB' TO 'D:\DataDB_2017\GameItemsDB.mdf',
    
    -- Задаём путь для журнала транзакций (.ldf) после восстановления.
    -- Specifies the path for the transaction log file (.ldf) after restoration.
    MOVE 'GameItemsDB_log' TO 'D:\DataDB_2017\GameItemsDB_log.ldf',

    -- Указываем параметр REPLACE, чтобы заменить существующую базу данных.
    -- The REPLACE option is used to overwrite the existing database, if it exists.
    REPLACE,

    -- Параметр STATS выводит информацию о ходе выполнения операции каждые 10%.
    -- The STATS option displays progress updates every 10%.
    STATS = 10;
GO

-- Возвращаем базу данных GameItemsDB в режим многопользовательского доступа.
-- Set the GameItemsDB database back to multi-user mode.
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'GameItemsDB')
BEGIN
    ALTER DATABASE GameItemsDB SET MULTI_USER;
    PRINT 'Database GameItemsDB is set to MULTI_USER mode.';
END;
GO
