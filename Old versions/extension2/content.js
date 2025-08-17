(function() {
    if (document.body) {
        run();
    } else {
        // Запуск только при загрузке страницы
        window.addEventListener('DOMContentLoaded', run);
    }

    // Переменные для команд и замен
    var shortcuts = [];
    var replacements = [];

    function run() {
        (async () => {
            // Вытаскиваем данные из локального хранилища
            const result = await browser.storage.local.get("userData");
            const userData = result.userData;

            if (!userData) {
                console.warn("No loaded data. Replacements won't be performed.");
                return;
            }

            // Загрузка команд и замен из локального хранилища
            shortcuts = Object.keys(userData);
            replacements = Object.values(userData);
            
            // Выполнение автозамены при вводе текста
            document.addEventListener('input', (e) => {
                const target = e.target;
                if (!target) return;
                
                var value = target.value;
                
                // Проверка на пробел в конце (для коротких команд)
                const endsWithSpace = /\s$/.test(value);
                const words = value.trim().split(/\s+/);
                const lastWord = words[words.length - 1];
                
                if (endsWithSpace) {
                    // Берём последнее слово перед пробелом
                    const prevWord = lastWord;
                    const isExact = shortcuts.includes(prevWord);
                
                    // Если пробел введён для запуска команды
                    if (isExact) {
                        const index = shortcuts.indexOf(prevWord);
                        const repl = replacements[index];

                        const lastIndex = value.lastIndexOf(prevWord);
                        const before = value.slice(0, lastIndex);
                        const after = repl;

                        target.value = before + after;
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
                }
            });
        })();
    }
})();