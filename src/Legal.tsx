import React from 'react'

export const Legal: React.FC = () => (
  <div className="w-full flex flex-col gap-6">
    <header className="border-b border-slate-300 dark:border-slate-800 pb-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Правова інформація</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Умови використання та політика конфіденційності.</p>
    </header>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-none">
      <div className="flex flex-col space-y-8">
        {/* Вступ */}
        <div className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400">
            Використовуючи MeteoUAV, ви погоджуєтесь із наведеними нижче умовами. Проєкт створено для забезпечення зручного доступу до метеорологічних розрахунків, проте він залишається допоміжним інструментом, а не істиною в останній інстанції.
          </p>
        </div>

        {/* Блок 1: Відповідальність */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Точність прогнозів та відповідальність
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Будь-який прогноз погоди є математичною моделлю з неминучою часткою похибки. Дані на цьому ресурсі надаються за принципом «як є» (as is).
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Проєкт не несе відповідальності за скасовані місії, пошкодження чи втрату бортів, а також за будь-які інші прямі чи непрямі наслідки, що виникли через використання цих розрахунків. Фінальне рішення щодо доцільності та безпечності вильоту завжди ухвалює оператор.
          </p>
        </div>

        {/* Блок 3: Конфіденційність */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Конфіденційність та обробка координат
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Для забезпечення безпеки користувачів система не працює з точними локаціями. Усі передані координати автоматично заокруглюються до сітки розміром орієнтовно 6х9 км. Захист від мережевих загроз, DDoS-атак та базову безпеку трафіку забезпечує інфраструктура Cloudflare.
          </p>
        </div>

        {/* Блок 5: Закриті алгоритми */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Внутрішня архітектура
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Складна математична модель, процеси обробки сирих даних та система вагових коефіцієнтів є головним унікальним механізмом проєкту. З міркувань безпеки та захисту інтелектуальної власності, деталі "підкапотних" процесів та алгоритмів не розголошуються.
          </p>
        </div>

        {/* Блок 2 та 4: Обмеження доступу */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-500">
            Доступ та територіальні обмеження
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Використання сервісу з IP-адрес російської федерації та республіки білорусь суворо заборонено і технічно блокується.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Крім того, ми залишаємо за собою право припиняти доступ до сервісу та блокувати його назавжди без попередження у разі виявлення підозрілої активності, автоматизованого збору даних або спроб втручання в роботу системи.
          </p>
        </div>
      </div>
    </div>
  </div>
)