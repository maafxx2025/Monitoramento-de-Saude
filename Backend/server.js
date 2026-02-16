const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();
const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Diz para o Express servir a pasta Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Rotas
const authRoutes = require("./routes/auth");// Importa as rotas de autenticação
const profileRoutes = require("./routes/profile");// Importa as rotas de perfil
const healthRoutes = require('./routes/sinaisVitais');// Importa as rotas de Sinais Vitais
const medicationRoutes = require('./routes/medications'); // Importa as rotas de Lembrete de medicações

app.use("/auth", authRoutes);// Usa as rotas de autenticação
app.use("/profile", profileRoutes);// Usa as rotas de perfil
app.use('/health', healthRoutes);// Usa as rotas de Sinais Vitais
app.use('/medications', medicationRoutes);// Usa as rotas de Lembrete de medicações

// Rota para exibir o login.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/login/login.html"));
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
