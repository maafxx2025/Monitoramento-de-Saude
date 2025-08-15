document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("medication-form");
    const toastSuccess = document.getElementById("success-toast");
    const toastError = document.getElementById("error-toast");
    const saveButton = document.getElementById("save-button");

    function showToast(el, ms = 2000) {
        // mostrar
        el.classList.remove("hidden");
        // small delay to allow transition
        requestAnimationFrame(() => {
            el.classList.remove("opacity-0", "scale-95");
            el.classList.add("opacity-100", "scale-100");
            el.setAttribute("aria-hidden", "false");
        });

        // esconder depois
        setTimeout(() => {
            el.classList.remove("opacity-100", "scale-100");
            el.classList.add("opacity-0", "scale-95");
            el.setAttribute("aria-hidden", "true");
            // depois da animação, adiciona hidden
            setTimeout(() => el.classList.add("hidden"), 200);
        }, ms);
    }

    form.addEventListener("submit", function (ev) {
        ev.preventDefault();

        const name = document.getElementById("medication-name").value.trim();
        const quantity = document.getElementById("quantity").value.trim();
        const unit = document.getElementById("unit").value.trim();
        const time = document.getElementById("time").value.trim();

        // validação (description é opcional)
        if (!name || !quantity || !unit || !time) {
            showToast(toastError, 2000);
            return;
        }

        // desabilita botão para evitar cliques duplos
        saveButton.disabled = true;
        saveButton.classList.add("opacity-60", "cursor-not-allowed");

        // mostra toast de sucesso
        showToast(toastSuccess, 2000);

        // simula delay de salvamento e redireciona após 2s
        setTimeout(() => {
            // aqui você chamaria sua API / salvar no banco
            // depois redireciona pra tela inicial
            window.location.href = "../Tela Inicial/index.html";
        }, 2000);
    });
});