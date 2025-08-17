/* Важные пункты:
0) Запуск расширения.
+ 0.1) Бразуер Mozilla Firefox Developer Edition и манипуляции с введением расширения
+ 0.2) Тестирование на болванке
+ 0.3) Наличие jQuery на странице
! 0.4) Добавление JSON в расширение без необходимости новой загрузки

1) Принимает на вход базу данных из персонального компьютера пользователя. 
+ 1.0) Считывание БД в формате JSON.
+ 1.1) Команды начинаются с восклицательного знака или знака процента. (проверить работоспособность)
+ 1.2) Считывание данные в формате "команда - вывод".
* 1.3) Часть команд содержит знак переноса в конце. Необходимо учесть!

2) При вводе текста происходит автозамена содержимого элемента .form-control.form-control-flush.mb-3
+ 2.1) Если введена команда, которая не является частью другой, то при введении команды происходит автозамена.
+ 2.2) Конфликт - это наличие нескольких команд, которые начинаются одинаково.
     если введённые символы имеются в других командах, при вводе команды автозамена не происходит сразу. Идёт ожидание двух символов:
2.3.1) если пробел - принимается то, что введено
2.3.2) если другой символ - то либо активируется команда, либо ожидание следующей (если на этом этапе команда все равно является частью другой команды)
+ 2.4) Если нет совпадений - команда не срабатывает.

3) Создание новой БД.
! 3.1) Переписать БД (небольшим скриптом)
! 3.2) JSON файл загружается в браузер 1 раз и находится там постоянно
*/

(function() {
    if (document.body) {
        run();
    } else {
        window.addEventListener('DOMContentLoaded', run);
    }

    function run() {
        // Создаём контейнер
        const div = document.createElement('div');
        div.className = 'Testin';
        div.style.position = 'fixed';
        div.style.top = '10px';
        div.style.right = '10px';
        div.style.padding = '10px';
        div.style.border = '1px solid gray';

        // Кнопка загрузки
        const label = document.createElement('label');
        label.textContent = 'Импорт JSON: ';
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        label.appendChild(input);
        div.appendChild(label);

        // Элемент для вывода результата
        const resultDisplay = document.createElement('div');
        resultDisplay.style.marginTop = '10px';
        resultDisplay.style.fontFamily = 'monospace';
        div.appendChild(resultDisplay);
        document.body.append(div);

        // Обработчик выбора файла
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            var shortcuts = [];
            var replacements = [];

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const json = JSON.parse(e.target.result);
                    console.log('Загруженный JSON:', json);

                    for (var i = 0; i < (json.folders?.length || 0); i++) {
                        const snippets = json?.folders[i]?.snippets || [];
                        /* shortcuts = json?.folders?.[i]?.snippets?.map(snippet => snippet.shortcut) || [];
                        replacements = json?.folders?.[i]?.snippets?.map(snippet => snippet.text) || []; */
                        // shortcuts = Object.keys(json);
                        // replacements = Object.values(json);
                        shortcuts = json.folders?.flatMap(folder => 
                            folder.snippets?.map(snippet => snippet.shortcut?.toLowerCase()) || []
                        ) || [];

                        replacements = json.folders?.flatMap(folder => 
                            folder.snippets?.map(snippet => snippet.text) || []
                        ) || [];
                    }
                    const result = {};
                    for (var i = 0; i < shortcuts.length; i++) {
                        result[shortcuts[i]] = replacements[i];
                    }

                    // преобразуем в JSON-строку с экранированием
                    const jsonText = JSON.stringify(result, null, 2); // `2` — отступ для читаемости

                    // выводим одним разом
                    console.log(jsonText);

                    if (shortcuts.length > 0) {
                        console.log('Shortcuts:', shortcuts);
                        resultDisplay.textContent = 'Команды найдены!';
                    } else {
                        console.warn('Команды не найдены');
                        resultDisplay.textContent = 'Команды не найдены';
                    }
                } catch (err) {
                    alert('Ошибка разбора JSON: ' + err.message);
                    resultDisplay.textContent = 'Ошибка загрузки JSON';
                }
            };
            reader.readAsText(file);
            
            document.addEventListener('input', (e) => {
                const target = e.target;
                if (!target) return;
            
                let value = target.value;
            
                // Проверка на пробел в конце
                const endsWithSpace = /\s$/.test(value);
                const words = value.trim().split(/\s+/);
                const lastWord = words[words.length - 1];
            
                if (endsWithSpace) {
                    // Получаем последнее слово перед пробелом
                    const prevWord = lastWord;
                    console.log(prevWord);
                    const isExact = shortcuts.includes(prevWord);
                    console.log(isExact);
            
                    if (isExact) {
                        const index = shortcuts.indexOf(prevWord);
                        const repl = replacements[index];

                        const lastIndex = value.lastIndexOf(prevWord);
                        const before = value.slice(0, lastIndex);
                        const after = repl;

                        target.value = before + after;

                        // Удалим последнее слово и заменим
                        /* const withoutLast = value.trim().split(/\s+/).slice(0, -1).join(' ');
                        const final = (withoutLast ? withoutLast + ' ' : '') + repl;
                        target.value = final;
                        console.log(`Заменена команда (по пробелу): ${prevWord}`); */

                        // Заменить последнее вхождение команды перед пробелом
                        /* const regex = new RegExp(`\\b${prevWord}\\s$`);
                        console.log(regex);
                        const index = shortcuts.indexOf(prevWord);
                        const repl = replacements[index];
                        console.log(repl);
                        target.value = value.replace(regex, repl);
                        console.log(`Заменена команда (по пробелу): ${prevWord}`); */
                    }
                } else {
                    const found = shortcuts.find(sc => lastWord === sc);
                    if (!found) return;
                
                    const isPrefix = shortcuts.some(cmd => cmd !== found && cmd.startsWith(found));
                    if (isPrefix) return;
                
                    const index = shortcuts.indexOf(found);
                    const repl = replacements[index];

                    const lastIndex = value.lastIndexOf(found);
                    const before = value.slice(0, lastIndex);
                    const after = repl;
                    target.value = before + after;
                
                    // Удаляем последнее слово (lastWord) и заменяем на соответствующую подстановку
                    /*const words = value.trim().split(/\s+/);
                    words[words.length - 1] = repl;
                    target.value = words.join(' ');
                    
                    console.log(`Заменена команда (на лету): ${found}`);*/

                    // Без пробела — на лету
                    /* const found = shortcuts.find(sc => lastWord === sc);
                    if (!found) return;
            
                    const isPrefix = shortcuts.some(cmd => cmd !== found && cmd.startsWith(found));
                    if (isPrefix) return;
            
                    const regex = new RegExp(`\\b${found}$`);
                    const index = shortcuts.indexOf(found);
                    const repl = replacements[index];
                    console.log(repl);
                    target.value = value.replace(regex, repl);
                    console.log(`Заменена команда (на лету): ${found}`);*/


                }
                /* const found = shortcuts.find(sc => value.includes(sc));
                const replace = results[shortcuts.indexOf(found)];

                if (found) {
                    console.log(`Обнаружена команда: ${found}`);
                    target.value = value.replace(found, replace);
                } */
            });
        });
    }
})();