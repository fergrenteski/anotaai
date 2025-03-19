async function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    const data = await resposta.json();

    if (data.token) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "principal.html";
    } else {
        document.getElementById("mensagem").innerText = data.error;
    }
}
