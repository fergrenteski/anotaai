function verificarLogin() {
  const token = sessionStorage.getItem("token");

  if (!token) {
      window.location.href = "login.html";
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  document.getElementById("nomeUsuario").innerText = payload.nome;
}

function logout() {
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

verificarLogin();
