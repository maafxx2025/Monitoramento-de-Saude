// Contextos dos gráficos
const ctxGlicemia = document.getElementById("grafico-glicemia");
const ctxPressao = document.getElementById("grafico-pressao");

// Glicemia
const graficoGlicemia = new Chart(ctxGlicemia, {
  type: "line",
  data: {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Glicemia (mg/dL)",
        data: [110, 115, 120, 105, 98, 102, 108],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: { responsive: true },
});

// Pressão arterial
const graficoPressao = new Chart(ctxPressao, {
  type: "line",
  data: {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Pressão Sistólica",
        data: [120, 125, 118, 130, 115, 122, 119],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pressão Diastólica",
        data: [80, 82, 78, 85, 76, 79, 77],
        borderColor: "#dc2626",
        backgroundColor: "rgba(220,38,38,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: { responsive: true },
});

// Simulação de atualização (sem backend)
setInterval(() => {
  const glicemiaAleatoria = 95 + Math.floor(Math.random() * 30);
  const sistolica = 110 + Math.floor(Math.random() * 20);
  const diastolica = 70 + Math.floor(Math.random() * 15);

  // Atualiza textos
  document.getElementById("glicemia-value").innerText =
    glicemiaAleatoria + " mg/dL";
  document.getElementById("pressao-value").innerText =
    sistolica + "/" + diastolica + " mmHg";

  // Atualiza gráfico glicemia
  graficoGlicemia.data.datasets[0].data.shift();
  graficoGlicemia.data.datasets[0].data.push(glicemiaAleatoria);
  graficoGlicemia.update();

  // Atualiza gráfico pressão
  graficoPressao.data.datasets[0].data.shift();
  graficoPressao.data.datasets[0].data.push(sistolica);
  graficoPressao.data.datasets[1].data.shift();
  graficoPressao.data.datasets[1].data.push(diastolica);
  graficoPressao.update();
}, 5000);
