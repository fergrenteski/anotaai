async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmacaoSenha = document.getElementById("confirmacaoSenha").value;

  if (senha !== confirmacaoSenha) {
    document.getElementById("mensagem").innerText = "As senhas não coincidem!";
    return;
  }

  const resposta = await fetch("http://localhost:3000/api/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, confirmacaoSenha })
  });

  const data = await resposta.json();

  if (data.token) {
    sessionStorage.setItem("token", data.token);
    window.location.href = "login.html";
  } else {
    document.getElementById("mensagem").innerText = data.error;
  }
}
