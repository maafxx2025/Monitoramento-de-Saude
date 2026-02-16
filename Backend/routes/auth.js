const express = require("express");
const router = express.Router();
// const supabase = require("../db");
const { supabase, supabaseAdmin } = require("../db.js"); // ajuste o caminho

// Rota de cadastro
router.post("/signup", async (req, res) => {
    const { name, email, password, passwordConfirmation, emergency_phone } = req.body;

    // Validações básicas
    if (!name || !email || !password || !passwordConfirmation || !emergency_phone) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos." });
    }

    if (password !== passwordConfirmation) {
        return res.status(400).json({ success: false, message: "As senhas não conferem." });
    }

    // 1 - Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    const user = data.user;

    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert([{ id: user.id, name, emergency_phone }]);

    if (profileError) {
        return res.status(400).json({ success: false, message: profileError.message });
    }

    return res.json({ success: true, message: "Usuário cadastrado com sucesso!" });
});

// 🔹 Rota de login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Informe email e senha." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    // Pega o user_id
    const user = data.user;

    // 🔹 Busca o perfil do usuário na tabela profiles
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("dob, gender, weight, height, chronic_conditions")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.error("Erro ao buscar perfil:", profileError.message);
        return res.status(500).json({ success: false, message: "Erro ao verificar perfil." });
    }

    // 🔹 Verifica se o perfil está incompleto
    const needsProfile = !profile || !profile.dob || !profile.gender || !profile.weight || !profile.height || !profile.chronic_conditions;

    // Salva token no cookie
    res.cookie("access_token", data.session.access_token, { httpOnly: true });
    res.json({ success: true, message: "Login realizado com sucesso!", user: { id: user.id, email: user.email }, needsProfile });
});

// Rota para buscar dados do usuário
router.get("/user/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*") // Busca todas as colunas
            .eq("id", id)
            .single();

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.json({ success: true, user: data });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});


module.exports = router;
