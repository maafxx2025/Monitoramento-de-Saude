const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db.js');

// Rota para salvar registro de glicemia
router.post("/glucose", async (req, res) => {
    const { user_id, date, glucose, observations_glicemia } = req.body;

    // Validações básicas
    if (!user_id || !date || !glucose) {
        return res.status(400).json({
            success: false,
            message: "Dados obrigatórios: user_id, date e glucose"
        });
    }

    try {
        // Verifica se já existe registro para esta data
        const { data: existingRecord } = await supabaseAdmin
            .from("health_records")
            .select("id")
            .eq("user_id", user_id)
            .eq("date", date)
            .single();

        if (existingRecord) {
            // Atualiza registro existente
            const { error: updateError } = await supabaseAdmin
                .from("health_records")
                .update({
                    glucose,
                    observations_glicemia,
                    created_at: new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
                })
                .eq("id", existingRecord.id);

            if (updateError) {
                return res.status(400).json({ success: false, message: updateError.message });
            }
        } else {
            // Cria novo registro
            const { error: insertError } = await supabaseAdmin
                .from("health_records")
                .insert([{ user_id, date, glucose, observations_glicemia }]);

            if (insertError) {
                return res.status(400).json({ success: false, message: insertError.message });
            }
        }

        return res.json({ success: true, message: "Registro salvo com sucesso!" });

    } catch (err) {
        console.error("Erro ao salvar registro:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para verificar se já existe registro na data
router.get("/check-date", async (req, res) => {
    const { user_id, date } = req.query;

    if (!user_id || !date) {
        return res.status(400).json({ success: false, message: "user_id e date são obrigatórios" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("health_records")
            .select("id, blood_pressure_systolic, blood_pressure_diastolic, sentiment, symptoms") // Buscar todas as colunas relevantes
            .eq("user_id", user_id)
            .eq("date", date)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
            return res.status(400).json({ success: false, message: error.message });
        }

        // Se não encontrou nenhum registro
        if (!data) {
            return res.json({
                success: true,
                exists: false,
                hasPressureData: false,
                hasSymptomsData: false
            });
        }

        // Verificar se já tem dados de pressão arterial
        const hasPressureData = data.blood_pressure_systolic !== null && data.blood_pressure_diastolic !== null;

        // Verificar se já tem dados de sintomas
        const hasSymptomsData = data.sentiment !== null && data.symptoms !== null;


        return res.json({
            success: true,
            exists: true,
            hasPressureData: hasPressureData,
            hasSymptomsData: hasSymptomsData
        });

    } catch (err) {
        console.error("Erro ao verificar data:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para salvar registro de pressão arterial
router.post("/pressure", async (req, res) => {
    const { user_id, date, blood_pressure_systolic, blood_pressure_diastolic, observations_pressao } = req.body;

    // Validações básicas
    if (!user_id || !date || !blood_pressure_systolic || !blood_pressure_diastolic) {
        return res.status(400).json({
            success: false,
            message: "Dados obrigatórios: user_id, date, blood_pressure_systolic e blood_pressure_diastolic"
        });
    }

    // Validações adicionais de pressão
    if (blood_pressure_systolic < 70 || blood_pressure_systolic > 250) {
        return res.status(400).json({
            success: false,
            message: "Pressão sistólica deve estar entre 70 e 250 mmHg"
        });
    }

    if (blood_pressure_diastolic < 40 || blood_pressure_diastolic > 150) {
        return res.status(400).json({
            success: false,
            message: "Pressão diastólica deve estar entre 40 e 150 mmHg"
        });
    }

    if (blood_pressure_systolic <= blood_pressure_diastolic) {
        return res.status(400).json({
            success: false,
            message: "Pressão sistólica deve ser maior que a diastólica"
        });
    }

    try {
        // Verifica se já existe registro para esta data
        const { data: existingRecord } = await supabaseAdmin
            .from("health_records")
            .select("id")
            .eq("user_id", user_id)
            .eq("date", date)
            .single();

        if (existingRecord) {
            // Atualiza registro existente
            const { error: updateError } = await supabaseAdmin
                .from("health_records")
                .update({
                    blood_pressure_systolic,
                    blood_pressure_diastolic,
                    observations_pressao,
                    created_at: new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
                })
                .eq("id", existingRecord.id);

            if (updateError) {
                return res.status(400).json({ success: false, message: updateError.message });
            }
        } else {
            // Cria novo registro
            const { error: insertError } = await supabaseAdmin
                .from("health_records")
                .insert([{
                    user_id,
                    date,
                    blood_pressure_systolic,
                    blood_pressure_diastolic,
                    observations_pressao
                }]);

            if (insertError) {
                return res.status(400).json({ success: false, message: insertError.message });
            }
        }

        return res.json({ success: true, message: "Registro de pressão salvo com sucesso!" });

    } catch (err) {
        console.error("Erro ao salvar registro de pressão:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});


// Rota para salvar registro de sintomas
router.post("/symptoms", async (req, res) => {
    const { user_id, date, sentiment, symptoms } = req.body;

    // Validações básicas
    if (!user_id || !date || !sentiment || !symptoms) {
        return res.status(400).json({
            success: false,
            message: "Dados obrigatórios: user_id, date, sentiment e symptoms"
        });
    }

    // Validações adicionais de sentimento
    if (sentiment < 1 || sentiment > 5) {
        return res.status(400).json({
            success: false,
            message: "Sentimento deve estar entre 1 e 5"
        });
    }

    // Validações adicionais de sintomas
    if (typeof symptoms !== 'string' || symptoms.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Sintomas deve ter pelo menos 3 caracteres"
        });
    }

    if (symptoms.trim().length > 500) {
        return res.status(400).json({
            success: false,
            message: "Sintomas deve ter no máximo 500 caracteres"
        });
    }

    try {
        // Verifica se já existe registro para esta data
        const { data: existingRecord } = await supabaseAdmin
            .from("health_records")
            .select("id")
            .eq("user_id", user_id)
            .eq("date", date)
            .single();

        if (existingRecord) {
            // Atualiza registro existente
            const { error: updateError } = await supabaseAdmin
                .from("health_records")
                .update({
                    sentiment: parseInt(sentiment),
                    symptoms: symptoms.trim(),
                    created_at: new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
                })
                .eq("id", existingRecord.id);

            if (updateError) {
                return res.status(400).json({ success: false, message: updateError.message });
            }
        } else {
            // Cria novo registro
            const { error: insertError } = await supabaseAdmin
                .from("health_records")
                .insert([{
                    user_id,
                    date,
                    sentiment: parseInt(sentiment),
                    symptoms: symptoms.trim()
                }]);

            if (insertError) {
                return res.status(400).json({ success: false, message: insertError.message });
            }
        }

        return res.json({ success: true, message: "Registro de sintomas salvo com sucesso!" });

    } catch (err) {
        console.error("Erro ao salvar registro de sintomas:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});


// Rota para buscar resumo do dia atual
router.get("/daily-summary", async (req, res) => {
    const { user_id, date } = req.query;

    if (!user_id || !date) {
        return res.status(400).json({
            success: false,
            message: "user_id e date são obrigatórios"
        });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("health_records")
            .select("glucose, blood_pressure_systolic, blood_pressure_diastolic")
            .eq("user_id", user_id)
            .eq("date", date)
            .single();

        if (error && error.code !== 'PGRST116') {
            return res.status(400).json({ success: false, message: error.message });
        }

        // Se não encontrou registro
        if (!data) {
            return res.json({
                success: true,
                hasData: false,
                glucose: null,
                bloodPressure: null
            });
        }

        // Preparar dados de resposta
        const result = {
            success: true,
            hasData: true,
            glucose: null,
            bloodPressure: null
        };

        // Verificar e processar dados de glicemia
        if (data.glucose !== null) {
            const glucoseValue = data.glucose;
            let glucoseStatus = "Normal";
            let glucoseColor = "green";

            // Classificação da glicemia (mg/dL) em jejum
            if (glucoseValue < 70) {
                glucoseStatus = "Hipoglicemia (Baixa)";
                glucoseColor = "red";
            } else if (glucoseValue >= 70 && glucoseValue < 100) {
                glucoseStatus = "Normal";
                glucoseColor = "green";
            } else if (glucoseValue >= 100 && glucoseValue <= 125) {
                glucoseStatus = "Pré-diabetes";
                glucoseColor = "orange";
            } else { // Valores >= 126
                glucoseStatus = "Diabetes (Alta)";
                glucoseColor = "red";
            }

            result.glucose = {
                value: glucoseValue,
                status: glucoseStatus,
                color: glucoseColor,
                display: `${glucoseValue} mg/dL`
            };
        }

        // Verificar e processar dados de pressão arterial
        if (data.blood_pressure_systolic !== null && data.blood_pressure_diastolic !== null) {
            const systolic = data.blood_pressure_systolic;
            const diastolic = data.blood_pressure_diastolic;
            let pressureStatus = "Normal";
            let pressureColor = "green";

            // --- Classificação da pressão arterial ---
            // A ordem das verificações é importante: da mais grave para a mais leve.
            if (systolic >= 180 || diastolic >= 110) {
                pressureStatus = "Hipertensão Estágio 3 (Muito Alta)";
                pressureColor = "darkred"; // Risco muito alto

            } else if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) {
                pressureStatus = "Hipertensão Estágio 2";
                pressureColor = "red"; // Risco alto

            } else if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
                pressureStatus = "Hipertensão Estágio 1";
                pressureColor = "orangered"; // Alerta

            } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 85 && diastolic <= 89)) {
                pressureStatus = "Normal-alta (Pré-hipertensão)";
                pressureColor = "yellow"; // Atenção

            } else if ((systolic >= 120 && systolic <= 129) || (diastolic >= 80 && diastolic <= 84)) {
                pressureStatus = "Normal";
                pressureColor = "lightgreen"; // Saudável

            } else if (systolic < 90 || diastolic < 60) {
                pressureStatus = "Hipotensão (Baixa)";
                pressureColor = "lightblue"; // Informativo, avaliar caso a caso

            } else {
                // Caso não se encaixe em nenhuma das condições acima, é "Ótima"
                pressureStatus = "Ótima";
                pressureColor = "green"; // Ideal
            }


            result.bloodPressure = {
                systolic: systolic,
                diastolic: diastolic,
                status: pressureStatus,
                color: pressureColor,
                display: `${systolic}/${diastolic}`
            };
        }

        return res.json(result);

    } catch (err) {
        console.error("Erro ao buscar resumo diário:", err);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }
});

module.exports = router;