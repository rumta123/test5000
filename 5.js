const { Client } = require('pg');
require('dotenv').config();


const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


client.connect();

// Функция для выполнения запросов
async function executeQuery(query) {
    try {
        const result = await client.query(query);
        // console.log('Query executed successfully');
        // console.log(result.rows); 
        return result.rows; 
    } catch (error) {
        console.error('Error executeQuery:', error);
        return []; // пустой массив в случае ошибки
    }
}


const functionQuery = `
SELECT 
    max_people,
    TO_CHAR(max_time, 'DD.MM.YYYY, HH24:MI:SS') AS formatted_max_time
FROM (
    SELECT 
        max_time,
        MAX(current_people) AS max_people
    FROM (
        SELECT 
            time AS max_time,
            SUM(CASE WHEN event_type = 'вход' THEN 1 ELSE -1 END) OVER (ORDER BY time) AS current_people
        FROM (
            SELECT login_time AS time, 'вход' AS event_type FROM sessions
            UNION ALL
            SELECT logout_time AS time, 'выход' AS event_type FROM sessions
        ) events
    ) subquery
    GROUP BY max_time
) max_people_query
ORDER BY max_people DESC
LIMIT 1;
`;

const functionMax = `
CREATE OR REPLACE FUNCTION getMaxVisitors(target_date date) 
RETURNS int AS $$
DECLARE 
    max_visitors int;
BEGIN
  
    SELECT 
        COUNT(DISTINCT user_id) INTO max_visitors
    FROM 
        sessions
    WHERE 
        login_time::date <= target_date AND 
        (logout_time::date >= target_date OR logout_time IS NULL) AND
        login_time <= target_date::timestamp + interval '1 day' - interval '1 second' AND
        (logout_time >= target_date::timestamp OR logout_time IS NULL);
    
  
    RETURN max_visitors;
END;
$$ LANGUAGE plpgsql;

`;



(async () => {
    const result1 = await executeQuery(functionQuery);
    if (result1.length > 0) {
       
        const firstResult = result1[0];
        const maxPeople = firstResult.max_people;
        const formattedMaxTime = firstResult.formatted_max_time;
        console.log('Максимальное количество пользователей одновременно:', maxPeople , 'дата и время:', formattedMaxTime);    
        
    } else {
        console.log('Результат запроса пустой.');
    }
   const datetest = '2024-02-23';
   const query = `SELECT getMaxVisitors('${datetest}')`;
   const result3 = await executeQuery(query);
   console.log(` ${datetest} максимальное кол-во пользователей ${result3[0].getmaxvisitors}`)

})();
