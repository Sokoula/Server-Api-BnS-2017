import express from 'express';
import sql from 'mssql';
import { configPlatformAcctDb, configBlGame01, configVirtualCurrencyDb } from '../config/dbConfig.js';
import { convertFaction, convertSex, convertRace, convertMoney, convertJob } from '../utils/dataTransformations.js';

const router = express.Router();

// Обработчик маршрута для профиля пользователя
router.get('/profile', async (req, res) => {
  const { userName } = req.query;

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

    // Отправляем данные в шаблон
    res.render('profile', {
      UserName: user.UserName,
      LoginName: user.LoginName,
      Created: user.Created,
      creatures: creatures,
      deposits: deposits,
      totalBalance: totalBalance,
      totalAmount: totalAmount,
    });
  } catch (err) {
    console.error(err);
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

export default router;
