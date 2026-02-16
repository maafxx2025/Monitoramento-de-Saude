
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("medication-form");
    const toastSuccess = document.getElementById("success-toast");
    const toastError = document.getElementById("error-toast");
    const saveButton = document.getElementById("save-button");

    function showToast(el, ms = 2000) {
        // mostrar
        el.classList.remove("hidden");
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
            setTimeout(() => el.classList.add("hidden"), 200);
        }, ms);
    }

    function showErrorToast(message) {
        // Atualizar mensagem do toast de erro se necessário
        const errorMessage = toastError.querySelector('.toast-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        showToast(toastError, 3000);
    }

    // async function saveMedicationReminder(medicationData) {
    //     try {
    //         const response = await fetch('http://localhost:3000/medications/reminder', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(medicationData)
    //         });

    //         const result = await response.json();

    //         if (!response.ok) {
    //             throw new Error(result.message || 'Erro ao salvar lembrete');
    //         }

    //         return result;
    //     } catch (error) {
    //         console.error('Erro na requisição:', error);
    //         throw error;
    //     }
    // }

    // FUNÇÃO CORRIGIDA COM LOGS DETALHADOS
    async function saveMedicationReminder(medicationData) {
        console.log("=== INICIANDO saveMedicationReminder ===");
        console.log("Dados recebidos na função:", medicationData);

        try {
            console.log("=== FAZENDO FETCH ===");
            console.log("URL:", 'http://localhost:3000/medications/reminder');

            const response = await fetch('http://localhost:3000/medications/reminder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationData)
            });

            console.log("=== RESPOSTA RECEBIDA ===");
            console.log("Status:", response.status);
            console.log("Status OK:", response.ok);

            // Ler resposta como texto primeiro
            const responseText = await response.text();
            console.log("Resposta em texto:", responseText);

            // Tentar fazer parse do JSON
            let result;
            try {
                result = JSON.parse(responseText);
                console.log("JSON parseado:", result);
            } catch (parseError) {
                console.error("Erro ao parsear JSON:", parseError);
                console.error("Texto da resposta que falhou:", responseText);
                throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 200)}`);
            }

            if (!response.ok) {
                console.log("=== ERRO HTTP ===");
                console.log("Status:", response.status);
                console.log("Mensagem de erro do backend:", result.message);
                throw new Error(result.message || `Erro HTTP ${response.status}`);
            }

            console.log("=== SUCESSO NA API ===");
            return result;

        } catch (error) {
            console.error("=== ERRO NA FUNÇÃO saveMedicationReminder ===");
            console.error("Tipo do erro:", error.name);
            console.error("Mensagem:", error.message);
            console.error("Stack:", error.stack);

            // Re-lançar o erro para ser capturado no catch principal
            throw error;
        }
    }

    form.addEventListener("submit", async function (ev) {
        ev.preventDefault();

        // Obter dados do formulário
        const name = document.getElementById("medication-name").value.trim();
        const quantity = document.getElementById("quantity").value.trim();
        const unit = document.getElementById("unit").value.trim();
        const time = document.getElementById("time").value.trim();
        const description = document.getElementById("description") ?
            document.getElementById("description").value.trim() : '';

        // Pegar os dias selecionados
        const selectedDays = Array.from(document.querySelectorAll('input[name="days"]:checked'))
            .map(input => input.value);

        console.log('Dias selecionados:', selectedDays.length);

        // Obter user_id do localStorage
        const userId = localStorage.getItem('user_id');

        if (!userId) {
            showErrorToast('Usuário não identificado. Faça login novamente.');
            return;
        }

        console.log("Name:", name);
        console.log("Quantity:", quantity);
        console.log("Unit:", unit);
        console.log("Time:", time);
        console.log("Selected days:", selectedDays.length);

        // Validação básica no frontend
        if (!name || !quantity || !unit || !time || selectedDays.length === 0) {
            console.log("Falhou na validação básica");
            showErrorToast('Preencha todos os campos obrigatórios');
            return;
        }

        // Validações adicionais no frontend
        if (name.length < 2 || name.length > 100) {
            showErrorToast('Nome do medicamento deve ter entre 2 e 100 caracteres');
            return;
        }

        if (isNaN(quantity) || quantity <= 0 || quantity > 9999) {
            showErrorToast('Quantidade deve ser um número entre 1 e 9999');
            return;
        }

        if (description && description.length > 500) {
            showErrorToast('Descrição deve ter no máximo 500 caracteres');
            return;
        }

        // Validar formato de horário
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            showErrorToast('Horário deve estar no formato correto (HH:MM)');
            return;
        }

        // Preparar dados para envio
        const medicationData = {
            user_id: userId,
            name: name,
            quantity: parseInt(quantity),
            unit: unit,
            time: time,
            days: selectedDays,
            description: description || null
        };

        // Desabilitar botão para evitar cliques duplos
        saveButton.disabled = true;
        saveButton.classList.add("opacity-60", "cursor-not-allowed");

        // Alterar texto do botão
        const originalText = saveButton.textContent;
        saveButton.textContent = "Salvando...";

        try {
            console.log('Enviando dados:', medicationData);

            const result = await saveMedicationReminder(medicationData);

            console.log('Resultado do salvamento:', result);

            // Mostrar toast de sucesso
            showToast(toastSuccess, 2000);

            // Redirecionar após 2 segundos
            setTimeout(() => {
                window.location.href = "../TelaInicial/index.html";
            }, 2000);

        } catch (error) {
            console.error('Erro ao salvar:', error);

            // Mostrar mensagem de erro específica ou genérica
            const errorMessage = error.message || 'Erro ao salvar lembrete. Tente novamente.';
            showErrorToast(errorMessage);

            // Reabilitar botão
            saveButton.disabled = false;
            saveButton.classList.remove("opacity-60", "cursor-not-allowed");
            saveButton.textContent = originalText;
        }
    });

    // Substitua a parte de validação do seu código por esta versão com mais logs:

    // form.addEventListener("submit", async function (ev) {
    //     ev.preventDefault();

    //     // Obter dados do formulário
    //     const name = document.getElementById("medication-name").value.trim();
    //     const quantity = document.getElementById("quantity").value.trim();
    //     const unit = document.getElementById("unit").value.trim();
    //     const time = document.getElementById("time").value.trim();
    //     const description = document.getElementById("description") ?
    //         document.getElementById("description").value.trim() : '';

    //     // Pegar os dias selecionados
    //     const selectedDays = Array.from(document.querySelectorAll('input[name="days"]:checked'))
    //         .map(input => input.value);

    //     // Obter user_id do localStorage
    //     const userId = localStorage.getItem('user_id');

    //     // LOGS DETALHADOS PARA DEBUG
    //     console.log("=== DEBUG COMPLETO ===");
    //     console.log("Name:", `"${name}"`, "Length:", name.length, "Truthy:", !!name);
    //     console.log("Quantity:", `"${quantity}"`, "Length:", quantity.length, "Truthy:", !!quantity);
    //     console.log("Unit:", `"${unit}"`, "Length:", unit.length, "Truthy:", !!unit);
    //     console.log("Time:", `"${time}"`, "Length:", time.length, "Truthy:", !!time);
    //     console.log("Selected days array:", selectedDays);
    //     console.log("Selected days length:", selectedDays.length);
    //     console.log("Selected days truthy:", selectedDays.length > 0);
    //     console.log("UserId:", `"${userId}"`, "Truthy:", !!userId);
    //     console.log("Description:", `"${description}"`);

    //     // TESTE CADA CONDIÇÃO INDIVIDUALMENTE
    //     const nameValid = !!name;
    //     const quantityValid = !!quantity;
    //     const unitValid = !!unit;
    //     const timeValid = !!time;
    //     const daysValid = selectedDays.length > 0;
    //     const userValid = !!userId;

    //     console.log("=== VALIDAÇÕES ===");
    //     console.log("Name válido:", nameValid);
    //     console.log("Quantity válido:", quantityValid);
    //     console.log("Unit válido:", unitValid);
    //     console.log("Time válido:", timeValid);
    //     console.log("Days válido:", daysValid);
    //     console.log("User válido:", userValid);

    //     if (!userId) {
    //         console.log("ERRO: User ID não encontrado");
    //         showErrorToast('Usuário não identificado. Faça login novamente.');
    //         return;
    //     }

    //     // Validação básica no frontend - COM LOGS ESPECÍFICOS
    //     if (!nameValid) {
    //         console.log("ERRO: Nome inválido");
    //         showErrorToast('Nome do medicamento é obrigatório');
    //         return;
    //     }

    //     if (!quantityValid) {
    //         console.log("ERRO: Quantidade inválida");
    //         showErrorToast('Quantidade é obrigatória');
    //         return;
    //     }

    //     if (!unitValid) {
    //         console.log("ERRO: Unidade inválida");
    //         showErrorToast('Unidade é obrigatória');
    //         return;
    //     }

    //     if (!timeValid) {
    //         console.log("ERRO: Horário inválido");
    //         showErrorToast('Horário é obrigatório');
    //         return;
    //     }

    //     if (!daysValid) {
    //         console.log("ERRO: Dias inválidos - nenhum dia selecionado");
    //         showErrorToast('Selecione pelo menos um dia da semana');
    //         return;
    //     }

    //     console.log("=== TODAS VALIDAÇÕES PASSARAM ===");

    //     // Continue com o resto do código...
    // });

    // Função para resetar o formulário
    function resetForm() {
        form.reset();
        // Desmarcar todos os checkboxes de dias
        document.querySelectorAll('input[name="days"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Botão de cancelar (se existir)
    const cancelButton = document.getElementById("cancel-button");
    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            window.location.href = "../TelaInicial/index.html";
        });
    }

    // Função para validação em tempo real (opcional)
    function setupRealTimeValidation() {
        const nameInput = document.getElementById("medication-name");
        const quantityInput = document.getElementById("quantity");
        const descriptionInput = document.getElementById("description");

        if (nameInput) {
            nameInput.addEventListener("input", function () {
                const value = this.value.trim();
                if (value.length > 100) {
                    this.setCustomValidity("Nome deve ter no máximo 100 caracteres");
                } else if (value.length > 0 && value.length < 2) {
                    this.setCustomValidity("Nome deve ter pelo menos 2 caracteres");
                } else {
                    this.setCustomValidity("");
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener("input", function () {
                const value = parseInt(this.value);
                if (isNaN(value) || value <= 0) {
                    this.setCustomValidity("Quantidade deve ser maior que zero");
                } else if (value > 9999) {
                    this.setCustomValidity("Quantidade deve ser menor que 10000");
                } else {
                    this.setCustomValidity("");
                }
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener("input", function () {
                const value = this.value.trim();
                if (value.length > 500) {
                    this.setCustomValidity("Descrição deve ter no máximo 500 caracteres");
                } else {
                    this.setCustomValidity("");
                }
            });
        }
    }

    // Inicializar validação em tempo real
    setupRealTimeValidation();

    // Log para debug
    console.log("Script de medicamentos carregado com sucesso!");
});