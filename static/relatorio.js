 window.onload = function () {
  // ✅ Gráfico: Formas de Pagamento (BARRAS)
  const ctx3 = document.getElementById('graficoFormasPagamento')?.getContext('2d');
  if (ctx3 && formasPagamento && formasPagamento.length && qtdPagamentos && qtdPagamentos.length) {
    new Chart(ctx3, {
      type: 'bar',  // ✅ Mudou de 'pie' para 'bar'
      data: {
        labels: formasPagamento,
        datasets: [{
          label: 'Quantidade de Vendas',
          data: qtdPagamentos,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          borderColor: 'black',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico: Vendas Mensais
  const ctx2 = document.getElementById('graficoVendasMensais');
  if (ctx2 && meses && meses.length > 0 && vendasMensais && vendasMensais.length > 0) {
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
  }

  // Gráfico: Produtos Mais Vendidos (BARRAS)
  const ctx4 = document.getElementById('graficoProdutosVendidos')?.getContext('2d');
  if (ctx4 && produtos && produtos.length > 0) {
    new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: produtos.map(p => p.nome),
        datasets: [{
          label: 'Quantidade Vendida',
          data: produtos.map(p => p.quantidade),
          backgroundColor: [
            '#FF6384',
            '#36A2EB', 
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#C9CBCF'
          ],
          borderColor: 'black',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { 
          y: { beginAtZero: true },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    });
  }
};

// PDF continua igual...
const btnTexto = document.getElementById('btnPDFTexto');
if (btnTexto) {
  btnTexto.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait' });

    let linha = 20;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(12);

    pdf.text('Relatório de Vendas', 105, linha, { align: 'center' });
    linha += 10;

    pdf.text(`Custo Total:     R$ ${custo_total.toFixed(2)}`, 20, linha); linha += 6;
    pdf.text(`Total de Vendas: R$ ${total_vendas.toFixed(2)}`, 20, linha); linha += 6;
    pdf.text(`Lucro Previsto:  R$ ${lucro_previsto.toFixed(2)}`, 20, linha); linha += 10;

    pdf.setFontSize(11);
    pdf.text('Produtos Vendidos:', 20, linha); linha += 6;
    pdf.setFontSize(9);
    pdf.text('Nome           Qtd   Unit.Custo   Unit.Venda   Total.Custo   Total.Venda   Lucro', 20, linha); linha += 5;
    pdf.line(20, linha, 200, linha); linha += 3;

    produtos.forEach(prod => {
      const linhaTexto = `${prod.nome.padEnd(14).slice(0,14)} ${String(prod.quantidade).padStart(3)}   ` +
        `R$ ${prod.preco_custo.toFixed(2).padStart(8)}   R$ ${prod.preco_venda.toFixed(2).padStart(8)}   ` +
        `R$ ${prod.total_custo.toFixed(2).padStart(10)}   R$ ${prod.total_venda.toFixed(2).padStart(10)}   R$ ${prod.lucro.toFixed(2).padStart(8)}`;

      pdf.text(linhaTexto, 20, linha);
      linha += 6;
      if (linha > 270) { pdf.addPage(); linha = 20; }
    });

    linha += 6;
    pdf.setFontSize(11);
    pdf.text('Formas de Pagamento:', 20, linha); linha += 6;

    formasPagamento.forEach((fp, i) => {
      const texto = `• ${fp.padEnd(10)} — ${qtdPagamentos[i]} venda(s)`;
      pdf.text(texto, 25, linha);
      linha += 6;
      if (linha > 280) { pdf.addPage(); linha = 20; }
    });

    pdf.save('relatorio_escrito.pdf');
  });
}