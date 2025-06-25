let carrinho = [];
let produtosDisponiveis = [];
let pagina = 0;
const porPagina = 12;

fetch('/api/produtos')
  .then(response => response.json())
  .then(produtos => {
    produtosDisponiveis = produtos;
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
        const preco = parseFloat(produto.preco) || 0;
        const div = document.createElement('div');
        div.className = 'produto-item';
        div.innerHTML = `
          <h3>${produto.nome}</h3>
          <p>R$ ${preco.toFixed(2)}</p>
          <p>Disponível: ${produto.quantidade}</p>
          <label>Quantidade:</label>
          <input type="number" min="1" value="1" id="quantidade-${produto.id}" class="quantidade">
          <button class="btn-adicionar" data-id="${produto.id}">Adicionar</button>
        `;
        container.appendChild(div);
      });
    }

    renderizarProdutos(pagina);
    pagina++;

    container.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-adicionar')) {
        const id = parseInt(e.target.dataset.id);
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

function adicionarAoCarrinhoPorId(id) {
  const input = document.getElementById(`quantidade-${id}`);
  const quantidadeSelecionada = parseInt(input.value) || 1;
  const produto = produtosDisponiveis.find(p => p.id === id);
  if (!produto) return;

  // Mesmo nome pode aparecer mais de uma vez (como notas fiscais)
  carrinho.push({
    ...produto,
    quantidade: quantidadeSelecionada
  });

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  lista.innerHTML = '';

  let totalGeral = 0;

  carrinho.forEach((item, index) => {
    const totalItem = item.preco * item.quantidade;
    totalGeral += totalItem;

    const linha = document.createElement('div');
    linha.style.marginBottom = '6px';
    linha.textContent = `${index + 1}. ${item.quantidade}x ${item.nome} — ${item.descricao || 'Sem descrição'} — R$ ${totalItem.toFixed(2)}`;
    lista.appendChild(linha);
  });

  const total = document.createElement('div');
  total.style.marginTop = '15px';
  total.style.fontWeight = 'bold';
  total.textContent = `TOTAL: R$ ${totalGeral.toFixed(2)}`;
  lista.appendChild(total);
}