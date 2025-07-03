window.onload = function () {
  // Gráfico 1: Quantidade Vendida por Produto
  const ctx = document.getElementById('graficoVendas').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: produtos.length ? produtos : ['Sem dados'],
      datasets: [{
        label: 'Quantidade Vendida',
        data: quantidades.length ? quantidades : [0],
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

  // Gráfico 2: Vendas Mensais
  const ctx2 = document.getElementById('graficoVendasMensais').getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: meses.length ? meses : ['Sem dados'],
      datasets: [{
        label: 'Vendas Mensais',
        data: vendasMensais.length ? vendasMensais : [0],
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
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

  // Gráfico 3: Formas de Pagamento (barra)
  const ctx3 = document.getElementById('graficoFormasPagamento').getContext('2d');
  new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: formasPagamento.length ? formasPagamento : ['Sem dados'],
      datasets: [{
        label: 'Formas de Pagamento',
        data: qtdPagamentos.length ? qtdPagamentos : [0],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ],
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
};