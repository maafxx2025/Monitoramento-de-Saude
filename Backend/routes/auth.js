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

    // 2 - IMPORTANTE: Configura a sessão para este cliente
    // if (data.session) {
    //     await supabase.auth.setSession({
    //         access_token: data.session.access_token,
    //         refresh_token: data.session.refresh_token
    //     });
    // }


    // 3 - Salva dados extras na tabela profiles
    // const { error: profileError } = await supabase
    //     .from("profiles")
    //     .insert([{ id: user.id, name, emergency_phone }]);
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

    // Salva token no cookie
    res.cookie("access_token", data.session.access_token, { httpOnly: true });
    res.json({ success: true, message: "Login realizado com sucesso!" });
});


module.exports = router;
