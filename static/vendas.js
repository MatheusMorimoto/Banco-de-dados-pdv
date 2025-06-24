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
          <label>Quantidade:</label>
          <input type="number" min="1" value="1" id="quantidade-${produto.id}">
          <button class="btn-adicionar" data-id="${produto.id}">Adicionar</button>
        `;
        container.appendChild(div);
      });
    }

    renderizarProdutos(pagina); // Carrega a 1ª página
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
