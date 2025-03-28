
async function resetPassword() {
    const email = document.getElementById("email").value;
    if (email.length < 5) {
        document.getElementById("mensagem").innerText = "E-mail Invalido!";
        return;
    }
    await fetch("https://anotaai-backend.vercel.app/api/email/resetarSenha", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email })
    });
}

document.getElementById("resetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    resetPassword();
})
