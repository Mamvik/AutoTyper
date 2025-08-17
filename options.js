(function() {
    if (document.body) {
        run();
    } else {
        window.addEventListener("DOMContentLoaded", run);
    }

    function run() {
        (async () => {
            let userData;
            const stored = await browser.storage.local.get("userData");
            userData = stored.userData;
            console.log("[DEBUG] loaded data on options page:", userData);
            if (userData) {
                document.getElementById("importJSON").textContent = "Refresh JSON data:"
            } else {
                document.getElementById("newCommands").style["display"] = "none";
                document.getElementById("con2").style["display"] = "none";
                userData = { types: [] };
            }

            const dataBlock = document.getElementById("con2");
            userData.types.forEach(type => {
                const cmdObj = type.cmd;
                const typeBlock = document.createElement("p");
                typeBlock.textContent = type.name;
                dataBlock.appendChild(typeBlock);
                for (const [key, value] of Object.entries(cmdObj)) {
                    const cmdBlock = document.createElement("p");
                    cmdBlock.textContent = key;
                    cmdBlock.style.fontSize = '10px';
                    dataBlock.appendChild(cmdBlock);
                    const textBlock = document.createElement("p");
                    textBlock.textContent = value;
                    textBlock.style.fontSize = '10px';
                    dataBlock.appendChild(textBlock);
                }
            });

            document.getElementById("jsonFile").addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target.result);
                        browser.storage.local.set({ userData: json }).then(() => {
                            alert("Commands are loaded");
                            document.getElementById("inputResult").textContent = "Commands are loaded";
                            userData = json;
                        });
                    } catch (err) {
                        alert("JSON parsing error: " + err.message);
                        document.getElementById("inputResult").textContent = "Load JSON with commands";
                    }
                };
                reader.readAsText(file);
            });
            document.getElementById("newButton").addEventListener("click", async function () {
                console.log("[DEBUG] userData on click:", userData);
                const newCat = document.getElementById("newCat").value;
                const newCmd = document.getElementById("newCmd").value;
                const newText = document.getElementById("newText").value.replace(/\n/g, "\\n");

                console.log(newCat, newCmd, newText);

                var typeObj = userData.types.find(t => t.name === newCat);

                if (!typeObj) {
                    typeObj = {
                        name: newCat,
                        cmd: {}
                    };
                    userData.types.push(typeObj);
                }

                typeObj.cmd[newCmd] = newText.replace(/\\n/g, "\n");

                try {
                    await browser.storage.local.set({ userData: userData });
                    console.log("[DEBUG] Changes saved to storage:", userData);
                    alert("Changes saved");
                } catch (err) {
                    console.error("Failed to save changes:", err);
                }

                function escapeRegExp(string) {
                    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
            });
        })();
    }
})();
