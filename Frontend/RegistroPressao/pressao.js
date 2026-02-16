document.addEventListener("DOMContentLoaded", function () {
    console.log("Script de pressão carregado!"); // Debug

    const todayRadio = document.getElementById('pressure-today');
    const otherDateRadio = document.getElementById('pressure-other-date-radio');
    const datePickerContainer = document.getElementById('pressure-date-picker-container');
    const saveButton = document.getElementById('pressure-save-button');

    // Verificar se todos os elementos foram encontrados
    if (!todayRadio || !otherDateRadio || !datePickerContainer || !saveButton) {
        console.error("Erro: Elementos não encontrados!");
        return;
    }

    // Toggle do date picker
    function toggleDatePicker() {
        console.log("Toggle date picker chamado"); // Debug
        if (otherDateRadio.checked) {
            datePickerContainer.classList.remove('hidden');
        } else {
            datePickerContainer.classList.add('hidden');
        }
    }

    todayRadio.addEventListener('change', toggleDatePicker);
    otherDateRadio.addEventListener('change', toggleDatePicker);
    toggleDatePicker();

    // Função para mostrar mensagens de erro
    function showError(message) {
        alert("ERRO: " + message);
        console.error("Erro:", message);
    }

    // Função para mostrar mensagens de sucesso
    function showSuccess(message) {
        alert("SUCESSO: " + message);
        console.log("Sucesso:", message);
    }

    // Validação da pressão arterial
    function validateBloodPressure(value) {
        console.log("Validando pressão:", value); // Debug

        if (!value || value.trim() === '') {
            return { valid: false, message: 'Valor da pressão arterial é obrigatório' };
        }

        // Verificar formato 120/80
        const pressurePattern = /^\d{2,3}\/\d{2,3}$/;
        if (!pressurePattern.test(value)) {
            return { valid: false, message: 'Formato inválido. Use o formato 120/80' };
        }

        // Extrair valores sistólica e diastólica
        const [systolic, diastolic] = value.split('/').map(num => parseInt(num));

        // Validar faixas
        if (systolic < 70 || systolic > 250) {
            return { valid: false, message: 'Pressão sistólica deve estar entre 70 e 250 mmHg' };
        }

        if (diastolic < 40 || diastolic > 150) {
            return { valid: false, message: 'Pressão diastólica deve estar entre 40 e 150 mmHg' };
        }

        if (systolic <= diastolic) {
            return { valid: false, message: 'Pressão sistólica deve ser maior que a diastólica' };
        }

        return {
            valid: true,
            systolic: systolic,
            diastolic: diastolic
        };
    }

    // Validação da data
    function validateDate(dateString) {
        console.log("Validando data:", dateString);

        if (!dateString || dateString.trim() === '') {
            return { valid: false, message: 'Data é obrigatória' };
        }

        // Obter data de hoje no formato YYYY-MM-DD no horário de Brasília
        const now = new Date();
        const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const todayString = brasiliaTime.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log("Data selecionada:", dateString);
        console.log("Hoje (Brasília):", todayString);

        // Comparar strings diretamente (funciona perfeitamente para YYYY-MM-DD)
        if (dateString > todayString) {
            return { valid: false, message: 'Não é possível registrar uma data futura' };
        }

        // Um ano atrás
        const oneYearAgo = new Date(brasiliaTime.getFullYear() - 1, brasiliaTime.getMonth(), brasiliaTime.getDate());
        const oneYearAgoString = oneYearAgo.toISOString().split('T')[0];

        if (dateString < oneYearAgoString) {
            return { valid: false, message: 'Data não pode ser anterior a um ano' };
        }

        return { valid: true, value: dateString };
    }

    // Função para obter a data selecionada
    function getSelectedDate() {
        console.log("Obtendo data selecionada"); // Debug
        if (todayRadio.checked) {
            // Obter data de hoje no horário de Brasília
            const today = new Date();
            const brasiliaTime = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const dateString = brasiliaTime.toISOString().split('T')[0];
            console.log("Data hoje (Brasília):", dateString);
            return dateString;
        } else {
            const otherDate = document.getElementById('pressure-other-date').value;
            console.log("Outra data:", otherDate);
            return otherDate;
        }
    }

    // Função para salvar no banco
    async function savePressureRecord(data) {
        try {
            console.log("Enviando dados para API:", data); // Debug

            const response = await fetch('http://localhost:3000/health/pressure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Resposta da API:", result); // Debug

            if (result.success) {
                showSuccess('Registro salvo com sucesso!');
                // Limpar formulário
                clearForm();
                return true;
            } else {
                showError(result.message || 'Erro ao salvar registro');
                return false;
            }
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro de conexão. Tente novamente.');
            return false;
        }
    }

    // Função para verificar registros duplicados
    async function checkDuplicateDate(userId, date) {
        try {
            console.log("Verificando duplicidade para:", { userId, date }); // Debug

            const response = await fetch(`http://localhost:3000/health/check-date?user_id=${userId}&date=${date}`);
            const result = await response.json();

            console.log("Resultado da verificação:", result); // Debug

            // Se não existe registro, pode salvar normalmente
            if (!result.exists) {
                return true;
            }

            // Se existe registro mas NÃO tem dados de pressão, pode salvar automaticamente
            if (result.exists && !result.hasPressureData) {
                console.log("Registro existe mas sem dados de pressão. Salvando automaticamente...");
                return true;
            }

            // Se existe registro E já tem dados de pressão, perguntar se quer atualizar
            if (result.exists && result.hasPressureData) {
                return confirm('Já existe um registro de pressão arterial para esta data. Deseja atualizar os valores?');
            }

            return true;
        } catch (error) {
            console.error('Erro ao verificar data:', error);
            return true; // Continua se não conseguir verificar
        }
    }

    // Função para limpar o formulário
    function clearForm() {
        document.getElementById('blood-pressure').value = '';
        document.getElementById('pressure-observations').value = '';
        document.getElementById('pressure-other-date').value = '';
        todayRadio.checked = true;
        toggleDatePicker();
    }

    // Event listener do botão salvar
    saveButton.addEventListener('click', async function (e) {
        console.log("Botão salvar pressão clicado!"); // Debug
        e.preventDefault();

        try {
            // Obter valores dos campos
            const pressureValue = document.getElementById('blood-pressure').value;
            const selectedDate = getSelectedDate();
            const observations_pressao = document.getElementById('pressure-observations').value.trim();

            console.log("Valores obtidos:", { pressureValue, selectedDate, observations_pressao }); // Debug

            // Verificar se usuário está logado
            const userId = localStorage.getItem('user_id');

            if (!userId) {
                showError('Usuário não identificado. Faça login novamente.');
                return;
            }

            console.log("User ID:", userId); // Debug

            // Validar pressão arterial
            const pressureValidation = validateBloodPressure(pressureValue);
            if (!pressureValidation.valid) {
                showError(pressureValidation.message);
                return;
            }

            // Validar data
            const dateValidation = validateDate(selectedDate);
            if (!dateValidation.valid) {
                showError(dateValidation.message);
                return;
            }

            // Verificar se já existe registro para esta data
            const confirmDuplicate = await checkDuplicateDate(userId, dateValidation.value);
            if (!confirmDuplicate) {
                console.log("Usuário cancelou a substituição do registro duplicado");
                return;
            }

            // Preparar dados para envio
            const recordData = {
                user_id: userId,
                date: dateValidation.value,
                blood_pressure_systolic: pressureValidation.systolic,
                blood_pressure_diastolic: pressureValidation.diastolic,
                observations_pressao: observations_pressao || null
            };

            console.log("Dados preparados:", recordData); // Debug

            // Salvar no banco
            await savePressureRecord(recordData);

        } catch (error) {
            console.error("Erro no processo:", error);
            showError("Erro inesperado: " + error.message);
        }
    });

    // Validação em tempo real do campo pressão
    const pressureInput = document.getElementById('blood-pressure');
    if (pressureInput) {
        pressureInput.addEventListener('input', function (e) {
            const value = e.target.value;
            const pressurePattern = /^\d{0,3}\/?(\d{0,3})?$/;

            if (value && !pressurePattern.test(value)) {
                e.target.setCustomValidity('Use o formato 120/80');
            } else {
                e.target.setCustomValidity('');
            }
        });

        // Formatação automática da barra
        pressureInput.addEventListener('keydown', function (e) {
            const value = e.target.value;

            // Se digitou número e não tem barra ainda, adiciona barra após 2-3 dígitos
            if (/^\d{2,3}$/.test(value) && e.key >= '0' && e.key <= '9') {
                setTimeout(() => {
                    if (!value.includes('/')) {
                        e.target.value = value + '/';
                    }
                }, 10);
            }
        });
    }

    // Definir data máxima como hoje
    const otherDateInput = document.getElementById('pressure-other-date');
    if (otherDateInput) {
        otherDateInput.max = new Date().toISOString().split('T')[0];
    }

    console.log("Script de pressão totalmente carregado e funcionando!"); // Debug final
});