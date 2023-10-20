(async () => {
    try {
        // Open a database
        const openRequest = indexedDB.open("myDataBase");

        openRequest.addEventListener("success", (e) => {
            console.log("DB Success");
            db = openRequest.result;
        });

        openRequest.addEventListener("error", (e) => {
            console.log("DB error");
        });

        openRequest.addEventListener("upgradeneeded", (e) => {
            console.log("DB upgraded and also for initial DB creation");
            db = openRequest.result;

            // Create object stores
            if (!db.objectStoreNames.contains("video")) {
                db.createObjectStore("video", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("image")) {
                db.createObjectStore("image", { keyPath: "id" });
            }
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();
