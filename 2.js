
const sessions = [
    { user_id: 1, login_time: new Date('2024-02-23T08:00:00'), logout_time: new Date('2024-02-23T09:30:00') },
    { user_id: 2, login_time: new Date('2024-02-23T08:30:00'), logout_time: new Date('2024-02-23T10:00:00') },
    { user_id: 3, login_time: new Date('2024-02-23T09:00:00'), logout_time: null }, // если пользователь еще не вышел
 
  ];
  

  const startTime = new Date('2024-02-23T00:00:00');
  const endTime = new Date('2024-02-24T00:00:00');
  const interval = 60 * 60 * 1000; // 1 час в миллисекундах
  
  // Создание временных интервалов
  const intervals = [];
  for (let time = startTime; time < endTime; time.setTime(time.getTime() + interval)) {
    intervals.push({ start_time: new Date(time), end_time: new Date(time.getTime() + interval) });
  }
  
  // Анализ интервалов
  let maxUsers = 0;
  let maxUsersTime;
  for (const interval of intervals) {
    const usersInInterval = sessions.filter(session =>
      session.login_time <= interval.end_time &&
      (session.logout_time === null || session.logout_time >= interval.start_time)
    ).length;
    if (usersInInterval > maxUsers) {
      maxUsers = usersInInterval;
      maxUsersTime = interval.start_time;
    }
  }
  
  // Вывод результата
  console.log('Максимальное количество пользователей было в следующее время:', maxUsersTime);
  console.log('Количество одновременных пользователей:', maxUsers);