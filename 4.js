const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getSessionsFromDB() {
    try {
      const result = await client.query('SELECT * FROM sessions');
    //   console.log(result)
      return result.rows;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error; 
    }
  }

function maxVisitorsForDay(sessions, dateString) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const dateParts = dateString.split(' ');
    const day = parseInt(dateParts[0]);
    const monthIndex = months.indexOf(dateParts[1]);
    const year = parseInt(dateParts[2]);

    const date = new Date(year, monthIndex, day);
    const nextDay = new Date(year, monthIndex, day + 1);

    const visitedUsers = new Set(); // Множество для отслеживания уникальных пользователей

    sessions.forEach(session => {
        const sessionLoginDate = new Date(session.login_time);
        const sessionLogoutDate = new Date(session.logout_time);

        // Проверяем, что сессия началась до указанной даты и закончилась после нее
        if (sessionLoginDate < nextDay && sessionLogoutDate >= date) {
            visitedUsers.add(session.user_id);
        }
    });

    return visitedUsers.size; // количество уникальных пользователей
}

function maxPeopleInRoomWithTime(sessions) {
  const events = [];

  sessions.forEach(session => {
    events.push({ time: session.login_time, type: 'вход' });
    events.push({ time: session.logout_time, type: 'выход' });
  });

  events.sort((a, b) => a.time - b.time);

  let maxPeople = 0;
  let currentPeople = 0;
  let maxTime = null;

  events.forEach(event => {
    if (event.type === 'вход') {
      currentPeople++;
      if (currentPeople > maxPeople) {
        maxPeople = currentPeople;
        maxTime = event.time;
      }
    } else if (event.type === 'выход') {
      currentPeople--;
    }
  });

  return { maxPeople, maxTime };
}

function formatTime(time) {
  const options = { hour12: false };
  return time.toLocaleString('ru-RU', options);
}

async function main() {
    try {
      await client.connect();
      const sessions = await getSessionsFromDB();
  
      const { maxPeople, maxTime } = maxPeopleInRoomWithTime(sessions);
      console.log("Максимальное количество людей в комнате:", maxPeople , "в момент времени",  formatTime(maxTime));
  
      const dateString = "23 февраля 2024"; 
      const maxVisitors = maxVisitorsForDay(sessions, dateString);
      console.log(`Максимальное количество посетителей за ${dateString}:`, maxVisitors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await client.end();
    }
  }
  
  main();
