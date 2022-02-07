self.addEventListener('fetch', async e => {
    console.log("fetch")
});


self.addEventListener("beforeinstallprompt", e => {
    console.log("before install")
});


self.addEventListener("install", e => {
    console.log("install")
});

