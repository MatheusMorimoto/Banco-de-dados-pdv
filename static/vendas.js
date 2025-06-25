let carrinho = [];
let produtosDisponiveis = [];
let pagina = 0;
const porPagina = 12;

fetch('/api/produtos')
  .then(response => response.json())
  .then(produtos => {
    produtosDisponiveis = produtos;
    console.log('Produtos carregados:', produtosDisponiveis);

    const container = document.querySelector('.produtos-disponiveis');
    if (!container) {
      console.error('Div .produtos-disponiveis não encontrada!');
      return;
    }

    function renderizarProdutos(paginaAtual) {
      const inicio = paginaAtual * porPagina;
      const fim = inicio + porPagina;
      const lote = produtosDisponiveis.slice(inicio, fim);

      lote.forEach(produto => {
        const preco = parseFloat(produto.preco_unitario_venda) || 0;
        const div = document.createElement('div');
        div.className = 'produto-item';
        div.innerHTML = `
          <h3>${produto.nome}</h3>
          <p>R$ ${preco.toFixed(2)}</p>
          <p>Disponível: ${produto.total_unidades}</p>
          <label>Quantidade:</label>
          <input type="number" min="1" value="1" id="quantidade-${produto.id}" class="quantidade">
          <button class="btn-adicionar" data-id="${produto.id}">Adicionar</button>
        `;
        container.appendChild(div);
      });

      console.log('Produtos renderizados na página:', paginaAtual);
    }

    renderizarProdutos(pagina);
    pagina++;

    container.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-adicionar')) {
        const id = parseInt(e.target.dataset.id);
        console.log('Clique no botão Adicionar:', id);
        adicionarAoCarrinhoPorId(id);
      }
    });

    container.addEventListener('scroll', () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
        if (pagina * porPagina < produtosDisponiveis.length) {
          renderizarProdutos(pagina);
          pagina++;
        }
      }
    });
  })
  .catch(err => {
    console.error('Erro ao carregar produtos:', err);
    alert('Não foi possível carregar os produtos do banco.');
  });

function adicionarAoCarrinhoPorId(id, quantidade = 1) {
  console.log('adicionarAoCarrinhoPorId chamada - ID:', id);
  const produto = produtosDisponiveis.find(p => p.id === id);
  if (!produto) {
    console.warn('Produto não encontrado:', id);
    return;
  }

  const input = document.getElementById(`quantidade-${id}`);
  if (input && !isNaN(parseInt(input.value))) {
    quantidade = parseInt(input.value);
  }

  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    existente.quantidade += quantidade;
    console.log(`Quantidade atualizada: ${existente.nome} = ${existente.quantidade}`);
  } else {
    carrinho.push({ ...produto, quantidade });
    console.log(`Produto adicionado: ${produto.nome} x${quantidade}`);
  }

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  if (!lista) {
    console.error('Div #lista-carrinho não encontrada!');
    return;
  }

  lista.innerHTML = '';
  let totalGeral = 0;

  const cabecalho = document.createElement('pre');
  cabecalho.textContent = `ITEM  CÓDIGO  DESCRIÇÃO               QTD  V.UNIT(R$)  V.TOTAL(R$)`;
  cabecalho.style.fontFamily = 'monospace';
  cabecalho.style.marginBottom = '10px';
  lista.appendChild(cabecalho);

  carrinho.forEach((item, index) => {
    const totalItem = item.preco_unitario_venda * item.quantidade;
    totalGeral += totalItem;

    const linha = document.createElement('pre');
    linha.style.fontFamily = 'monospace';
    linha.style.marginBottom = '4px';
    linha.textContent = `${String(index + 1).padEnd(5)} ${String(item.codigo_barras).padEnd(8)} ${item.nome.padEnd(22)} ${String(item.quantidade).padStart(3)}  ${item.preco_unitario_venda.toFixed(2).padStart(10)}  ${totalItem.toFixed(2).padStart(11)}`;
    lista.appendChild(linha);
  });

  const separador = document.createElement('div');
  separador.textContent = '----------------------------------------------';
  separador.style.fontFamily = 'monospace';
  separador.style.margin = '10px 0';
  lista.appendChild(separador);

  const total = document.createElement('div');
  total.style.fontWeight = 'bold';
  total.style.fontFamily = 'monospace';
  total.textContent = `TOTAL: R$ ${totalGeral.toFixed(2)}`;
  lista.appendChild(total);

  console.log('Carrinho atualizado:', carrinho);
}

// Leitor de código de barras via input visível
const leitor = document.getElementById("leitor-codigo");

if (leitor) {
  leitor.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const codigo = leitor.value.trim();
      leitor.value = "";

      console.log('Código lido:', codigo);

      const produto = produtosDisponiveis.find(p => String(p.codigo_barras) === codigo);
      if (produto) {
        console.log('Produto encontrado por código de barras:', produto);
        adicionarAoCarrinhoPorId(produto.id, 1);
      } else {
        alert("Produto não encontrado para o código: " + codigo);
        console.warn('Código não encontrado:', codigo);
      }
    }
  });

  // Foco automático no leitor após clique
  document.addEventListener("click", () => leitor.focus());
} else {
  console.error('Input #leitor-codigo não encontrado!');
}