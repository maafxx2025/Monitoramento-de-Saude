document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greeting");

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

    // Atualiza imediatamente ao carregar
    updateGreeting();

    // Atualiza a cada 60 segundos
    setInterval(updateGreeting, 60 * 2 * 1000);
});