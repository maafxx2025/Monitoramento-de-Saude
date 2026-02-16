document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greeting");
    const userNameElement = document.getElementById("userName");

    // Função para atualizar saudação baseada no horário
    function updateGreeting() {
        const hour = new Date().getHours();
        let message = "";

        if (hour >= 5 && hour < 12) {
            message = "Bom dia,";
        } else if (hour >= 12 && hour < 18) {
            message = "Boa tarde,";
        } else {
            message = "Boa noite,";
        }

        // Só atualiza se mudar, evitando re-render desnecessário
        if (greetingElement.textContent !== message) {
            greetingElement.textContent = message;
        }
    }

    // Função para carregar nome do usuário
    async function loadUserName() {
        const current_user_id = localStorage.getItem("user_id");

        if (!current_user_id) {
            userNameElement.textContent = "Usuário não identificado";
            return;
        }

        // 1. Primeiro tenta buscar do localStorage
        const userData = localStorage.getItem("userData");

        if (userData) {
            try {
                const user = JSON.parse(userData);
                // CRUCIAL: Verifica se os dados salvos são do usuário atual
                if (user.id === current_user_id && user.name) {
                    userNameElement.textContent = user.name;
                    return; // Dados corretos encontrados, não precisa buscar do banco
                } else {
                    // Dados são de outro usuário, limpa o localStorage
                    localStorage.removeItem("userData");
                }
            } catch (error) {
                console.error("Erro ao parsear dados do localStorage:", error);
                // Remove dados corrompidos
                localStorage.removeItem("userData");
            }
        }

        // 2. Se não encontrou dados válidos no localStorage, busca do banco
        try {
            const res = await fetch(`http://localhost:3000/auth/user/${current_user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (data.success) {
                // Exibe o nome
                userNameElement.textContent = data.user.name;

                // Salva dados do usuário ATUAL no localStorage
                localStorage.setItem("userData", JSON.stringify(data.user));
            } else {
                userNameElement.textContent = "Nome não encontrado";
            }
        } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
            userNameElement.textContent = "Erro ao carregar nome";
        }
    }

    // Executa as funções ao carregar a página
    updateGreeting();
    loadUserName();

    // Atualiza a saudação a cada 2 minutos
    setInterval(updateGreeting, 60 * 2 * 1000);
});