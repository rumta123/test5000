const { Client } = require('pg');
require('dotenv').config();

describe('Query Test', () => {
  let client;

  beforeAll(() => {
    // Подключение к базе данных перед выполнением тестов
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    client.connect();
  });

  afterAll(() => {
    // Закрытие соединения с базой данных после выполнения тестов
    client.end();
  });

  it('should execute the query successfully', async () => {
    const query = `WITH user_sessions AS (
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
        1;`;

    // Выполнение запроса
    const result = await client.query(query);

    // Проверка результатов запроса
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty('start_time');
    expect(result.rows[0]).toHaveProperty('num_users');
  });
});