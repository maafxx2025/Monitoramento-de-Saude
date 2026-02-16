document.addEventListener("DOMContentLoaded", function () {
    console.log("Script carregado!"); // Debug

    const todayRadio = document.getElementById('today');
    const otherDateRadio = document.getElementById('other-date-radio');
    const datePickerContainer = document.getElementById('date-picker-container');
    const saveButton = document.getElementById('save-button');

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

    // Validação do valor da glicemia
    function validateGlucose(value) {
        console.log("Validando glicose:", value); // Debug

        if (!value || value.trim() === '') {
            return { valid: false, message: 'Valor da glicemia é obrigatório' };
        }

        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            return { valid: false, message: 'Valor da glicemia deve ser um número' };
        }

        if (numValue <= 0) {
            return { valid: false, message: 'Valor da glicemia deve ser maior que zero' };
        }

        if (numValue > 1000) {
            return { valid: false, message: 'Valor da glicemia parece muito alto (máximo 1000 mg/dL)' };
        }

        if (numValue < 10) {
            return { valid: false, message: 'Valor da glicemia parece muito baixo (mínimo 10 mg/dL)' };
        }

        return { valid: true, value: numValue };
    }

    // Validação da data
    function validateDate(dateString) {
        console.log("Validando data:", dateString); // Debug

        if (!dateString || dateString.trim() === '') {
            return { valid: false, message: 'Data é obrigatória' };
        }

        // Criar data selecionada no fuso horário local para evitar problemas de UTC
        const selectedDate = new Date(dateString + 'T00:00:00');

        // Obter data de hoje no fuso horário local
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        console.log("Data selecionada:", selectedDate); // Debug
        console.log("Hoje:", todayDateOnly); // Debug
        console.log("Comparação - selecionada > hoje:", selectedDate > todayDateOnly); // Debug

        if (isNaN(selectedDate.getTime())) {
            return { valid: false, message: 'Data inválida' };
        }

        if (selectedDate > todayDateOnly) {
            return { valid: false, message: 'Não é possível registrar uma data futura' };
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (selectedDate < oneYearAgo) {
            return { valid: false, message: 'Data não pode ser anterior a um ano' };
        }

        return { valid: true, value: dateString };
    }

    // Função para obter a data selecionada
    function getSelectedDate() {
        console.log("Obtendo data selecionada"); // Debug
        if (todayRadio.checked) {
            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            console.log("Data hoje:", dateString);
            return dateString;
        } else {
            const otherDate = document.getElementById('other-date').value;
            console.log("Outra data:", otherDate);
            return otherDate;
        }
    }

    // Função para salvar no banco
    async function saveGlucoseRecord(data) {
        try {
            console.log("Enviando dados para API:", data); // Debug

            const response = await fetch('http://localhost:3000/health/glucose', {
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

            if (result.exists) {
                return confirm('Já existe um registro para esta data. Deseja substituir?');
            }

            return true;
        } catch (error) {
            console.error('Erro ao verificar data:', error);
            return true; // Continua se não conseguir verificar
        }
    }

    // Função para limpar o formulário
    function clearForm() {
        document.getElementById('glycemia-value').value = '';
        document.getElementById('observations').value = '';
        document.getElementById('other-date').value = '';
        todayRadio.checked = true;
        toggleDatePicker();
    }

    // Event listener do botão salvar
    saveButton.addEventListener('click', async function (e) {
        console.log("Botão salvar clicado!"); // Debug
        e.preventDefault();

        try {
            // Obter valores dos campos
            const glucoseValue = document.getElementById('glycemia-value').value;
            const selectedDate = getSelectedDate();
            const observations_glicemia = document.getElementById('observations').value.trim();

            console.log("Valores obtidos:", { glucoseValue, selectedDate, observations_glicemia }); // Debug

            // Verificar se usuário está logado
            const userId = localStorage.getItem('user_id');

            if (!userId) {
                showError('Usuário não identificado. Faça login novamente.');
                return;
            }

            console.log("User ID:", userId); // Debug

            // Validar glicemia
            const glucoseValidation = validateGlucose(glucoseValue);
            if (!glucoseValidation.valid) {
                showError(glucoseValidation.message);
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
                glucose: glucoseValidation.value,
                observations_glicemia: observations_glicemia || null
            };

            console.log("Dados preparados:", recordData); // Debug

            // Salvar no banco
            await saveGlucoseRecord(recordData);

        } catch (error) {
            console.error("Erro no processo:", error);
            showError("Erro inesperado: " + error.message);
        }
    });

    // Validação em tempo real do campo glicemia
    const glucoseInput = document.getElementById('glycemia-value');
    if (glucoseInput) {
        glucoseInput.addEventListener('input', function (e) {
            const value = e.target.value;
            if (value && isNaN(parseFloat(value))) {
                e.target.setCustomValidity('Digite apenas números');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    // Definir data máxima como hoje
    const otherDateInput = document.getElementById('other-date');
    if (otherDateInput) {
        otherDateInput.max = new Date().toISOString().split('T')[0];
    }

    console.log("Script totalmente carregado e funcionando!"); // Debug final
});