// routes/monitoringRoutes.js
import express from 'express';
import axios from 'axios';
import xml2js from 'xml2js';
import { isAdmin } from '../middleware/adminMiddleware.js'; // Проверка, является ли пользователь администратором

const router = express.Router();

// Получаем текущую версию PresenceSrv
const getPresenceSrvVersion = async () => {
    try {
        const targetUrl = 'http://192.168.0.114:6605/spawned/PresenceSrv.1.$/users'; // Версия указана как $

        const response = await axios.get(targetUrl, { timeout: 5000 });

        return response.status === 200 ? '$' : null;
    } catch (error) {
        console.error('Error fetching version or PresenceSrv is not running:', error.message);
        return null;
    }
};

// Функция для извлечения информации о пользователях
const extractUserInfo = (data) => {
    const objectData = data?.Info?.Object || [];

    // Если objectData — это объект, преобразуем его в массив
    const normalizedObjectData = Array.isArray(objectData) ? objectData : [objectData];

    const usersMap = new Map();

    normalizedObjectData.forEach(({ Data: user }) => {
        if (!user) return; // Пропускаем, если данных нет

        const logins = user?.Logins?.Login || [];
        const pcname =
            user?.AppDataSet?.AppData?.find(appData => appData.Data?.pcname)?.Data?.pcname || 'N/A';

        logins.forEach(({ GameCode, ClientNetAddress, LoginTime }) => {
            const userId = user.UserId;

            if (usersMap.has(userId)) {
                usersMap.get(userId).Logins += 1;
            } else {
                usersMap.set(userId, {
                    UserCenter: user.UserCenter || 'N/A',
                    GameCode: GameCode || 'N/A',
                    UserId: user.UserId || 'N/A',
                    UserName: user.UserName || 'N/A',
                    PcName: pcname,
                    ClientNetAddress: ClientNetAddress || 'N/A',
                    LoginTime: LoginTime || 'N/A',
                    Status: user.Status || 'N/A',
                    Logins: 1,
                });
            }
        });
    });

    return Array.from(usersMap.values());
};


// Маршрут для отображения информации
router.get('/admin/monitoring', isAdmin, async (req, res) => {
    try {
        const currentVersion = await getPresenceSrvVersion();
        if (!currentVersion) return res.status(500).send('Error fetching version or PresenceSrv is not running');

        const targetUrl = `http://192.168.0.114:6605/spawned/PresenceSrv.1.${currentVersion}/users`;
        const response = await axios.get(targetUrl, { timeout: 5000 });

        if (response.headers['content-type'].includes('xml')) {
            const parser = new xml2js.Parser({ explicitArray: false });
            const jsonData = await parser.parseStringPromise(response.data);

            // Печать ответа для отладки
            //console.log("Full Response:", JSON.stringify(jsonData, null, 2));

            if (!jsonData?.Info?.Object) {
                console.log('[MONITORING]No users found or data is missing.');
                return res.render('monitoring', { users: [], onlineCount: 0, pathname: req.originalUrl, jsonData: {} });
            }

            // Извлекаем информацию о пользователях
            const users = extractUserInfo(jsonData);
            const onlineCount = users.filter(({ Status }) => Status === 'online').length;

            res.render('monitoring', { users, onlineCount, pathname: req.originalUrl, jsonData });
        } else {
            res.send('Invalid data format received.');
        }
    } catch (error) {
        res.status(500).send(`Error fetching data: ${error.message}`);
    }
});

export default router;
