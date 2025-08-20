const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../db");

// Rota para salvar registro do paciente
router.post("/register", async (req, res) => {
    try {
        const { user_id, dob, gender, weight, height, chronic_conditions } = req.body;

        if (!user_id || !dob || !gender || !weight || !height) {
            return res.status(400).json({ success: false, message: "Preencha todos os campos obrigatórios." });
        }

        // Atualizar perfil com as novas informações
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                dob,
                gender,
                weight,
                height,
                chronic_conditions, // deve vir como array do frontend
            })
            .eq("id", user_id);

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.json({ success: true, message: "Registro salvo com sucesso!" });
    } catch (err) {
        console.error("Erro no /profile/register:", err);
        return res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
});

module.exports = router;
