# 📱 VivaBem – Monitoramento de Saúde

<div align="center">
  <img src="https://github.com/user-attachments/assets/61d3c5fb-9243-41dd-9539-9aa08ce3846a" alt="Tela Registro de Consultas 1" width="150px">
  <img src="https://github.com/user-attachments/assets/881d21b5-ab61-40cc-8b1b-840bbb1506d0" alt="Tela Registro de Consultas 2" width="150px">
  <img src="https://github.com/user-attachments/assets/2a0cb668-e4b9-4fd9-b4ba-40b4a690b9f8" alt="Tela Registro de Consultas 3" width="150px">
  <img src="https://github.com/user-attachments/assets/c64a2b38-8f01-4467-99f5-33ca875abe32" alt="Tela Registro de Consultas 4" width="150px">
  <img src="https://github.com/user-attachments/assets/19625e58-3f91-4d5a-9fed-c0fc04feefd4" alt="Tela Registro de Consultas 5" width="150px">
  <img src="https://github.com/user-attachments/assets/5bb15356-5ffa-46d7-9dfa-8cadbe3a4346" alt="Tela Registro de Consultas 6" width="150px">
</div>


O **VivaBem** é um aplicativo móvel voltado para pacientes crônicos, em especial **idosos**, que auxilia no **acompanhamento da saúde diária**.  
Ele permite o registro de **sinais vitais** (como glicemia e pressão arterial), **sintomas**, **medicamentos** e **consultas**, além de emitir **alertas e notificações** quando valores saem do normal.  

A proposta do projeto é **facilitar o cuidado contínuo**, ajudando pacientes e familiares a manterem o controle de informações essenciais e fornecendo dados organizados que podem apoiar a **tomada de decisão médica**.  

> 🚀 O app também conta com a implementação de **Inteligência Artificial**, que analisa os registros e fornece **recomendações personalizadas**, resumos em linguagem natural e relatórios de fácil visualização.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML, CSS, JavaScript  
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)  
- **Backend:** Node.js + Express  
- **Banco de Dados:** [Supabase](https://supabase.com/)  
- **Auxílio em Design:** Ferramentas de IA (Stitch)  

---

## 📲 Funcionalidades

- Registro diário de **sinais vitais** (pressão arterial, glicemia).  
- Cadastro de **sintomas** e acompanhamento histórico.  
- **Lembretes** de medicamentos, consultas e exames.  
- **Alertas inteligentes** quando valores estiverem fora do normal.  
- Geração de **gráficos** para acompanhamento da evolução da saúde.  
- Integração com **IA** para recomendações, resumos e relatórios.  

---

## 📸 Telas do Projeto

*(Aqui vamos adicionar as telas que você enviar, cada uma acompanhada de uma breve descrição de sua funcionalidade.)*

### 🔐 Tela de Login

A tela inicial do **VivaBem** é o ponto de entrada para o usuário acessar o aplicativo.  
Nela, é possível entrar com **e-mail e senha previamente cadastrados**.  
Também há a opção de **login com Google** *(funcionalidade ainda não implementada)*.  

Além disso, a tela oferece alternativas para:  
- **Cadastrar uma nova conta** (para novos usuários).  
- **Entrar como cuidador ou profissional** de saúde, com acesso apenas para monitorar dados de pacientes *(não implementado ainda)*.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/b9e9b46b-ab9a-4210-8df7-a4af5383c111" alt="Tela de Login" width="250px">
</div>

### 📝 Tela de Cadastro

A tela de cadastro permite que novos usuários criem uma conta no **VivaBem**.  
Para isso, o aplicativo solicita as seguintes informações:  

- **Nome completo**  
- **E-mail**  
- **Senha**  
- **Telefone de emergência**  

Todos esses dados são armazenados com segurança no banco de dados **Supabase**, garantindo que o usuário possa acessar o sistema posteriormente com seu login.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/7d6c3246-7574-45d5-a507-152849f85fb0" alt="Tela de Cadastro" width="250px">
</div>

### 🏠 Tela Inicial (Home)

Após o login com autenticação via **Supabase**, o usuário é direcionado para a tela inicial do **VivaBem**.  
Ela reúne as principais funcionalidades para o acompanhamento diário da saúde do paciente.

**Principais funcionalidades:**

- 👋 **Saudação personalizada**  
  Exibe um cumprimento de *bom dia, boa tarde ou boa noite* de acordo com o horário, acompanhado do nome do usuário.  
  *(A foto de perfil ainda não está integrada ao backend)*

- 💊 **Lembrete de Medicação**  
  Cards mostram os medicamentos que o usuário deve tomar no dia, com horário específico.  
  Cada card possui um botão **“Confirmar”**, que remove o lembrete assim que o usuário toma o remédio.  
  Caso o medicamento seja recorrente, ele volta a aparecer no dia seguinte.  

  Também há um botão **“Adicionar Medicação”**, permitindo cadastrar novos medicamentos para controle diário.

- ⚡ **Registro Rápido**  
  Seção prática para anotar medições de saúde e sintomas:  
  - Glicemia  
  - Pressão arterial  
  - Sintomas (mal-estar, dores, etc.)  
  Cada botão direciona para a tela correspondente de registro.

- 🚨 **Alertas de Saúde**  
  Se algum valor registrado (como glicemia ou pressão) estiver fora da faixa normal, um **alerta visual** é exibido para chamar a atenção do usuário.  

- 📊 **Resumo do Dia**  
  Exibe os valores de glicemia e pressão registrados, com indicação se estão **normais, altos ou baixos**, tanto por texto quanto visualmente.

- 🩺 **Próximas Consultas**  
  Cards informam as consultas médicas do dia, com **tipo de consulta, profissional/local e horário**.  
  O usuário também pode adicionar novas consultas clicando em **“Adicionar Consulta”**.

- 📱 **Navegação (Navbar)**  
  Localizada no rodapé, permite acessar outras áreas do app:  
  - Início  
  - Saúde  
  - Registros  
  - Perfil  

<div align="center" style="display: flex; justify-content: space-around;">
  <img src="https://github.com/user-attachments/assets/f491a089-28c6-4bdf-97c3-93505610889b" alt="Tela Inicial 1" width="250px">
  <img src="https://github.com/user-attachments/assets/b37da3fc-f695-4000-a446-9f641d6975ab" alt="Tela Inicial 2" width="250px">
</div>

### 💊 Tela de Adicionar Medicação

Nesta tela o usuário pode **registrar suas medicações** de forma detalhada para não esquecer de tomar seus remédios.  
O formulário permite inserir:  

- **Nome do medicamento** (ex: Paracetamol)  
- **Quantidade e unidade** (mg, ml, comprimido, cápsula, etc.)  
- **Horário exato** em que deve ser tomado  
- **Dias da semana** em que o uso é recorrente (estilo alarme de celular)  
- **Descrição opcional**, como recomendações de uso (ex: tomar com água).  

Após salvar, os medicamentos cadastrados aparecem na **tela inicial**, com **notificações e lembretes** configurados de acordo com o dia e hora definidos pelo usuário. Isso garante que ele seja sempre lembrado, evitando esquecimentos.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/fdcb0e40-6cbe-49ca-9572-b686b3c52564" alt="Tela de Adicionar Medicação" width="250px">
</div>

### 🩸 Tela de Registrar Glicemia  

Essa tela foi desenvolvida para que o usuário **registre facilmente sua glicemia diária**, permitindo acompanhar e monitorar seus níveis ao longo do tempo.  

O formulário contém:  
- **Valor da Glicemia** (em mg/dL)  
- **Data da medição**: pode ser registrada como **Hoje** ou selecionada manualmente em outra data  
- **Campo de Observações**: para anotações adicionais, como horário da refeição, sintomas ou uso de insulina  

Após clicar em **Salvar Registro**, os dados são armazenados no **Supabase** e automaticamente exibidos na **Tela Inicial** caso correspondam ao dia atual.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/9131b550-cfd1-41b3-b1f3-29fe1fb61ae9" alt="Tela de Registrar Glicemia" width="250px">
</div>

### 💓 Tela de Registrar Pressão Arterial  

Essa tela foi desenvolvida para que o usuário **registre facilmente sua pressão arterial diária**, permitindo acompanhar e monitorar seus níveis ao longo do tempo.  

O formulário contém:  
- **Valor da Pressão Arterial** (em mmHg), no formato `sistólica/diastólica` (ex: 120/80)  
- **Data da medição**: pode ser registrada como **Hoje** ou selecionada manualmente em outra data  
- **Campo de Observações**: para anotações adicionais, como sintomas, horário da medição ou recomendações médicas  

Após clicar em **Salvar Registro**, os dados são armazenados no **Supabase** e automaticamente exibidos na **Tela Inicial** caso correspondam ao dia atual.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/7a3ef639-a9fc-4ee1-85e2-fbcbbd483efd" alt="Tela de Registrar Pressão Arterial" width="250px">
</div>

### 🤒 Tela de Registrar Sintomas  

Essa tela foi desenvolvida para que o usuário **registre facilmente seus sintomas diários**, permitindo acompanhar seu estado de saúde ao longo do tempo.  

O formulário contém:  
- **Emoji de Emoção**: selecione como você está se sentindo, do mais triste 😫 ao mais feliz 😃  
- **Descrição dos sintomas**: espaço para detalhar sintomas específicos, como dor de cabeça, febre ou cansaço  
- **Data da medição**: pode ser registrada como **Hoje** ou selecionada manualmente em outra data  

Após clicar em **Salvar Registro**, os dados são armazenados no **Supabase** e automaticamente exibidos na **Tela Inicial** caso correspondam ao dia atual.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/6658eb54-3904-48a8-a4d6-2a7ade7383b3" alt="Tela de Registrar Sintomas" width="250px">
</div>

### 🗓️ Tela de Adicionar Lembrete de Consultas  

Essa tela foi desenvolvida para que o usuário **registre facilmente suas consultas médicas**, permitindo organizar sua agenda e receber lembretes para não perder nenhum compromisso.  

O formulário contém:  
- **Tipo de consulta**: escolha entre várias especialidades médicas ou selecione "Outros"  
- **Nome do(a) médico(a)** (opcional): para identificar o profissional responsável  
- **Data e horário da consulta**: para registrar quando a consulta ocorrerá  
- **Observações** (opcional): espaço para anotações adicionais, como exames a levar ou instruções médicas  

Após clicar em **Salvar Consulta**, os dados são armazenados no **Supabase** e podem ser exibidos na **Tela Inicial** ou em uma lista de lembretes.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/7b66f58b-caee-47e5-82f1-3cef2ed57f32" alt="Tela de Adicionar Lembrete de Consultas" width="250px">
</div>


### ❤️ Tela de Acompanhamento de Saúde  

Essa tela foi desenvolvida para que o usuário **acompanhe a evolução dos seus sinais vitais**, como glicemia e pressão arterial, ao longo do tempo, permitindo identificar tendências e receber alertas de saúde.  

A tela contém:  
- **Filtros de período**: selecione entre 7 dias, 1 mês, 3 meses, 6 meses, 1 ano ou todos os registros  
- **Gráfico interativo**: exibe a evolução dos registros de glicose e pressão arterial  
- **Resumo da semana/mês**: mostra médias, valores máximos e mínimos de glicose e pressão arterial  
- **Alertas de saúde**: mensagens de atenção ou risco baseado nos registros  
- **Últimos 5 registros**: lista detalhada com datas e valores de glicose e pressão arterial  
- **Botão Exportar Relatório**: gera um relatório em **PDF ou HTML** que pode ser compartilhado via **WhatsApp, email ou outros canais disponíveis no celular**. O relatório será aprimorado com **IA**, fornecendo:  
  - Previsões de tendências para a próxima semana  
  - Dicas personalizadas de saúde, alimentação e hábitos para melhorar os sinais vitais  
  - Recomendações do que evitar para manter a saúde em equilíbrio  

<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; margin-top: 10px; margin-bottom: 10px;" align="center">
  <img src="https://github.com/user-attachments/assets/792780c0-ed36-4aca-a6e3-1df917dc6662" width="150px" alt="Tela 1" />
  <img src="https://github.com/user-attachments/assets/76a72b33-0a42-4032-b155-ae6580ba775f" width="150px" alt="Tela 2" />
  <img src="https://github.com/user-attachments/assets/3af8085f-c112-4786-9af6-a5a36259a8fd" width="150px" alt="Tela 3" />
  <img src="https://github.com/user-attachments/assets/36354fe4-9c38-4631-8064-f810b29da597" width="150px" alt="Tela 4" />
</div>

### 📅 Tela de Registro de Consultas  

Essa tela foi desenvolvida para que o usuário **acompanhe e organize suas consultas e medicamentos de forma prática e intuitiva**.  

Nela, o usuário pode:  
- Visualizar as **consultas agendadas** e os **medicamentos programados**, separados por dia (📍 Hoje, 📍 Amanhã, etc).  
- Conferir **horário, profissional e local** da consulta.  
- **Editar, confirmar ou excluir** registros facilmente através dos botões de ação.  
- Marcar consultas ou medicamentos como **realizados**.  
- Adicionar novos registros utilizando o **botão flutuante “+”** no canto inferior.  

O objetivo dessa tela é fornecer uma **visão clara e organizada da rotina médica**, ajudando o usuário a **não perder compromissos importantes** relacionados à sua saúde.  

<div align="center">
  <img src="https://github.com/user-attachments/assets/ab2b8477-90f0-41bf-9fd8-84a387789ab9" alt="Tela Registro de Consultas 1" width="250px">
</div>


---

## 👥 Equipe

- **Thiago** – Fullstack Developer (layout, frontend, backend e banco de dados Supabase).  
- **Marlon** – Frontend Developer e Gestão de Projetos (telas do frontend, apresentações em pitch).  
- **Danilo** – Gestão de Projetos (organização e apoio no desenvolvimento).  

---

## 📌 Status do Projeto

🔨 Em desenvolvimento – MVP funcional já com cadastro de pacientes, registros de sinais vitais, sintomas, medicamentos e sistema de alertas.  

---

## 📜 Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.  
