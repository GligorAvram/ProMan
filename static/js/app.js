window.addEventListener('load', ()=> {
    registerServiceWorker();
})


async function registerServiceWorker(){
    if("serviceWorker" in navigator){
        try{
            await navigator.serviceWorker.register("/sw.js");
        }
        catch (e) {
            console.log("Service registration failed");
        }
    }
}