window.onload = function () {
  // ✅ DECLARAR as variáveis primeiro (vem do template HTML)
  const formasPagamento = window.formasPagamento || [];
  const qtdPagamentos = window.qtdPagamentos || [];
  const meses = window.meses || [];
  const vendasMensais = window.vendasMensais || [];
  const produtos = window.produtos || [];
  const quantidades = window.quantidades || [];
  const custo_total = window.custo_total || 0;
  const total_vendas = window.total_vendas || 0;
  const lucro_previsto = window.lucro_previsto || 0;

  // DEBUG: Verificar dados
  console.log('Dados carregados:', {
    meses: meses,
    vendasMensais: vendasMensais,
    produtos: produtos,
    quantidades: quantidades
  });

  // Gráfico: Vendas Mensais
  const ctx2 = document.getElementById('graficoVendasMensais');
  if (ctx2 && meses.length > 0 && vendasMensais.length > 0) {
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Vendas Mensais (R$)',
          data: vendasMensais,
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
    console.log('✅ Gráfico vendas mensais criado');
  } else {
    console.log('❌ Sem dados para vendas mensais:', { meses, vendasMensais });
  }

  // Gráfico: Produtos Mais Vendidos
  const ctx1 = document.getElementById('graficoVendas');
  if (ctx1 && produtos.length > 0 && quantidades.length > 0) {
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: produtos,  // ✅ Array simples de nomes
        datasets: [{
          label: 'Quantidade Vendida',
          data: quantidades,  // ✅ Array simples de quantidades
          backgroundColor: 'gold',
          borderColor: 'black',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
    console.log('✅ Gráfico produtos criado');
  } else {
    console.log('❌ Sem dados para produtos:', { produtos, quantidades });
  }

  // Gráfico: Formas de Pagamento
  const ctx3 = document.getElementById('graficoFormasPagamento');
  if (ctx3 && formasPagamento.length > 0 && qtdPagamentos.length > 0) {
    new Chart(ctx3, {
      type: 'pie',
      data: {
        labels: formasPagamento,
        datasets: [{
          label: 'Formas de Pagamento',
          data: qtdPagamentos,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true
      }
    });
    console.log('✅ Gráfico formas pagamento criado');
  } else {
    console.log('❌ Sem dados para formas pagamento:', { formasPagamento, qtdPagamentos });
  }
};