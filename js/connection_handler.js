window.addEventListener('offline', () => {
  snackbar('Connection lost.');
});

window.addEventListener('online', () => {
  Promise.all([DBHelper.saveOfflineDataOnAPI()])
  .then(res => {
    if (res[0] === true) {
      snackbar('The offline data is saved on server.');
    }
  });
});

function snackbar(message) {
  const container = document.getElementById("snackbar");
  container.innerHTML = message;
  container.className = "show";
  setTimeout(() => {
    container.className = container.className.replace("show", "");
  }, 3000);
}