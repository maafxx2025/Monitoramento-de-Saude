document.addEventListener("DOMContentLoaded", function () {
    const medicationsContainer = document.getElementById("medications-container");
    const medicationsLoading = document.getElementById("medications-loading");
    const medicationsList = document.getElementById("medications-list");
    const medicationsEmpty = document.getElementById("medications-empty");
    const medicationsError = document.getElementById("medications-error");
    const retryBtn = document.getElementById("retry-medications");
    const medicationTemplate = document.getElementById("medication-item-template");

    // Função para mostrar estado específico
    function showState(state) {
        // Esconder todos os estados
        medicationsLoading.classList.add("hidden");
        medicationsList.classList.add("hidden");
        medicationsEmpty.classList.add("hidden");
        medicationsError.classList.add("hidden");

        // Mostrar o estado solicitado
        document.getElementById(`medications-${state}`).classList.remove("hidden");
    }

    // Função para buscar medicamentos de hoje
    async function loadTodayMedications() {
        console.log("=== CARREGANDO MEDICAMENTOS DE HOJE ===");

        showState('loading');

        try {
            // Obter user_id do localStorage
            const userId = localStorage.getItem('user_id');

            if (!userId) {
                console.error("User ID não encontrado no localStorage");
                showErrorState("Usuário não identificado. Faça login novamente.");
                return;
            }

            console.log("User ID:", userId);

            // Fazer requisição para a API
            const response = await fetch(`http://localhost:3000/medications/today/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Status da resposta:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro da API:", errorData);
                throw new Error(errorData.message || 'Erro ao carregar medicamentos');
            }

            const data = await response.json();
            console.log("Dados recebidos:", data);

            if (!data.success) {
                throw new Error(data.message || 'Erro ao carregar medicamentos');
            }

            // Exibir os medicamentos
            displayMedications(data.data, data.current_day);

        } catch (error) {
            console.error("Erro ao carregar medicamentos:", error);
            showErrorState(error.message);
        }
    }

    // Função para exibir os medicamentos na tela
    function displayMedications(medications, currentDay) {
        console.log("=== EXIBINDO MEDICAMENTOS ===");
        console.log("Medicamentos:", medications);
        console.log("Dia atual:", currentDay);

        // Limpar lista existente
        medicationsList.innerHTML = '';

        if (!medications || medications.length === 0) {
            showState('empty');
            return;
        }

        // Criar elementos para cada medicamento
        medications.forEach((med, index) => {
            const medicationElement = createMedicationElement(med, index);
            medicationsList.appendChild(medicationElement);
        });

        // Mostrar a lista
        showState('list');

        console.log(`✅ ${medications.length} medicamentos exibidos`);
    }


    // Função para formatar unidade no frontend
    function formatMedicationUnit(quantity, unit) {
        const unitMap = {
            'mg': 'mg',
            'ml': 'ml',
            'comprimido': quantity > 1 ? 'comprimidos' : 'comprimido',
            'capsula': quantity > 1 ? 'cápsulas' : 'cápsula',
            'gota': quantity > 1 ? 'gotas' : 'gota',
            'aplicacao': quantity > 1 ? 'aplicações' : 'aplicação'
        };
        return unitMap[unit.toLowerCase()] || unit;
    }

    // Função para criar elemento de medicamento
    function createMedicationElement(medication, index) {
        // Clonar o template
        const template = medicationTemplate.content.cloneNode(true);
        const medicationElement = template.querySelector('.medication-item');

        // Preencher os dados
        const nameElement = template.querySelector('.medication-name');
        const timeElement = template.querySelector('.medication-time');
        const confirmBtn = template.querySelector('.confirm-medication-btn');

        // Formatação personalizada no frontend (caso não venha formatado do backend)
        const displayName = medication.display_name ||
            `${medication.name} ${medication.quantity} ${formatMedicationUnit(medication.quantity, medication.unit)}`;

        nameElement.textContent = medication.display_name;
        timeElement.textContent = medication.display_time;

        // Adicionar ID único para o elemento
        medicationElement.setAttribute('data-medication-id', medication.id);
        medicationElement.setAttribute('data-index', index);

        // Adicionar evento ao botão de confirmar
        confirmBtn.addEventListener('click', function () {
            handleMedicationConfirm(medication, medicationElement);
        });

        return medicationElement;
    }

    // Função para salvar medicamento como tomado no backend
    async function saveMedicationTaken(medicationId) {
        const userId = localStorage.getItem('user_id');

        if (!userId) {
            throw new Error('Usuário não identificado');
        }

        console.log("Salvando medicamento como tomado...");
        console.log("User ID:", userId);
        console.log("Medication ID:", medicationId);

        const response = await fetch('http://localhost:3000/medications/taken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                medication_reminder_id: medicationId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar medicamento como tomado');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Erro ao salvar medicamento como tomado');
        }

        console.log("✅ Medicamento salvo como tomado no backend");
        return data;
    }

    // Função para lidar com confirmação de medicamento
    async function handleMedicationConfirm(medication, element) {
        console.log("=== CONFIRMANDO MEDICAMENTO ===");
        console.log("Medicamento:", medication);

        // // Desabilitar botão imediatamente para evitar cliques duplicados
        const confirmBtn = element.querySelector('.confirm-medication-btn');
        confirmBtn.disabled = true;

        // Mostrar estado de carregamento
        const originalText = confirmBtn.querySelector('span').textContent;
        confirmBtn.querySelector('span').textContent = 'Salvando...';

        try {
            // Salvar no backend
            await saveMedicationTaken(medication.id);

            // Adicionar estado visual de confirmado
            element.style.opacity = '0.6';
            element.style.transform = 'scale(0.98)';

            // Alterar botão para estado de sucesso
            confirmBtn.querySelector('span').textContent = '✓ Tomado';
            confirmBtn.classList.remove('bg-[var(--green-accent)]');
            confirmBtn.classList.add('bg-gray-400', 'cursor-not-allowed');

            console.log(`✅ Medicamento ${medication.name} confirmado como tomado`);

            // Mostrar toast de sucesso
            showToast('Medicamento registrado como tomado!', 'success');

            // Opcional: remover da lista após alguns segundos
            setTimeout(() => {
                element.style.transition = 'all 0.3s ease-out';
                element.style.opacity = '0';
                element.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    element.remove();

                    // Verificar se ainda há medicamentos na lista
                    const remainingMeds = medicationsList.querySelectorAll('.medication-item');
                    if (remainingMeds.length === 0) {
                        showCompletedState();
                    }
                }, 300);
            }, 2000);

        } catch (error) {
            console.error("Erro ao confirmar medicamento:", error);

            // Restaurar botão em caso de erro
            confirmBtn.disabled = false;
            confirmBtn.querySelector('span').textContent = originalText;

            // Mostrar toast de erro
            showToast(`Erro ao confirmar medicamento: ${error.message}`, 'error');

            // Remover efeitos visuais de confirmação
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }
    }

    // Função para mostrar estado de erro
    function showErrorState(message) {
        showState('error');
        const errorContainer = medicationsError.querySelector('p:last-child');
        if (errorContainer) {
            errorContainer.textContent = message;
        }
    }

    // Função para mostrar estado de todos medicamentos tomados
    function showCompletedState() {
        medicationsList.innerHTML = `
            <div class="text-center p-8">
                <div class="text-[var(--green-accent)] space-y-2">
                    <div class="text-4xl">✓</div>
                    <p class="text-lg font-semibold">Parabéns!</p>
                    <p class="text-sm text-[var(--dark-gray)]">Você tomou todos os medicamentos de hoje.</p>
                </div>
            </div>
        `;
    }

    // Evento para tentar novamente
    if (retryBtn) {
        retryBtn.addEventListener('click', loadTodayMedications);
    }

    // Função para atualizar medicamentos (pode ser chamada periodicamente)
    function refreshMedications() {
        console.log("🔄 Atualizando lista de medicamentos");
        loadTodayMedications();
    }

    // Carregar medicamentos ao iniciar a página
    loadTodayMedications();

    // Opcional: Atualizar automaticamente a cada 5 minutos
    setInterval(refreshMedications, 5 * 60 * 1000);

    // Expor funções globalmente para uso externo se necessário
    window.medicationsManager = {
        refresh: refreshMedications,
        load: loadTodayMedications
    };


    // Função para mostrar toast de feedback
    function showToast(message, type = 'success') {
        // Criar elemento do toast se não existir
        let toast = document.getElementById('medication-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'medication-toast';
            toast.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 opacity-0 transform translate-y-2';
            document.body.appendChild(toast);
        }

        // Definir cor baseada no tipo
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white'
        };

        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${colors[type] || colors.success}`;
        toast.textContent = message;

        // Mostrar toast
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-2');
            toast.classList.add('opacity-100', 'translate-y-0');
        });

        // Esconder após 3 segundos
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-2');
        }, 3000);
    }


    console.log("✅ Script de medicamentos carregado com sucesso!");
});