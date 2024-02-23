// Функция для подсчета максимального количества уникальных пользователей за день
function maxUniqueUsers(sessions) {
    let maxUnique = 0;
    let windowStart = 0;
    let windowEnd = 0;
    const userSet = new Set();

    while (windowEnd < sessions.length) {
        const { user_id } = sessions[windowEnd];

        // Перемещаем начало окна, если сессия находится за пределами текущего окна
        while (windowStart < windowEnd && sessions[windowStart].logout_time <= sessions[windowEnd].login_time) {
            userSet.delete(sessions[windowStart].user_id);
            windowStart++;
        }

        // Расширяем окно
        userSet.add(user_id);
        windowEnd++;

        // Обновляем максимальное количество пользователей, если необходимо
        maxUnique = Math.max(maxUnique, userSet.size);
    }

    return maxUnique;
}



// Функция для нахождения максимального количества посетителей за конкретный день
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

    const sessionsForDay = sessions.filter(session => {
        const sessionDate = new Date(session.login_time);

        return sessionDate.getDate() === date.getDate() &&
               sessionDate.getMonth() === date.getMonth() &&
               sessionDate.getFullYear() === date.getFullYear();
    });

    return maxUniqueUsers(sessionsForDay);
}



const sessions = [
   
    { 
        session_id: 1,
        user_id: 1,
        login_time: new Date("2024-02-23T08:00:00"),
        logout_time: new Date("2024-02-23T09:00:00")
    },

    { 
        session_id: 2,
        user_id: 2,
        login_time: new Date("2024-02-23T08:30:00"),
        logout_time: new Date("2024-02-23T09:30:00")
    },
    { 
        session_id: 3,
        user_id: 3,
        login_time: new Date("2024-02-23T09:00:00"),
        logout_time: new Date("2024-02-23T10:00:00")
    },
    { 
        session_id: 4,
        user_id: 1,
        login_time: new Date("2024-02-23T09:30:00"),
        logout_time: new Date("2024-02-24T10:30:00") // Второй день
    },
    { 
        session_id: 5,
        user_id: 4,
        login_time: new Date("2024-02-23T08:30:00"),
        logout_time: new Date("2024-02-23T09:30:00")
    },
    { 
        session_id: 6,
        user_id: 5,
        login_time: new Date("2024-02-24T08:30:00"),
        logout_time: new Date("2024-02-24T09:30:00")
    },
    { 
        session_id: 7,
        user_id: 6,
        login_time: new Date("2024-02-23T11:30:00"),
        logout_time: new Date("2024-02-24T12:30:00")
    },
];

function maxPeopleInRoomWithTime(sessions) {
    const events = [];

    sessions.forEach(session => {
        events.push({ time: session.login_time, type: 'вход' });
        events.push({ time: session.logout_time, type: 'выход' });
    });

    events.sort((a, b) => a.time - b.time);

    let maxPeople = 0;
    let currentPeople = 0;
    let maxTime = null; // Переменная для хранения времени, когда было максимальное количество людей

    events.forEach(event => {
        if (event.type === 'вход') {
            currentPeople++;
            if (currentPeople > maxPeople) {
                maxPeople = currentPeople;
                maxTime = event.time; // Обновляем время, когда было максимальное количество людей
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

const { maxPeople, maxTime } = maxPeopleInRoomWithTime(sessions);
console.log("Максимальное количество людей в комнате:", maxPeople , "в момент времени",  formatTime(maxTime));


const dateString = "23 февраля 2024"; 
const maxVisitors = maxVisitorsForDay(sessions, dateString);
console.log(`Максимальное количество посетителей за ${dateString}:`, maxVisitors);
