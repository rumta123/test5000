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
  SELECT 
      start_time,
      COUNT(*) AS concurrent_users
  FROM (
      SELECT 
          login_time AS start_time
      FROM 
          "test"
      WHERE 
          DATE(login_time) = '2024-02-23'
      UNION ALL
      SELECT 
          COALESCE(logout_time, NOW()) AS start_time
      FROM 
          "test"
      WHERE 
          DATE(logout_time) = '2024-02-23'
  ) AS intervals
  GROUP BY 
      start_time
  ORDER BY 
      concurrent_users DESC
  LIMIT 1;
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
  console.log('Количество одновременных пользователей:', res.rows[0].concurrent_users);

 
   client.end();



  // Определение времени выполнения скрипта
  console.time('время выполнения скрипта');
});
