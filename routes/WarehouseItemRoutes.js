// routes/WarehouseItemRoutes.js
import express from 'express';
import sql from 'mssql';
import chalk from 'chalk';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { configBlGame01, configGameWarehouseDB, configGameItemsDB } from '../config/dbConfig.js';

const router = express.Router();

// Инициализация начального номера предмета
let currentItemNumber = 182;

// Функция для получения следующего номера предмета
async function getNextItemNumber() {
  const nextNumber = currentItemNumber;

  // Логика циклического переключения между номерами
  if (currentItemNumber === 182) {
    currentItemNumber = 185;
  } else if (currentItemNumber === 185) {
    currentItemNumber = 186;
  } else if (currentItemNumber === 186) {
    currentItemNumber = 226;
  } else {
    currentItemNumber = 182; // Возврат к началу
  }

  return nextNumber;
}

// Функция для получения ID аккаунта владельца персонажа
async function getOwnerAccountId(charname) {
  const pool = await sql.connect(configBlGame01);
  const result = await pool
    .request()
    .input('charname', sql.NVarChar, charname)
    .query("SELECT game_account_id FROM CreatureProperty WHERE name = @charname");

  await pool.close();

  const ownerAccountID = result.recordset[0]?.game_account_id;
  if (!ownerAccountID) {
    throw new Error("Имя персонажа не найдено.");
  }

  return ownerAccountID.toString();
}

// Функция для регистрации предмета в базе данных
async function registerItem(ownerAccountID, goodsID, itemID, quantity, senderDescription, senderMessage) {
  const pool = await sql.connect(configGameWarehouseDB);

  // Получение следующего номера предмета
  const itemNumber = await getNextItemNumber();

  // Выполнение процедуры регистрации предмета
  const result = await pool
    .request()
    .input('OwnerAccountID', sql.UniqueIdentifier, ownerAccountID)
    .input('GoodsID', sql.BigInt, goodsID)
    .input('GoodsNumber', sql.Int, 233)
    .input('SenderDescription', sql.NVarChar, senderDescription || null)
    .input('SenderMessage', sql.NVarChar, senderMessage || null)
    .input('PurchaseTime', sql.DateTime, new Date())
    .input('GoodsItemNumber_1', sql.Int, itemNumber)
    .input('ItemDataID_1', sql.Int, itemID)
    .input('ItemAmount_1', sql.Int, quantity)
    .input('UsableDuration_1', sql.Int, null)
    .output('NewLabelID', sql.BigInt)
    .execute('usp_TryWarehouseRegistration');

  const newLabelID = result.output.NewLabelID;

  // Обновление состояния предметов после регистрации
  await updateItemStates(newLabelID);

  await pool.close();
  return newLabelID;
}

// Функция для обновления состояния предметов в базе данных
async function updateItemStates(labelID) {
  const pool = await sql.connect(configGameWarehouseDB);

  // Обновление состояния в таблице WarehouseGoods
  await pool
    .request()
    .input('LabelID', sql.BigInt, labelID)
    .query('UPDATE WarehouseGoods SET RegistrationState = 2 WHERE LabelID = @LabelID');

  // Обновление состояния в таблице WarehouseItem
  await pool
    .request()
    .input('LabelID', sql.BigInt, labelID)
    .query('UPDATE WarehouseItem SET ItemState = 1 WHERE LabelID = @LabelID');

  await pool.close();
}

// Функция для получения следующего уникального GoodsID
async function getNextGoodsID() {
  const pool = await sql.connect(configGameWarehouseDB);

  // Получение максимального значения GoodsID
  const result = await pool
    .request()
    .query('SELECT MAX(CAST(GoodsID AS BIGINT)) AS MaxGoodsID FROM WarehouseGoods');

  let maxGoodsID = result.recordset[0].MaxGoodsID || 0;
  maxGoodsID = parseInt(maxGoodsID.toString().slice(-5)) + 1;

  await pool.close();
  return `${Math.floor(maxGoodsID / 100000)}${maxGoodsID % 100000}`;
}

// Роут для отображения интерфейса добавления предмета
router.get('/admin/add-item', isAdmin, async (req, res) => {
  const { userId, charname } = req.query;

  // Проверка наличия UserID
  if (!userId) {
    return res.status(400).send('Не указан UserID.');
  }

  try {
    const poolGameDB = await sql.connect(configBlGame01);
    const poolItemsDB = await sql.connect(configGameItemsDB);

    // Параллельное получение данных персонажей и категорий предметов
    const [charactersResult, categoriesResult] = await Promise.all([
      poolGameDB
        .request()
        .input('userId', sql.UniqueIdentifier, userId)
        .query('SELECT name FROM CreatureProperty WHERE game_account_id = @userId'),
      poolItemsDB.request().query(`
        USE GameItemsDB;
        SELECT 
          c.CategoryID,
          c.CategoryName,
          c.SubCategoryName,
          i.ItemID,
          i.Alias,
          i.EN_Description,
          i.CN_Description,
          i.FileName
        FROM 
          dbo.ItemCategories c
        LEFT JOIN 
          dbo.GameItems i ON c.CategoryID = i.CategoryID
        ORDER BY 
          c.CategoryName, c.SubCategoryName, i.ItemID
      `),
    ]);

    // Формирование списков персонажей и категорий
    const characters = charactersResult.recordset.map((row) => row.name);
    const categories = categoriesResult.recordset.reduce((acc, row) => {
      const categoryKey = `${row.CategoryName} - ${row.SubCategoryName || 'General'}`;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      if (row.ItemID) {
        acc[categoryKey].push({
          ItemID: row.ItemID,
          Alias: row.Alias,
          EN_Description: row.EN_Description,
          CN_Description: row.CN_Description,
          FileName: row.FileName,
        });
      }
      return acc;
    }, {});

    await poolGameDB.close();
    await poolItemsDB.close();

    // Отображение шаблона с переданными данными
    res.render('warehouseItem', { 
      characters, 
      categories, 
      userId: userId,
      gameAccountId: charname ? await getOwnerAccountId(charname) : null,
      pathname: req.originalUrl 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Произошла ошибка при обработке данных.');
  }
});

// Роут для обработки запроса на добавление предмета
router.get('/process', isAdmin, async (req, res) => {
  const { itemid, charname, quantity, senderDescription, senderMessage } = req.query;

  // Логирование данных при включенном флаге LOG_TO_CONSOLE
  if (process.env.LOG_TO_CONSOLE === 'true') {
    console.log(chalk.green(`Character ${chalk.yellow(`${charname}`)} was sent item ItemID ${chalk.yellow(`${itemid}`)} in quantity ${chalk.yellow(`${quantity}`)} unit.`));
  }

  // Проверка обязательных параметров запроса
  if (!itemid || !charname || !quantity || isNaN(itemid) || isNaN(quantity) || quantity <= 0) {
    return res.status(400).send('Item ID, Quantity или Character Name не заполнены корректно.');
  }

  try {
    // Получение ID аккаунта владельца
    const ownerAccountID = await getOwnerAccountId(charname);
    if (!ownerAccountID) {
      return res.status(404).send('Имя персонажа не найдено.');
    }

    // Получение уникального GoodsID
    const newGoodsID = await getNextGoodsID();

    // Регистрация предмета
    const labelID = await registerItem(ownerAccountID, newGoodsID, itemid, parseInt(quantity), senderDescription, senderMessage);

    // Ответ клиенту
    res.send(`LabelID=${labelID}<br>Item добавлен. Пожалуйста, повторно войдите в игру.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Произошла ошибка при обработке запроса.');
  }
});

export default router;
