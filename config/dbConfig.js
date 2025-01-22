// config/dbConfig.js
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Настройки подключения к базе данных PlatformAcctDb
const configPlatformAcctDb = {
  user: process.env.PLATFORM_ACCT_DB_USER,
  password: process.env.PLATFORM_ACCT_DB_PASSWORD,
  server: process.env.PLATFORM_ACCT_DB_SERVER,
  database: process.env.PLATFORM_ACCT_DB_DATABASE,
  options: {
    encrypt: false, // Отключаем шифрование
    trustServerCertificate: true, // Доверять самоподписанным сертификатам
    enableArithAbort: true // Явно устанавливаем значение для предотвращения предупреждения
  },
};

// Настройки подключения к базе данных GradeMembersDb
const configGradeMembersDb = {
  user: process.env.GRADE_MEMBERS_DB_USER,
  password: process.env.GRADE_MEMBERS_DB_PASSWORD,
  server: process.env.GRADE_MEMBERS_DB_SERVER,
  database: process.env.GRADE_MEMBERS_DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const configBanDb = {
  user: process.env.BAN_DB_USER,
  password: process.env.BAN_DB_PASSWORD,
  server: process.env.BAN_DB_SERVER,
  database: process.env.BAN_DB_DATABASE,
  options: {
    encrypt: false, // Отключаем шифрование
    trustServerCertificate: true, // Доверять самоподписанным сертификатам
    enableArithAbort: true // Явно устанавливаем значение для предотвращения предупреждения
  },
};

// Настройки подключения к базе данных BlGame01
const configBlGame01 = {
  user: process.env.BLGAME01_DB_USER,
  password: process.env.BLGAME01_DB_PASSWORD,
  server: process.env.BLGAME01_DB_SERVER,
  database: process.env.BLGAME01_DB_DATABASE,
  options: {
    encrypt: false, // Отключаем шифрование
    trustServerCertificate: true, // Доверять самоподписанным сертификатам
    enableArithAbort: true // Явно устанавливаем значение для предотвращения предупреждения
  },
};

// Настройки подключения к базе данных VirtualCurrencyDb
const configVirtualCurrencyDb = {
  user: process.env.VIRTUAL_CURRENCY_DB_USER,
  password: process.env.VIRTUAL_CURRENCY_DB_PASSWORD,
  server: process.env.VIRTUAL_CURRENCY_DB_SERVER,
  database: process.env.VIRTUAL_CURRENCY_DB_DATABASE,
  options: {
    encrypt: false, // Отключаем шифрование
    trustServerCertificate: true, // Доверять самоподписанным сертификатам
    enableArithAbort: true // Явно устанавливаем значение для предотвращения предупреждения
  },
};

// Настройки подключения к базе данных LobbyDB
const configLobbyDb = {
  user: process.env.LOBBY_DB_USER,
  password: process.env.LOBBY_DB_PASSWORD,
  server: process.env.LOBBY_DB_SERVER,
  database: process.env.LOBBY_DB_DATABASE, // Проверьте, что здесь указана правильная база данных
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
};

// Настройки подключения к WH базе данных
const WH_config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Настройки подключения к базе данных GameWarehouseDB
const configGameWarehouseDB = {
  user: process.env.GAME_WAREHOUSE_DB_USER,
  password: process.env.GAME_WAREHOUSE_DB_PASSWORD,
  server: process.env.GAME_WAREHOUSE_DB_SERVER,
  database: process.env.GAME_WAREHOUSE_DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// Настройки подключения к базе данных LevelDb
const configLevelDb = {
  user: process.env.LEVEL_DB_USER,
  password: process.env.LEVEL_DB_PASSWORD,
  server: process.env.LEVEL_DB_SERVER,
  database: process.env.LEVEL_DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// Настройки подключения к базе данных GameItemsDB
const configGameItemsDB = {
  user: process.env.GAME_ITEMS_DB_USER,
  password: process.env.GAME_ITEMS_DB_PASSWORD,
  server: process.env.GAME_ITEMS_DB_SERVER,
  database: process.env.GAME_ITEMS_DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

export {
  configPlatformAcctDb,
  configGradeMembersDb,
  configBlGame01,
  configVirtualCurrencyDb,
  configLobbyDb,
  WH_config,
  configBanDb,
  configGameWarehouseDB,
  configLevelDb,
  configGameItemsDB,
};
