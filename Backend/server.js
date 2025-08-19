const express = require("express");
const dotenv = require("dotenv");
// const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();
const app = express();
const PORT = 3000;

// Conexão com Supabase
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Diz para o Express servir a pasta Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Rotas
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Rota para exibir o login.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/login/login.html"));
});

// // Rota de login
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     // if (error) {
//     //     return res.redirect(`/error.html?msg=${encodeURIComponent(error.message)}`);
//     // }
//     if (error) {
//         return res.status(400).json({ success: false, message: error.message });
//     }

//     // Salva token no cookie
//     res.cookie("access_token", data.session.access_token, { httpOnly: true });
//     res.json({ success: true });

// });

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
