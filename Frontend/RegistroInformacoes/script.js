document.addEventListener("DOMContentLoaded", function () {
    const chronicConditions = document.getElementById("chronic-conditions");
    const choices = new Choices(chronicConditions, {
        removeItemButton: true,
        placeholderValue: 'Selecione...',
        searchPlaceholderValue: 'Buscar...',
        itemSelectText: '', // remove o "Press to select"
    });

    // ADICIONE ESTA FUNÇÃO PARA BUSCAR O NOME:
    async function loadUserName() {
        const user_id = localStorage.getItem("user_id");
        const userNameElement = document.getElementById("userName");

        if (!user_id) {
            userNameElement.textContent = "Usuário não identificado";
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/auth/user/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (data.success) {
                // Exibe o nome no header
                userNameElement.textContent = data.user.name;

                // Salva todos os dados no localStorage para uso futuro
                localStorage.setItem("userData", JSON.stringify(data.user));

            } else {
                userNameElement.textContent = "Nome não encontrado";
            }
        } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
            userNameElement.textContent = "Erro ao carregar nome";
        }
    }

    // Chama a função para carregar o nome
    loadUserName();
});


function showMessage(message, isSuccess = true) {
    const overlay = document.getElementById("overlay");
    const box = document.getElementById("messageBox");
    const text = document.getElementById("messageText");

    text.textContent = message;
    box.querySelector("div").style.backgroundColor = isSuccess ? "#3264A6" : "#e53935";

    overlay.classList.remove("hidden");
    box.classList.remove("hidden");

    // Esconde depois de 3s
    setTimeout(() => {
        overlay.classList.add("hidden");
        box.classList.add("hidden");
    }, 3000);
}

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        showMessage("Erro: usuário não identificado. Faça login novamente.", false);
        return;
    }

    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const weight = document.getElementById("weight").value;
    const height = document.getElementById("height").value;
    const chronic_conditions = Array.from(
        document.getElementById("chronic-conditions").selectedOptions
    ).map(opt => opt.value);

    try {
        const res = await fetch("http://localhost:3000/profile/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, dob, gender, weight, height, chronic_conditions }),
        });

        const data = await res.json();
        //alert(data.message);

        if (data.success) {
            showMessage(data.message, true);
            // Redireciona depois de 3 segundos
            setTimeout(() => {
                window.location.href = "/TelaInicial/index.html";
            }, 3000);
            // window.location.href = "/dashboard/index.html"; // redireciona depois
        } else {
            showMessage(data.message, false);
        }
    } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        showMessage("Erro no servidor. Tente novamente mais tarde.", false);
        // alert("Erro no servidor. Tente novamente mais tarde.");
    }
});
