(function() {
    if (document.body) {
        run();
    } else {
        window.addEventListener("DOMContentLoaded", run);
    }

    function run() {
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
                    });
                } catch (err) {
                    alert("JSON parsing error: " + err.message);
                    document.getElementById("inputResult").textContent = "Load JSON with commands";
                }
            };
            reader.readAsText(file);
        });
    }
})();
