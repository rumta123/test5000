const { Client } = require('pg');
require('dotenv').config(); // Подключаем библиотеку для работы с переменными окружения

// Получаем значения конфигурации подключения к базе данных из переменных окружения
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Подключение к базе данных
client.connect();

// Запрос для определения времени, когда было максимальное количество одновременных пользователей
const query = `
WITH user_sessions AS (
    SELECT 
        user_id,
        login_time,
        COALESCE(logout_time, CURRENT_TIMESTAMP) AS logout_time,
        COUNT(user_id) OVER (PARTITION BY user_id ORDER BY login_time ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS num_sessions
    FROM 
        test
    WHERE 
        login_time::date = '2024-02-23'::date -- Filter by a given day (e.g., '2024-02-23')

),
intervals AS (
    SELECT 
        generate_series(
            (SELECT MIN(login_time) FROM user_sessions),
            (SELECT MAX(logout_time) FROM user_sessions),
            '1 hour'::interval
        ) AS start_time,
        generate_series(
            (SELECT MIN(login_time) FROM user_sessions),
            (SELECT MAX(logout_time) FROM user_sessions),
            '1 hour'::interval
        ) + '1 hour'::interval AS end_time
)
SELECT 
    start_time,
    end_time,
    COUNT(DISTINCT user_id) AS num_users
FROM 
    intervals
JOIN 
    user_sessions 
ON 
    (login_time, logout_time) OVERLAPS (start_time, end_time)
GROUP BY 
    start_time, end_time
ORDER BY 
    num_users DESC
LIMIT 
    1;

`;

// Выполнение запроса
client.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
  
    // Получаем время из результата запроса
    const startTime = new Date(res.rows[0].start_time);
  
    // Форматируем время в более человеческом виде
    const formattedTime = `${startTime.getFullYear()}-${('0' + (startTime.getMonth() + 1)).slice(-2)}-${('0' + startTime.getDate()).slice(-2)} ${('0' + startTime.getHours()).slice(-2)}:${('0' + startTime.getMinutes()).slice(-2)}:${('0' + startTime.getSeconds()).slice(-2)}`;
  
    console.log('Максимальное количество пользователей было в следующее время:', formattedTime);
    console.log('Количество одновременных пользователей:', res.rows[0].num_users);
  
    client.end();
  });