// medications.js - Rotas para gerenciamento de lembretes de medicamentos
const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../db");

// Rota para salvar lembrete de medicamento - CORRIGIDA
router.post("/reminder", async (req, res) => {
    const { user_id, name, quantity, unit, time, days, description } = req.body;

    console.log("=== DADOS RECEBIDOS ===");
    console.log("user_id:", user_id);
    console.log("name:", name);
    console.log("quantity:", quantity);
    console.log("unit:", unit);
    console.log("time:", time);
    console.log("days:", days);
    console.log("description:", description);

    // Validações básicas
    if (!user_id || !name || !quantity || !unit || !time || !days || !Array.isArray(days)) {
        return res.status(400).json({
            success: false,
            message: "Dados obrigatórios: user_id, name, quantity, unit, time e days (array)"
        });
    }

    // Validações específicas
    if (name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({
            success: false,
            message: "Nome do medicamento deve ter entre 2 e 100 caracteres"
        });
    }

    if (isNaN(quantity) || quantity <= 0 || quantity > 9999) {
        return res.status(400).json({
            success: false,
            message: "Quantidade deve ser um número entre 1 e 9999"
        });
    }

    // Validar unidade do medicamento
    const validUnits = ['mg', 'ml', 'comprimido', 'capsula', 'gota', 'aplicação'];
    if (!validUnits.includes(unit.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: "Unidade deve ser: mg, ml, comprimido, capsula, gota ou aplicação"
        });
    }

    // Validar formato de horário (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        return res.status(400).json({
            success: false,
            message: "Horário deve estar no formato HH:MM (ex: 08:30)"
        });
    }

    // Validar dias da semana
    const validDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const invalidDays = days.filter(day => !validDays.includes(day.toLowerCase()));
    if (invalidDays.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Dias inválidos encontrados. Use: segunda, terca, quarta, quinta, sexta, sabado, domingo"
        });
    }

    if (days.length === 0 || days.length > 7) {
        return res.status(400).json({
            success: false,
            message: "Deve selecionar pelo menos 1 dia e no máximo 7 dias"
        });
    }

    // Validar descrição (opcional)
    if (description && description.trim().length > 500) {
        return res.status(400).json({
            success: false,
            message: "Descrição deve ter no máximo 500 caracteres"
        });
    }

    try {
        console.log("=== VERIFICANDO SE USUÁRIO EXISTE NA TABELA PROFILES ===");

        // CORRIGIDO: Verificar se o usuário existe na tabela PROFILES
        const { data: userExists, error: userError } = await supabaseAdmin
            .from("profiles") // MUDOU DE "users" PARA "profiles"
            .select("id")
            .eq("id", user_id)
            .single();

        console.log("Resultado da busca na tabela profiles:");
        console.log("- userExists:", userExists);
        console.log("- userError:", userError);

        if (userError) {
            console.error("Erro ao buscar usuário na tabela profiles:", userError);

            // Se for erro PGRST116, significa que não encontrou o usuário
            if (userError.code === 'PGRST116') {
                return res.status(400).json({
                    success: false,
                    message: "Usuário não encontrado na tabela profiles"
                });
            }

            return res.status(400).json({
                success: false,
                message: "Erro ao verificar usuário: " + userError.message
            });
        }

        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        console.log("✅ Usuário encontrado na tabela profiles:", userExists);

        // Verificar se já existe um lembrete com o mesmo nome, horário e dias para este usuário
        console.log("=== VERIFICANDO LEMBRETES DUPLICADOS ===");

        const { data: existingReminder, error: checkError } = await supabaseAdmin
            .from("medication_reminders")
            .select("id")
            .eq("user_id", user_id)
            .eq("name", name.trim())
            .eq("time", time)
            .contains("days", days);

        console.log("Verificação de lembretes duplicados:");
        console.log("- existingReminder:", existingReminder);
        console.log("- checkError:", checkError);

        if (checkError) {
            console.error("Erro ao verificar lembretes duplicados:", checkError);
        }

        if (existingReminder && existingReminder.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Já existe um lembrete para este medicamento no mesmo horário e dias"
            });
        }

        // Inserir novo lembrete
        console.log("=== INSERINDO NOVO LEMBRETE ===");

        const medicationData = {
            user_id,
            name: name.trim(),
            quantity: Number(quantity),
            unit: unit.toLowerCase(),
            time,
            days: days.map(day => day.toLowerCase()),
            description: description ? description.trim() : null,
            created_at: new Date().toISOString()
        };

        console.log("Dados que serão inseridos:", medicationData);

        const { data, error: insertError } = await supabaseAdmin
            .from("medication_reminders")
            .insert([medicationData])
            .select();

        console.log("Resultado da inserção:");
        console.log("- data:", data);
        console.log("- insertError:", insertError);

        if (insertError) {
            console.error("Erro ao inserir lembrete:", insertError);
            return res.status(400).json({
                success: false,
                message: "Erro ao salvar lembrete: " + insertError.message
            });
        }

        console.log("✅ Lembrete salvo com sucesso!");

        return res.json({
            success: true,
            message: "Lembrete de medicamento salvo com sucesso!",
            data: data[0]
        });

    } catch (err) {
        console.error("Erro interno ao salvar lembrete:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

// Rota para buscar lembretes de medicamentos do usuário
router.get("/reminders/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const { active_only } = req.query; // opcional: só lembretes ativos

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id é obrigatório"
        });
    }

    try {
        console.log(`=== BUSCANDO LEMBRETES PARA USER_ID: ${user_id} ===`);

        let query = supabaseAdmin
            .from("medication_reminders")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        // Se solicitado apenas lembretes ativos (opcional - você pode adicionar campo 'active' na tabela)
        if (active_only === 'true') {
            // Assumindo que você pode adicionar um campo 'active' boolean na tabela
            // query = query.eq("active", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao buscar lembretes:", error);
            return res.status(400).json({
                success: false,
                message: "Erro ao buscar lembretes: " + error.message
            });
        }

        console.log(`✅ Encontrados ${data?.length || 0} lembretes`);

        return res.json({
            success: true,
            data: data || [],
            total: data ? data.length : 0
        });

    } catch (err) {
        console.error("Erro interno ao buscar lembretes:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});


// Rota para marcar medicamento como tomado
router.post("/taken", async (req, res) => {
    const { user_id, medication_reminder_id } = req.body;

    if (!user_id || !medication_reminder_id) {
        return res.status(400).json({
            success: false,
            message: "user_id e medication_reminder_id são obrigatórios"
        });
    }

    try {
        console.log(`=== MARCANDO MEDICAMENTO COMO TOMADO ===`);
        console.log("User ID:", user_id);
        console.log("Medication Reminder ID:", medication_reminder_id);

        // Data de hoje no formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Verificar se já foi marcado como tomado hoje
        const { data: alreadyTaken } = await supabaseAdmin
            .from("medication_taken")
            .select("id")
            .eq("user_id", user_id)
            .eq("medication_reminder_id", medication_reminder_id)
            .eq("taken_date", today)
            .single();

        if (alreadyTaken) {
            return res.json({
                success: true,
                message: "Medicamento já foi marcado como tomado hoje",
                already_taken: true
            });
        }

        // Inserir registro de medicamento tomado
        const { data, error } = await supabaseAdmin
            .from("medication_taken")
            .insert([{
                user_id,
                medication_reminder_id,
                taken_date: today,
                taken_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error("Erro ao marcar medicamento como tomado:", error);
            return res.status(400).json({
                success: false,
                message: "Erro ao salvar: " + error.message
            });
        }

        console.log("✅ Medicamento marcado como tomado com sucesso");

        return res.json({
            success: true,
            message: "Medicamento marcado como tomado!",
            data: data[0]
        });

    } catch (err) {
        console.error("Erro interno:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

// Rota para buscar medicamentos de hoje (atualizada para excluir os já tomados)
router.get("/today/:user_id", async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id é obrigatório"
        });
    }

    try {
        // Obter dia atual da semana em português
        const today = new Date();
        const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const currentDay = daysOfWeek[today.getDay()];
        const todayDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`=== BUSCANDO MEDICAMENTOS DE HOJE (${currentDay}) PARA USER_ID: ${user_id} ===`);

        // Buscar medicamentos do dia
        const { data: medications, error: medError } = await supabaseAdmin
            .from("medication_reminders")
            .select("id, name, quantity, unit, time, description")
            .eq("user_id", user_id)
            .contains("days", [currentDay])
            .order("time", { ascending: true });

        if (medError) {
            console.error("Erro ao buscar medicamentos:", medError);
            return res.status(400).json({
                success: false,
                message: "Erro ao buscar medicamentos: " + medError.message
            });
        }

        // Buscar quais medicamentos já foram tomados hoje
        const { data: takenToday, error: takenError } = await supabaseAdmin
            .from("medication_taken")
            .select("medication_reminder_id")
            .eq("user_id", user_id)
            .eq("taken_date", todayDate);

        if (takenError) {
            console.error("Erro ao buscar medicamentos tomados:", takenError);
            // Continuar mesmo com erro, apenas loggar
        }

        // IDs dos medicamentos já tomados hoje
        const takenIds = new Set(takenToday?.map(t => t.medication_reminder_id) || []);

        console.log("Medicamentos já tomados hoje:", Array.from(takenIds));

        // Filtrar medicamentos que ainda não foram tomados
        const pendingMedications = medications?.filter(med => !takenIds.has(med.id)) || [];

        console.log(`✅ Encontrados ${pendingMedications.length} medicamentos pendentes para hoje`);

        // Função para formatar unidades
        const formatUnit = (quantity, unit) => {
            const unitMap = {
                'mg': 'mg',
                'ml': 'ml',
                'comprimido': quantity > 1 ? 'comprimidos' : 'comprimido',
                'capsula': quantity > 1 ? 'cápsulas' : 'cápsula',
                'gota': quantity > 1 ? 'gotas' : 'gota',
                'aplicacao': quantity > 1 ? 'aplicações' : 'aplicação'
            };
            return unitMap[unit.toLowerCase()] || unit;
        };

        // Formatar os dados para o frontend
        const formattedData = pendingMedications.map(med => ({
            id: med.id,
            name: med.name,
            quantity: med.quantity,
            unit: med.unit,
            time: med.time,
            description: med.description,
            // Formatação para exibição
            display_name: `${med.name} ${med.quantity} ${formatUnit(med.quantity, med.unit)}`,
            display_time: `Tomar às ${med.time}`
        }));

        return res.json({
            success: true,
            data: formattedData,
            total: formattedData.length,
            current_day: currentDay,
            date: todayDate,
            taken_count: takenIds.size,
            total_scheduled: medications?.length || 0
        });

    } catch (err) {
        console.error("Erro interno ao buscar medicamentos de hoje:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

// Rota para buscar lembretes de hoje por usuário
// router.get("/today/:user_id", async (req, res) => {
//     const { user_id } = req.params;

//     if (!user_id) {
//         return res.status(400).json({
//             success: false,
//             message: "user_id é obrigatório"
//         });
//     }

//     try {
//         // Obter dia atual da semana em português
//         const today = new Date();
//         const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
//         const currentDay = daysOfWeek[today.getDay()];

//         console.log(`=== BUSCANDO MEDICAMENTOS DE HOJE (${currentDay}) PARA USER_ID: ${user_id} ===`);

//         const { data, error } = await supabaseAdmin
//             .from("medication_reminders")
//             .select("id, name, quantity, unit, time, description")
//             .eq("user_id", user_id)
//             .contains("days", [currentDay])
//             .order("time", { ascending: true });

//         if (error) {
//             console.error("Erro ao buscar medicamentos de hoje:", error);
//             return res.status(400).json({
//                 success: false,
//                 message: "Erro ao buscar medicamentos: " + error.message
//             });
//         }

//         console.log(`✅ Encontrados ${data?.length || 0} medicamentos para hoje`);

//         // Função para formatar unidades
//         const formatUnit = (quantity, unit) => {
//             const unitMap = {
//                 'mg': 'mg',
//                 'ml': 'ml',
//                 'comprimido': quantity > 1 ? 'comprimidos' : 'comprimido',
//                 'capsula': quantity > 1 ? 'cápsulas' : 'cápsula',
//                 'gota': quantity > 1 ? 'gotas' : 'gota',
//                 'aplicacao': quantity > 1 ? 'aplicações' : 'aplicação'
//             };
//             return unitMap[unit.toLowerCase()] || unit;
//         };

//         // Formatar os dados para o frontend
//         const formattedData = data?.map(med => ({
//             id: med.id,
//             name: med.name,
//             quantity: med.quantity,
//             unit: med.unit,
//             time: med.time,
//             description: med.description,
//             // Formatação para exibição
//             display_name: `${med.name} ${med.quantity} ${formatUnit(med.quantity, med.unit)}`,
//             display_time: `Tomar às ${med.time}`
//         })) || [];

//         return res.json({
//             success: true,
//             data: formattedData,
//             total: formattedData.length,
//             current_day: currentDay,
//             date: today.toISOString().split('T')[0] // YYYY-MM-DD
//         });

//     } catch (err) {
//         console.error("Erro interno ao buscar medicamentos de hoje:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Erro interno do servidor"
//         });
//     }
// });


// Rota para atualizar lembrete
router.put("/reminder/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id, name, quantity, unit, time, days, description } = req.body;

    if (!id || !user_id) {
        return res.status(400).json({
            success: false,
            message: "ID do lembrete e user_id são obrigatórios"
        });
    }

    try {
        console.log(`=== ATUALIZANDO LEMBRETE ID: ${id} PARA USER_ID: ${user_id} ===`);

        // Verificar se o lembrete existe e pertence ao usuário
        const { data: existingReminder, error: findError } = await supabaseAdmin
            .from("medication_reminders")
            .select("id, name")
            .eq("id", id)
            .eq("user_id", user_id)
            .single();

        if (findError) {
            console.error("Erro ao buscar lembrete:", findError);
            if (findError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: "Lembrete não encontrado ou não pertence ao usuário"
                });
            }
            return res.status(400).json({
                success: false,
                message: "Erro ao verificar lembrete: " + findError.message
            });
        }

        if (!existingReminder) {
            return res.status(404).json({
                success: false,
                message: "Lembrete não encontrado"
            });
        }

        console.log(`✅ Lembrete encontrado: ${existingReminder.name}`);

        // Construir objeto de atualização apenas com campos fornecidos
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (quantity) updateData.quantity = Number(quantity);
        if (unit) updateData.unit = unit.toLowerCase();
        if (time) updateData.time = time;
        if (days && Array.isArray(days)) updateData.days = days.map(day => day.toLowerCase());
        if (description !== undefined) updateData.description = description ? description.trim() : null;

        console.log("Dados que serão atualizados:", updateData);

        const { error: updateError } = await supabaseAdmin
            .from("medication_reminders")
            .update(updateData)
            .eq("id", id);

        if (updateError) {
            console.error("Erro ao atualizar lembrete:", updateError);
            return res.status(400).json({
                success: false,
                message: "Erro ao atualizar lembrete: " + updateError.message
            });
        }

        console.log("✅ Lembrete atualizado com sucesso!");

        return res.json({
            success: true,
            message: "Lembrete atualizado com sucesso!"
        });

    } catch (err) {
        console.error("Erro ao atualizar lembrete:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

// Rota para deletar lembrete
router.delete("/reminder/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!id || !user_id) {
        return res.status(400).json({
            success: false,
            message: "ID do lembrete e user_id são obrigatórios"
        });
    }

    try {
        console.log(`=== DELETANDO LEMBRETE ID: ${id} PARA USER_ID: ${user_id} ===`);

        // Verificar se o lembrete existe e pertence ao usuário
        const { data: existingReminder, error: findError } = await supabaseAdmin
            .from("medication_reminders")
            .select("id, name")
            .eq("id", id)
            .eq("user_id", user_id)
            .single();

        if (findError) {
            console.error("Erro ao buscar lembrete:", findError);
            if (findError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: "Lembrete não encontrado ou não pertence ao usuário"
                });
            }
            return res.status(400).json({
                success: false,
                message: "Erro ao verificar lembrete: " + findError.message
            });
        }

        if (!existingReminder) {
            return res.status(404).json({
                success: false,
                message: "Lembrete não encontrado"
            });
        }

        console.log(`✅ Lembrete encontrado: ${existingReminder.name}`);

        const { error: deleteError } = await supabaseAdmin
            .from("medication_reminders")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Erro ao deletar lembrete:", deleteError);
            return res.status(400).json({
                success: false,
                message: "Erro ao deletar lembrete: " + deleteError.message
            });
        }

        console.log("✅ Lembrete deletado com sucesso!");

        return res.json({
            success: true,
            message: "Lembrete deletado com sucesso!"
        });

    } catch (err) {
        console.error("Erro ao deletar lembrete:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

// Rota para buscar lembretes de medicamentos do usuário
// router.get("/reminders/:user_id", async (req, res) => {
//     const { user_id } = req.params;
//     const { active_only } = req.query; // opcional: só lembretes ativos

//     if (!user_id) {
//         return res.status(400).json({
//             success: false,
//             message: "user_id é obrigatório"
//         });
//     }

//     try {
//         let query = supabaseAdmin
//             .from("medication_reminders")
//             .select("*")
//             .eq("user_id", user_id)
//             .order("created_at", { ascending: false });

//         // Se solicitado apenas lembretes ativos (opcional - você pode adicionar campo 'active' na tabela)
//         if (active_only === 'true') {
//             // Assumindo que você pode adicionar um campo 'active' boolean na tabela
//             // query = query.eq("active", true);
//         }

//         const { data, error } = await query;

//         if (error) {
//             console.error("Erro ao buscar lembretes:", error);
//             return res.status(400).json({
//                 success: false,
//                 message: "Erro ao buscar lembretes: " + error.message
//             });
//         }

//         return res.json({
//             success: true,
//             data: data || [],
//             total: data ? data.length : 0
//         });

//     } catch (err) {
//         console.error("Erro interno ao buscar lembretes:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Erro interno do servidor"
//         });
//     }
// });

// // Rota para buscar lembretes de hoje por usuário
// router.get("/today/:user_id", async (req, res) => {
//     const { user_id } = req.params;

//     if (!user_id) {
//         return res.status(400).json({
//             success: false,
//             message: "user_id é obrigatório"
//         });
//     }

//     try {
//         // Obter dia atual da semana em português
//         const today = new Date();
//         const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
//         const currentDay = daysOfWeek[today.getDay()];

//         const { data, error } = await supabaseAdmin
//             .from("medication_reminders")
//             .select("*")
//             .eq("user_id", user_id)
//             .contains("days", [currentDay])
//             .order("time", { ascending: true });

//         if (error) {
//             console.error("Erro ao buscar lembretes de hoje:", error);
//             return res.status(400).json({
//                 success: false,
//                 message: "Erro ao buscar lembretes: " + error.message
//             });
//         }

//         return res.json({
//             success: true,
//             data: data || [],
//             total: data ? data.length : 0,
//             current_day: currentDay
//         });

//     } catch (err) {
//         console.error("Erro interno ao buscar lembretes de hoje:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Erro interno do servidor"
//         });
//     }
// });

// // Rota para atualizar lembrete
// router.put("/reminder/:id", async (req, res) => {
//     const { id } = req.params;
//     const { user_id, name, quantity, unit, time, days, description } = req.body;

//     if (!id || !user_id) {
//         return res.status(400).json({
//             success: false,
//             message: "ID do lembrete e user_id são obrigatórios"
//         });
//     }

//     try {
//         // Verificar se o lembrete existe e pertence ao usuário
//         const { data: existingReminder } = await supabaseAdmin
//             .from("medication_reminders")
//             .select("id")
//             .eq("id", id)
//             .eq("user_id", user_id)
//             .single();

//         if (!existingReminder) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Lembrete não encontrado"
//             });
//         }

//         // Construir objeto de atualização apenas com campos fornecidos
//         const updateData = {};
//         if (name) updateData.name = name.trim();
//         if (quantity) updateData.quantity = Number(quantity);
//         if (unit) updateData.unit = unit.toLowerCase();
//         if (time) updateData.time = time;
//         if (days) updateData.days = days.map(day => day.toLowerCase());
//         if (description !== undefined) updateData.description = description ? description.trim() : null;

//         const { error } = await supabaseAdmin
//             .from("medication_reminders")
//             .update(updateData)
//             .eq("id", id);

//         if (error) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Erro ao atualizar lembrete: " + error.message
//             });
//         }

//         return res.json({
//             success: true,
//             message: "Lembrete atualizado com sucesso!"
//         });

//     } catch (err) {
//         console.error("Erro ao atualizar lembrete:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Erro interno do servidor"
//         });
//     }
// });

// // Rota para deletar lembrete
// router.delete("/reminder/:id", async (req, res) => {
//     const { id } = req.params;
//     const { user_id } = req.body;

//     if (!id || !user_id) {
//         return res.status(400).json({
//             success: false,
//             message: "ID do lembrete e user_id são obrigatórios"
//         });
//     }

//     try {
//         // Verificar se o lembrete existe e pertence ao usuário
//         const { data: existingReminder } = await supabaseAdmin
//             .from("medication_reminders")
//             .select("id")
//             .eq("id", id)
//             .eq("user_id", user_id)
//             .single();

//         if (!existingReminder) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Lembrete não encontrado"
//             });
//         }

//         const { error } = await supabaseAdmin
//             .from("medication_reminders")
//             .delete()
//             .eq("id", id);

//         if (error) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Erro ao deletar lembrete: " + error.message
//             });
//         }

//         return res.json({
//             success: true,
//             message: "Lembrete deletado com sucesso!"
//         });

//     } catch (err) {
//         console.error("Erro ao deletar lembrete:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Erro interno do servidor"
//         });
//     }
// });

module.exports = router;