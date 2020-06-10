function showControlPage() {
  container.innerHTML = `
        <div class="mb-5 text-center"><b>Account Email</b><br>${user.email}
        <br>
        ${!user.emailVerified ? "(Not Verified)" : "(Verified)"}
        <br>
        ${!user.emailVerified ? "Verify Email using Web App" : ""}
        </div>
        <div id="message">
        </div>
        <div id="buttons">
            <button 
                class="btn btn-block btn-${
                  runningServer ? "warning" : "success"
                }" 
                onclick="toggleServer()"
                style="display: ${!user.emailVerified ? "none" : ""}"
                >${runningServer ? "Stop" : "Start"} Server
            </button>
            ${
              runningServer
                ? ""
                : '<button class="btn btn-block btn-danger mt-1" onclick="logout()">Logout</button>'
            }
            
      </div>
        <div class="d-flex justify-content-center">
            <div class="spinner-border" id="spinner" style="display: none">
                <span class="sr-only">Loading...</span>
            </div>
        </div>`;
}

function toggleServer() {
  toggleSpinner(true);
  if (!runningServer) {
    ipcRenderer.send("create:server");
  } else {
    ipcRenderer.send("stop:server");
  }
}

function logout() {
  ipcRenderer.send("logout");
}
