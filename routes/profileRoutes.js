// /routes/profileRoutes.js
import express from 'express';
import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { configPlatformAcctDb, configBlGame01, configVirtualCurrencyDb } from '../config/dbConfig.js';
import { convertFaction, convertSex, convertRace, convertMoney, convertJob } from '../utils/dataTransformations.js';
import { getVipLevelByUserIdAndAppGroupCode, getSubscriptionDetails} from './GradeMembersRoutes.js';

const router = express.Router();

// Обработчик маршрута для профиля пользователя
router.get('/profile', async (req, res) => {
	const {
		userName
	} = req.query;

	let pool = null;

	try {
		// Подключение к базе данных PlatformAcctDb
		pool = await sql.connect(configPlatformAcctDb);

		// Запрос для получения UserId по UserName
		let result = await pool.request()
			.input('userName', sql.NVarChar, userName)
			.query('SELECT UserId, UserName, LoginName, Created FROM Users WHERE UserName = @userName');

		let user = result.recordset[0];

		if (!user) {
			return res.status(404).send('Пользователь не найден');
		}

		// Закрываем соединение с первой базой данных
		await pool.close();

		// Подключение к базе данных BlGame01
		pool = await sql.connect(configBlGame01);

		// Обновлённый запрос для таблицы CreatureProperty
		result = await pool.request()
			.input('game_account_id', sql.UniqueIdentifier, user.UserId)
			.query(`SELECT 
                pcid, game_account_id, world_id, race, sex, job, 
                name, level, exp, exp_boost, mastery_level, mastery_exp, mastery_penalty_exp, 
                hp, money, money_diff, faction, faction2, faction_reputation, 
                achievement_id, achievement_step, ability_achievement_id, ability_achievement_step,
                enter_world_duration, combat_duration, inventory_size, depository_size, wardrobe_size,
                builder_right, production_1, production_2, gathering_1, gathering_2,
                production_1_exp, production_2_exp, gathering_1_exp, gathering_2_exp,
                duel_point, party_battle_point, field_play_point, shop_sale_count, heart_count
              FROM CreatureProperty 
              WHERE game_account_id = @game_account_id AND deletion != 1`);

		let creatures = result.recordset;

		if (!creatures || creatures.length === 0) {
			creatures = null;
		} else {
			// Преобразование данных персонажей
			creatures = creatures.map(creature => {
				const convertedFaction = convertFaction(creature.faction);
				const convertedMoney = convertMoney(creature.money);
				const convertedSex = convertSex(creature.sex);
				const convertedRace = convertRace(creature.race);
				const convertedJob = convertJob(creature.job);

				return {
					...creature,
					faction: convertedFaction.name,
					factionImageUrl: convertedFaction.imageUrl,
					sex: convertedSex.name,
					sexImageUrl: convertedSex.imageUrl,
					race: convertedRace.name,
					raceImageUrl: convertedRace.imageUrl,
					job: convertedJob.name,
					jobImageUrl: convertedJob.imageUrl,
					money: convertedMoney,
				};
			});
		}

		// Закрываем соединение с базой данных BlGame01
		await pool.close();

		// Подключение к базе данных VirtualCurrencyDb
		pool = await sql.connect(configVirtualCurrencyDb);

		// Запрос для получения данных о депозитах
		result = await pool.request()
			.input('userId', sql.UniqueIdentifier, user.UserId)
			.query('SELECT Amount, Balance FROM Deposits WHERE UserId = @userId');

		let deposits = result.recordset;

		if (!deposits || deposits.length === 0) {
			deposits = [];
		}

		// Вычисление общего баланса и суммы
		let totalBalance = deposits.reduce((acc, deposit) => acc + Number(deposit.Balance), 0);
		let totalAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.Amount), 0);

		// Закрываем соединение с VirtualCurrencyDb
		await pool.close();

		// Получаем VIP уровень пользователя
		const vipLevel = await getVipLevelByUserIdAndAppGroupCode(user.UserId, 'bnsgrnTH');
		const subscriptionDetails = await getSubscriptionDetails(user.UserId);

		// Определяем статус
		const statusMessage = vipLevel ?
			{
				message: 'VIP Active',
				color: 'lightgreen',
				imageUrl: '/images/shop/vip-active.png'
			} // Активна - салатный, с изображением
			:
			{
				message: 'No VIP subscription',
				color: 'grey'
			}; // Не активна - серый, с изображением

		// Форматируем дату в нужный формат
		const formattedCreated = new Date(user.Created).toLocaleString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});

		const avatarsFilePath = './avatars.json';

		let currentAvatar = 'user-avatar.jpg'; // Дефолтный аватар

		try {
			// Проверяем существование файла avatars.json
			if (fs.existsSync(avatarsFilePath)) {
				const avatarsData = JSON.parse(await fs.promises.readFile(avatarsFilePath, 'utf8'));
				currentAvatar = avatarsData[user.UserName] || currentAvatar;
			} else {
				if (process.env.LOG_TO_CONSOLE === 'true') {
					// console.warn('avatars.json not found. Using default avatar.'); //for development
				}
			}
		} catch (err) {
			if (process.env.LOG_TO_CONSOLE === 'true') {
				// console.error('Error reading avatars.json:', err.message); //for development
			}
		}

		// Отправляем данные в шаблон
		res.render('profile', {
			UserName: user.UserName,
			LoginName: user.LoginName,
			Created: formattedCreated,
			creatures: creatures,
			deposits: deposits,
			totalBalance: totalBalance,
			totalAmount: totalAmount,
			vipLevel: vipLevel || 'Not set', // Передача VIP уровня
			statusMessage: statusMessage,
			expirationDate: subscriptionDetails ? subscriptionDetails.ExpirationDateTime : null, // Передача даты окончания подписки
			currentAvatar: currentAvatar // Передача правильного аватара
		});

	} catch (err) {
		if (process.env.LOG_TO_CONSOLE === 'true') {
			console.error(err);
		}
		res.status(500).send('Ошибка сервера');
	} finally {
		if (pool) {
			try {
				await pool.close();
			} catch (err) {
				console.error('Ошибка при закрытии подключения к базе данных:', err.message);
			}
		}
	}
});

router.post('/api/profile/avatar', async (req, res) => {
	const {
		userName,
		avatar
	} = req.body;

	if (!avatar || !userName) {
		// console.error('Invalid request: Missing userName or avatar.'); //for development
		return res.status(400).send('Invalid request: userName and avatar are required.');
	}

	const avatarsFilePath = path.join(process.cwd(), 'avatars.json'); // Абсолютный путь

	try {
		let avatarsData = {};

		// Проверка, существует ли файл avatars.json
		if (fs.existsSync(avatarsFilePath)) {
			avatarsData = JSON.parse(await fs.promises.readFile(avatarsFilePath, 'utf8'));
		} else {
			// console.warn('avatars.json not found. Creating a new one.'); //for development
			// Если файла нет, создаем новый
			await fs.promises.writeFile(avatarsFilePath, JSON.stringify({}, null, 2), 'utf8');
		}

		avatarsData[userName] = avatar;

		// Записываем обновленные данные
		await fs.promises.writeFile(avatarsFilePath, JSON.stringify(avatarsData, null, 2), 'utf8');

		res.status(200).send('Avatar updated successfully.');
	} catch (err) {
		// console.error('Error processing avatar update:', err.message); //for development
		res.status(500).send('Server error while updating avatar.');
	}
});

router.get('/avatars', async (req, res) => {
	try {
		const avatarsDir = path.join(process.cwd(), 'public/images/avatars'); // Изменено на абсолютный путь
		const files = await fs.promises.readdir(avatarsDir);
		const avatars = files.filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file) && file !== 'user-avatar.jpg'); // Исключаем 'user-avatar.jpg'
		res.json({
			success: true,
			avatars
		});
	} catch (err) {
		if (process.env.LOG_TO_CONSOLE === 'true') {
			// console.error('Error reading avatars directory:', err); //for development
		}
		res.status(500).json({
			success: false,
			message: 'Error loading avatars.'
		});
	}
});

export default router;