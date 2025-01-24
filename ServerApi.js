import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import sql from 'mssql';
import cors from 'cors';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs'
import os from 'os';
import { fileURLToPath } from 'url';
import { config } from './config/config.js';
import { convertFaction, convertSex, convertRace, convertMoney, convertJob, cutStr } from './utils/dataTransformations.js';
import { getOwnerAccId } from './utils/characterUtils.js';
import { logRegistrationData } from './utils/logUtils.js';
import './utils/logger.js';
import { configPlatformAcctDb, configGradeMembersDb, configBlGame01, configVirtualCurrencyDb, configLobbyDb, WH_config } from './config/dbConfig.js';
import adminRoutes from './routes/adminRoutes.js';
import editCharacterRoutes from './routes/editCharacterRoutes.js';
import updateRoutes from './routes/updateRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import signupRoutes from './routes/signupRoutes.js';
import addDepositRoutes from './routes/addDepositRoutes.js';
import gameWorldRoutes from './routes/gameWorldRoutes.js';
import systemStatsRoutes from './routes/systemStatsRoutes.js';
import checkAvailabilityRoutes from './routes/checkAvailability.js';
import signinRoutes from './routes/signin.js';
import pageRoutes from './routes/pageRoutes.js';
import addBanRoutes from './routes/addBanRoutes.js';
import GradeMembersRoutes from "./routes/GradeMembersRoutes.js";
import kickUserRouter from './routes/kickUserRouter.js';
import WarehouseItemRoutes from './routes/WarehouseItemRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js'
import gameStatsRoute from './routes/gameStatsRoute.js';

dotenv.config();

const app = express();
const port = config.port;
const host = config.host;

// Установка заголовков для всех ответов
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store'); // Устанавливаем заголовок Cache-Control
  next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET, // Используем переменную окружения для секрета
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.SESSION_COOKIE_SECURE === 'true' } // Используем переменную окружения для флага secure
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));


// Middleware для удаления завершающего слэша для определённых маршрутов
app.use((req, res, next) => {
    // Проверяем, если путь длиннее одного символа и заканчивается на "/"
    if (req.path.length > 1 && req.path.endsWith('/')) {
        // Убираем завершающий слэш и перенаправляем на правильный путь
        const newPath = req.path.slice(0, -1) + req.url.slice(req.path.length);
        return res.redirect(301, newPath);
    }
    next();
});

// Подключение маршрутов
const routesWithRootPrefix = [
  adminRoutes,
  editCharacterRoutes,
  updateRoutes,
  profileRoutes,
  signupRoutes,
  addDepositRoutes,
  gameWorldRoutes,
  systemStatsRoutes,
  pageRoutes,
  addBanRoutes,
  GradeMembersRoutes,
  WarehouseItemRoutes,
  monitoringRoutes,
  gameStatsRoute,
];

// Подключение маршрутов с префиксом "/"
routesWithRootPrefix.forEach(route => app.use('/', route));

// Подключение маршрутов с другими префиксами
app.use('/check-availability', checkAvailabilityRoutes);
app.use('/signin', signinRoutes);
app.use('/in-game-web', express.static(path.join(__dirname, './views/in-game-web')));
app.use(kickUserRouter); // Маршрут для кика


// Проверка переменной окружения для логирования в консоль
const logToConsole = process.env.LOG_TO_CONSOLE === 'true';

// Инициализация пула соединений для каждой базы данных
let poolPlatformAcctDb;
let poolBlGame01;
let poolVirtualCurrencyDb;
let poolWH;
let poolLobbyDb; // Переменная для LobbyDB

async function initializePools() {
    try {
        poolPlatformAcctDb = await sql.connect(configPlatformAcctDb);
        console.log(chalk.green('Connection to PlatformAcctDb established successfully.'));

        poolBlGame01 = await sql.connect(configBlGame01);
        console.log(chalk.green('Connection to BlGame01 established successfully.'));

        poolVirtualCurrencyDb = await sql.connect(configVirtualCurrencyDb);
        console.log(chalk.green('Connection to VirtualCurrencyDb established successfully.'));

        poolWH = await sql.connect(WH_config);
        console.log(chalk.green('Connection to WH established successfully.'));

        poolLobbyDb = await sql.connect(configLobbyDb); // Инициализация пула для LobbyDB
        console.log(chalk.green('Connection to LobbyDb established successfully.'));

        // poolGame = await sql.connect(Game_config); // Инициализация пула для базы данных Game
        // console.log(chalk.green('Connection to Game established successfully.'));
    } catch (err) {
        console.error(chalk.red('Error during connection pool initialization:', err));
        throw err; // Пробрасываем ошибку для обработки на более высоком уровне
    }
}

// Вызов функции инициализации
// initializePools()
//     .then(() => {
//         console.log('All connection pools have been successfully initialized');
//         // Здесь можно добавить дополнительную логику, например, проверку доступности баз данных
//     })
//     .catch(err => {
//         console.error('Error during connection pool initialization:', err);
//         process.exit(1); // Прекращаем работу приложения, если инициализация пула не удалась
//     });

app.get('/api/current-time', (req, res) => {
    const currentTime = new Date();
    res.json({ currentTime: currentTime.toISOString() }); // Отправляем время в формате ISO
});

app.get('/', (req, res) => {
    const user = req.session.user || null; // Предполагаем, что информация о пользователе хранится в сессии
    res.render('index', { user }); // Передаем объект user в шаблон
});

app.get('/admin/add-vip', (req, res) => {
    console.log("Original URL:", req.originalUrl); // Вывод полного URL
    console.log("UserId:", req.query.userId); // Вывод userId

    res.render('addVip', {
        pathname: req.originalUrl,
        userId: req.query.userId
    });
});

// Обработчик для всех несуществующих маршрутов (404)
app.use((req, res) => {
  res.status(404).render('404'); // Рендерим страницу 404
});

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const interfaceKey in interfaces) {
        for (const interfaceInfo of interfaces[interfaceKey]) {
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                return interfaceInfo.address;
            }
        }
    }
    return '127.0.0.1'; // Возвращаем localhost, если IP не найден
}

// Получаем локальный IP
const localIp = getLocalIp();

// Настраиваем доменное имя (если есть)
const domainName = 'example.com'; // Укажите доменное имя или оставьте пустым: ''

// Получаем ширину консоли
const consoleWidth = process.stdout.columns || 80;

// Функция для центрирования текста
function centerText(text, maxWidth) {
    const padding = Math.max(0, Math.floor((consoleWidth - maxWidth) / 2));
    return ' '.repeat(padding) + text;
}

// Функция для выравнивания строки внутри рамки
function padLine(content, maxContentLength) {
    const padding = maxContentLength - content.length; // Вычисляем недостающие пробелы
    const leftPadding = Math.floor(padding / 2); // Оставляем часть слева
    const rightPadding = padding - leftPadding; // Остальное справа
    return ' '.repeat(leftPadding) + content + ' '.repeat(rightPadding);
}

// Устанавливаем рамку и максимальную длину содержимого
const border = "██";
const maxContentLength = 51; // Длина содержимого внутри рамки (с учётом пробелов)

// Составляем строки
const lines = [
    "███████████████████████████████████████████████████████",
    `${border}${padLine('', maxContentLength)}${border}`,
    `${border}${padLine('B&S API SERVER 2017 STARTING NOW', maxContentLength)}${border}`,
    `${border}${padLine('SERVER IS RUNNING ON PORT: 3000', maxContentLength)}${border}`,
    `${border}${padLine(`LOCAL IP ADDRESS: ${localIp}`, maxContentLength)}${border}`,
    domainName
        ? `${border}${padLine(`DOMAIN NAME: ${domainName}`, maxContentLength)}${border}`
        : `${border}${padLine('DOMAIN NAME: Not Configured', maxContentLength)}${border}`,
    `${border}${padLine('ACCESS IT VIA: http://0.0.0.0:3000', maxContentLength)}${border}`,
    `${border}${padLine('', maxContentLength)}${border}`,
    "███████████████████████████████████████████████████████"
];

// Выводим строки по центру
lines.forEach(line => {
    console.warn(chalk.bold(centerText(line, lines[0].length)));
});

// Пустая строка между секциями
console.log(); // или console.log('');

// Запуск сервера
app.listen(port, host, () => {
    console.log(chalk.bgGreen(`B&S Api Server is running on ${host}:${port} (Local IP: ${chalk.blue(`${localIp}:${port}`)})`));
});
