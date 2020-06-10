function showLoginPage() {
  container.innerHTML = `
    <form id="form">
      <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" required/>
      </div>
      <div class="form-group">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" required>
      </div>
      <div id="message"></div>
      <div id="buttons">
          <button type="button" class="btn btn-primary btn-block" onclick="auth()">Login</button>
      </div>
      <div class="d-flex justify-content-center">
          <div class="spinner-border" id="spinner" style="display: none">
              <span class="sr-only">Loading...</span>
          </div>
      </div>
    </form>
      `;
}

function auth() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("message");
  message.innerText = "";
  toggleSpinner(true);
  emailInput.style.borderColor = "";
  passwordInput.style.borderColor = "";
  let validInput = true;
  if (!emailInput.checkValidity()) {
    emailInput.style.borderColor = "red";
    validInput = false;
  }
  if (!passwordInput.checkValidity()) {
    passwordInput.style.borderColor = "red";
    validInput = false;
  }
  if (validInput) {
    const email = emailInput.value;
    const password = passwordInput.value;
    ipcRenderer.send("login", { email, password });
  } else {
    message.innerText = "Please provide valid inputs";
    toggleSpinner(false);
  }
}

function toggleSpinner(showSpinner) {
  const buttons = document.getElementById("buttons");
  const spinner = document.getElementById("spinner");
  if (showSpinner) {
    spinner.style.display = "";
    buttons.style.display = "none";
  } else {
    spinner.style.display = "none";
    buttons.style.display = "";
  }
}
