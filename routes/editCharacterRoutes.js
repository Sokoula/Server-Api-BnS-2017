import express from 'express';
import sql from 'mssql';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { configPlatformAcctDb, configBlGame01, configVirtualCurrencyDb, configLobbyDb } from '../config/dbConfig.js';

const router = express.Router();

// Обработчик маршрута для отображения страницы редактирования персонажа
router.get('/admin/edit-character', isAdmin, async (req, res) => {
  const { userName } = req.query;

  if (!userName) {
    return res.status(400).send('Отсутствует значение userName');
  }

  let pool = null;

  try {
    // Подключение к базе данных PlatformAcctDb для поиска UserId
    pool = await sql.connect(configPlatformAcctDb);

    let result = await pool.request()
      .input('userName', sql.NVarChar, userName)
      .query('SELECT UserId, UserName, LoginName, Created FROM Users WHERE UserName = @userName');

    let user = result.recordset[0];

    if (!user) {
      await pool.close();
      return res.status(404).send('Пользователь не найден');
    }

    await pool.close();

    // Подключение к базе данных BlGame01 для получения данных о персонажах
    pool = await sql.connect(configBlGame01);

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
              WHERE game_account_id = @game_account_id`);

    let creatures = result.recordset;

    await pool.close();

    // Подключение к базе данных VirtualCurrencyDb для получения данных о депозитах
    pool = await sql.connect(configVirtualCurrencyDb);

    result = await pool.request()
      .input('userId', sql.UniqueIdentifier, user.UserId)
      .query('SELECT DepositId, Amount, Balance FROM Deposits WHERE UserId = @userId');

    let deposits = result.recordset || [];
	
	// Вычисление общего баланса
    let totalBalance = deposits.reduce((acc, deposit) => acc + Number(deposit.Balance), 0);
	
    // Вычисление общей суммы Amount
    let totalAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.Amount), 0);

    await pool.close();

    // Рендеринг страницы редактирования персонажа с данными из GameAccountExp
    res.render('edit-character', {
      UserName: user.UserName,
      LoginName: user.LoginName,
      Created: user.Created,
      creatures: creatures,
      deposits: deposits,
	  totalBalance: totalBalance, // Передача общего баланса в шаблон
	  totalAmount: totalAmount, // Передача общей суммы Amount в шаблон
	  pathname: req.originalUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  } finally {
    // Гарантированное закрытие подключения
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
