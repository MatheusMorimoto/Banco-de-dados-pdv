window.onload = function () {
  const ctx = document.getElementById('graficoVendas').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: produtos,
      datasets: [{
        label: 'Quantidade Vendida',
        data: quantidades,
        backgroundColor: 'gold',
        borderColor: 'black',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  const ctx2 = document.getElementById('graficoVendasMensais').getContext('2d');
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Vendas Mensais',
        data: vendasMensais,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // 🚫 Remova ou comente isso:
  // calcularResumoFinanceiro();
};