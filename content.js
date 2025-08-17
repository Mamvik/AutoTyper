(function () {
    if (document.body) {
        run();
    } else {
        window.addEventListener('DOMContentLoaded', run);
    }

    var shortcuts = [];
    var replacements = [];
    var prefixSet = new Set();

    function run() {
        (async () => {
            const result = await browser.storage.local.get("userData");
            console.log("[DEBUG] loaded data:", result);
            const userData = result.userData;
            if (!userData) {
                console.warn("No loaded data. Replacements won't be performed.");
                return;
            }

            for (const type of userData.types) {
                const cmdObj = type.cmd;
                for (const [key, value] of Object.entries(cmdObj)) {
                    shortcuts.push(key);
                    replacements.push(value);
                }
            }
            console.log("[DEBUG] shortcuts:", shortcuts);
            console.log("[DEBUG] replacements:", replacements);
            buildPrefixSet(shortcuts);

            document.addEventListener('input', (e) => {
                const target = e.target;
                if (!target || typeof target.value !== 'string') return;

                var value = target.value;
                var replaced = false;

                for (var i = 0; i < shortcuts.length; i++) {
                    const cmd = shortcuts[i];
                    const repl = replacements[i];
                    const isPrefix = prefixSet.has(cmd);

                    if (isPrefix) {
                        const pattern = new RegExp("(^|[ \t\n])" + escapeRegExp(cmd) + "[ \t]", "gm");
                        value = value.replace(pattern, (match, p1) => {
                            replaced = true;
                            console.log(`[DEBUG] replace (prefix) "${cmd}" -> "${repl}", match="${match}", leading="${p1}"`);
                            return (p1 || "") + repl;
                        });
                    } else {
                        const pattern = new RegExp("(^|\\s)" + escapeRegExp(cmd) + "(?=\\s|$)", "g");
                        value = value.replace(pattern, (match, p1) => {
                            replaced = true;
                            console.log(`[DEBUG] replace (exact) "${cmd}" -> "${repl}", match="${match}", leading="${p1}"`);
                            return (p1 || "") + repl;
                        });
                    }
                }

                if (replaced) {
                    target.value = value;
                    const audio = new Audio(browser.runtime.getURL("click2.mp3"));
                    try {
                        audio.play();
                    } catch (err) {
                        console.warn("Error playing audio", err);
                    }
                }
            });
        })();
    }

    // Создаёт множество всех возможных префиксов
    function buildPrefixSet(commands) {
        prefixSet = new Set();
        for (const cmd of shortcuts) {
            for (let i = 1; i < cmd.length; i++) {
                prefixSet.add(cmd.slice(0, i));
            }
        }
    }

    // Экранируем спецсимволы RegExp
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
})();
