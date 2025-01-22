// /routes/addBanRoutes.js
import express from 'express';
import sql from 'mssql';
import { configPlatformAcctDb, configBanDb } from '../config/dbConfig.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import path from 'path';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const router = express.Router();

// Функция для проверки существования UserId
async function check_user_id(userId) {
	let pool;
	try {
		pool = await sql.connect(configPlatformAcctDb); // Подключение к базе данных
		const result = await pool.request()
			.input('userId', sql.VarChar, userId)
			.query('SELECT UserId FROM Users WHERE UserId = @userId');
		return result.recordset.length > 0;
	} catch (err) {
		if (process.env.LOG_TO_CONSOLE === 'true') {
			console.error('Error connecting to database:', err);
		}
		throw err;
	} finally {
		if (pool) {
			await pool.close(); // Закрываем соединение
		}
	}
}

// Функция для получения текущей версии сервиса
async function getCurrentVersion() {
	try {
		const response = await axios.get('http://127.0.0.1:6605/apps-state');
		const xmlData = response.data;
		const parsedData = await parseStringPromise(xmlData);

		// Ищем нужное приложение
		const apps = parsedData?.Info?.Apps?.[0]?.App;
		let version = null;

		for (const app of apps) {
			if (app?.AppName?.[0] === "BanSrv") {
				const instances = app?.Instances?.[0]?.Instance;
				if (instances && instances.length > 0) {
					version = instances[0]?.Epoch?.[0];
					break;
				}
			}
		}

		if (!version) {
			throw new Error('Version not found for BanSrv');
		}

		return version;
	} catch (error) {
		console.error('Error fetching current version:', error.message);
		throw new Error('Failed to fetch current version');
	}
}

// Функция для перезапуска сервиса
async function restartService(version) {
	try {
		const stopUrl = `http://127.0.0.1:6605/apps/1108.1.1.${version}/stop?_method=post`;
		await axios.post(stopUrl);
		if (process.env.LOG_TO_CONSOLE === 'true') {
			console.log('BanSrv service has been successfully restarted and will be available in 3 minutes..');
		}
	} catch (error) {
		console.error('Error restarting service:', error.message);
	}
}

// Главный маршрут для отображения страницы добавления бана
router.get('/admin/add-ban', isAdmin, async (req, res) => {
	const {
		userId
	} = req.query;

	if (!userId) {
		return res.status(400).send('Missing UserId value');
	}

	const userExists = await check_user_id(userId);
	if (!userExists) {
		return res.send('User with this ID not found.');
	}

	let bans = [];
	let banReasons = [];
	let pool;

	try {
		pool = await sql.connect(configBanDb);

		// Получение списка активных банов
		const banResult = await pool.request()
			.input('userId', sql.UniqueIdentifier, userId)
			.query(`
               SELECT 
               B.BanId, 
               B.EffectiveFrom, 
               B.EffectiveTo, 
               R.BanReason AS BanReason, -- Подставляем текст причины вместо BanPolicyId
               B.UnbanStatus
               FROM [dbo].[BannedUsers] AS B
               LEFT JOIN [dbo].[BanPolicies] AS P ON B.BanPolicyId = P.BanPolicyId
               LEFT JOIN [dbo].[BanReasons] AS R ON P.BanReasonCode = R.BanReasonCode
               LEFT JOIN [dbo].[BannedUserExtensions] AS BE ON B.BanId = BE.BanId
               WHERE B.UserId = @userId;
            `);

		bans = banResult.recordset || [];

		// Получение списка причин блокировок
		const reasonResult = await pool.request().query(`
            SELECT BanReasonCode, BanReason 
            FROM [dbo].[BanReasons];
        `);

		banReasons = reasonResult.recordset || [];
	} catch (error) {
		console.error('Error while receiving data:', error.message);
	} finally {
		if (pool) {
			await pool.close();
		}
	}

	// Передаем данные в шаблон
	res.render('addBan', {
		userId,
		bans,
		banReasons,
		pathname: req.path
	});
});

// Маршрут для обработки добавления бана
router.post('/admin/add-ban', isAdmin, async (req, res) => {
	const {
		userId,
		reason,
		duration
	} = req.body;

	if (!userId || !reason || !duration) {
		return res.status(400).send('Please provide userId, ban reason and duration');
	}

	let pool;
	try {
		pool = await sql.connect(configBanDb);

		// Получаем соответствующий BanPolicyId
		const policyResult = await pool.request()
			.input('BanReasonCode', sql.Int, reason)
			.query(`
                SELECT BanPolicyId
                FROM [dbo].[BanPolicies]
                WHERE BanReasonCode = @BanReasonCode;
            `);

		const banPolicyId = policyResult.recordset.length > 0 ? policyResult.recordset[0].BanPolicyId : 3; // Если не нашли, берем 3 по умолчанию

		const EffectiveFrom = new Date().toISOString();
		let EffectiveTo;

		// Если длительность указана как "permanent", устанавливаем срок на 70 лет
		if (duration === 'permanent') {
			EffectiveTo = new Date(new Date().setFullYear(new Date().getFullYear() + 70)).toISOString();
		} else {
			// Иначе считаем как часы
			EffectiveTo = new Date(new Date().getTime() + parseInt(duration) * 60 * 60 * 1000).toISOString();
		}

		// Добавление данных в базу
		await pool.request()
			.input('UserId', sql.UniqueIdentifier, userId)
			.input('AppGroupId', sql.Int, 472)
			.input('BanPolicyId', sql.Int, banPolicyId)
			.input('EffectiveFrom', sql.DateTimeOffset, EffectiveFrom)
			.input('EffectiveTo', sql.DateTimeOffset, EffectiveTo)
			.query(`
                INSERT INTO [dbo].[BannedUsers] 
                ([UserId], [AppGroupId], [BanPolicyId], [EffectiveFrom], [EffectiveTo], [UnbanStatus], [UnbanStatusChanged]) 
                VALUES 
                (@UserId, @AppGroupId, @BanPolicyId, @EffectiveFrom, @EffectiveTo, 1, @EffectiveFrom);

                DECLARE @BanId INT = SCOPE_IDENTITY();

                INSERT INTO [dbo].[BannedUserExtensions]
                (BanId, UnbannerType, UnbannerLoginName, Unbanned, EffectiveUntil, IsAccumulative, 
                 RegistrarPriorityLevel, RegistrarType, RegistrarLoginName, RegistrarMemo, Registered, WorldCode, CharName)
                VALUES
                (@BanId, 0, 'accountadmin', NULL, SYSDATETIMEOFFSET(), 0, 0, 1, 'accountadmin', 'undefined', SYSDATETIMEOFFSET(), NULL, NULL);
            `);

		// Получаем текущую версию и перезапускаем сервис
		const currentVersion = await getCurrentVersion();
		await restartService(currentVersion);

		res.send(duration === 'permanent' ? 'The user is permanently blocked' : 'User blocked');
	} catch (err) {
		console.error(err);
		res.status(500).send('There was an error adding the ban.');
	} finally {
		if (pool) {
			await pool.close();
		}
	}
});

export default router;