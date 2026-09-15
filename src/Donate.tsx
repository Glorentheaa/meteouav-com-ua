import React from 'react'

export const Donate: React.FC = () => (
  <div className="w-full flex flex-col gap-6">
    <header className="border-b border-slate-300 dark:border-slate-800 pb-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Підтримати</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Підтримка розвитку проєкту MeteoUAV.</p>
    </header>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-none">
      <div className="flex flex-col space-y-8">
  {/* Вступний блок */}
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
      Підтримати проєкт
    </h2>
    <p className="text-slate-500 dark:text-slate-400">
      MeteoUAV був і залишатиметься безкоштовним інструментом без прихованих платежів, обов'язкових підписок чи обмежень у базовому плануванні. Це некомерційна ініціатива, створена для своїх.
    </p>
    <p className="text-slate-500 dark:text-slate-400">
      Проте безперебійна робота архітектури — оренда серверів, хостинг баз даних та постійні запити до платних погодних API — вимагає регулярних витрат. Ваші донати є єдиним джерелом фінансування, яке дозволяє підтримувати систему в робочому стані.
    </p>
  </div>

  {/* Блок про розширені можливості */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
      На що йдуть кошти?
    </h3>
    <p className="text-slate-500 dark:text-slate-400">
      Усі 100% зібраних коштів реінвестуються в розвиток проєкту: оплату інфраструктури, підвищення відмовостійкості та розробку нових інструментів для більш точних розрахунків.
    </p>
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-lg mt-4">
      <p className="text-slate-600 dark:text-slate-300">
        Ми не продаємо функціонал. Але на знак подяки за вашу фінансову підтримку ми відкриваємо доступ до розширених можливостей системи. Донат — це ваш внесок в еволюцію платформи та спільну ефективність.
      </p>
    </div>
  </div>

  {/* Блок з кнопками оплати */}
  <div className="flex flex-col sm:flex-row gap-4 pt-4">
    {/* Кнопка Donatello */}
    <a 
      href="https://donatello.to/ТВІЙ_ЛІНК" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
    >
      Підтримати через Donatello
    </a>
    
    {/* Якщо використовуєш Монобанку, можна додати поруч */}
    <a 
      href="https://send.monobank.ua/ТВІЙ_ЛІНК" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-lg transition-colors shadow-sm border border-slate-700 dark:border-transparent"
    >
      Поповнити Банку
    </a>
  </div>
</div>
    </div>
  </div>
)