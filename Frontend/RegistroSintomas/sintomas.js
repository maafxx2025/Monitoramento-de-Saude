document.addEventListener("DOMContentLoaded", function () {
    console.log("Script de sintomas carregado!"); // Debug

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

    // Validação do sentimento (emoção)
    function validateEmotion() {
        console.log("Validando emoção"); // Debug

        const emotionRadios = document.querySelectorAll('input[name="emotion"]');
        let selectedEmotion = null;

        for (let radio of emotionRadios) {
            if (radio.checked) {
                selectedEmotion = parseInt(radio.value);
                break;
            }
        }

        if (!selectedEmotion) {
            return { valid: false, message: 'Por favor, selecione como você está se sentindo' };
        }

        if (selectedEmotion < 1 || selectedEmotion > 5) {
            return { valid: false, message: 'Valor de sentimento inválido' };
        }

        return { valid: true, value: selectedEmotion };
    }

    // Validação dos sintomas
    function validateSymptoms(symptomsText) {
        console.log("Validando sintomas:", symptomsText); // Debug

        if (!symptomsText || symptomsText.trim() === '') {
            return { valid: false, message: 'Descrição dos sintomas é obrigatória' };
        }

        const trimmedSymptoms = symptomsText.trim();

        if (trimmedSymptoms.length < 3) {
            return { valid: false, message: 'Descrição dos sintomas deve ter pelo menos 3 caracteres' };
        }

        if (trimmedSymptoms.length > 500) {
            return { valid: false, message: 'Descrição dos sintomas deve ter no máximo 500 caracteres' };
        }

        return { valid: true, value: trimmedSymptoms };
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
    // function getSelectedDate() {
    //     console.log("Obtendo data selecionada"); // Debug
    //     if (todayRadio.checked) {
    //         // Obter data de hoje no horário de Brasília
    //         const today = new Date();
    //         const brasiliaTime = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    //         const dateString = brasiliaTime.toISOString().split('T')[0];
    //         console.log("Data hoje (Brasília):", dateString);
    //         return dateString;
    //     } else {
    //         const otherDate = document.getElementById('other-date').value;
    //         console.log("Outra data:", otherDate);
    //         return otherDate;
    //     }
    // }

    // Função para obter a data selecionada
    function getSelectedDate() {
        console.log("Obtendo data selecionada"); // Debug
        if (todayRadio.checked) {
            // Obter data de hoje no horário de Brasília - VERSÃO CORRIGIDA
            const today = new Date();
            const brasiliaTime = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

            // Formatar manualmente para evitar conversão UTC
            const year = brasiliaTime.getFullYear();
            const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
            const day = String(brasiliaTime.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            console.log("Data hoje (Brasília):", dateString);
            return dateString;
        } else {
            const otherDate = document.getElementById('other-date').value;
            console.log("Outra data:", otherDate);
            return otherDate;
        }
    }

    // Função para salvar no banco
    async function saveSymptomsRecord(data) {
        try {
            console.log("Enviando dados para API:", data); // Debug

            const response = await fetch('http://localhost:3000/health/symptoms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Resposta da API:", result); // Debug

            if (result.success) {
                showSuccess('Registro de sintomas salvo com sucesso!');
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

            // Se existe registro mas NÃO tem dados de sintomas, pode salvar automaticamente
            if (result.exists && !result.hasSymptomsData) {
                console.log("Registro existe mas sem dados de sintomas. Salvando automaticamente...");
                return true;
            }

            // Se existe registro E já tem dados de sintomas, perguntar se quer atualizar
            if (result.exists && result.hasSymptomsData) {
                return confirm('Já existe um registro de sintomas para esta data. Deseja atualizar as informações?');
            }

            return true;
        } catch (error) {
            console.error('Erro ao verificar data:', error);
            return true; // Continua se não conseguir verificar
        }
    }

    // Função para limpar o formulário
    function clearForm() {
        // Limpar seleção de emoções
        const emotionRadios = document.querySelectorAll('input[name="emotion"]');
        emotionRadios.forEach(radio => radio.checked = false);

        // Limpar campo de sintomas
        document.getElementById('symptoms-observations').value = '';

        // Limpar campo de data e voltar para "Hoje"
        document.getElementById('other-date').value = '';
        todayRadio.checked = true;
        toggleDatePicker();

        console.log("Formulário limpo");
    }

    // Event listener do botão salvar
    saveButton.addEventListener('click', async function (e) {
        console.log("Botão salvar sintomas clicado!"); // Debug
        e.preventDefault();

        try {
            // Obter valores dos campos
            const selectedDate = getSelectedDate();
            const symptomsText = document.getElementById('symptoms-observations').value;

            console.log("Valores obtidos:", { selectedDate, symptomsText }); // Debug

            // Verificar se usuário está logado
            const userId = localStorage.getItem('user_id');

            if (!userId) {
                showError('Usuário não identificado. Faça login novamente.');
                return;
            }

            console.log("User ID:", userId); // Debug

            // Validar emoção/sentimento
            const emotionValidation = validateEmotion();
            if (!emotionValidation.valid) {
                showError(emotionValidation.message);
                return;
            }

            // Validar sintomas
            const symptomsValidation = validateSymptoms(symptomsText);
            if (!symptomsValidation.valid) {
                showError(symptomsValidation.message);
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
                sentiment: emotionValidation.value,
                symptoms: symptomsValidation.value
            };

            console.log("Dados preparados:", recordData); // Debug

            // Salvar no banco
            await saveSymptomsRecord(recordData);

        } catch (error) {
            console.error("Erro no processo:", error);
            showError("Erro inesperado: " + error.message);
        }
    });

    // Validação em tempo real do campo de sintomas (contador de caracteres)
    const symptomsInput = document.getElementById('symptoms-observations');
    if (symptomsInput) {
        // Adicionar contador de caracteres
        const charCountDiv = document.createElement('div');
        charCountDiv.className = 'text-sm text-gray-500 mt-1';
        charCountDiv.id = 'char-counter';
        symptomsInput.parentNode.appendChild(charCountDiv);

        symptomsInput.addEventListener('input', function (e) {
            const value = e.target.value;
            const length = value.length;

            // Atualizar contador
            document.getElementById('char-counter').textContent = `${length}/500 caracteres`;

            // Validação visual
            if (length > 500) {
                e.target.classList.add('border-red-500');
                document.getElementById('char-counter').classList.add('text-red-500');
            } else if (length < 3 && length > 0) {
                e.target.classList.add('border-yellow-500');
                document.getElementById('char-counter').classList.remove('text-red-500');
                document.getElementById('char-counter').classList.add('text-yellow-500');
            } else {
                e.target.classList.remove('border-red-500', 'border-yellow-500');
                document.getElementById('char-counter').classList.remove('text-red-500', 'text-yellow-500');
            }
        });

        // Inicializar contador
        symptomsInput.dispatchEvent(new Event('input'));
    }

    // Definir data máxima como hoje
    const otherDateInput = document.getElementById('other-date');
    if (otherDateInput) {
        const brasiliaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        otherDateInput.max = brasiliaTime.toISOString().split('T')[0];
    }

    console.log("Script de sintomas totalmente carregado e funcionando!"); // Debug final
});