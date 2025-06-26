let carrinho = [];
let produtosDisponiveis = [];
let pagina = 0;
const porPagina = 12;

// Carrega produtos do backend
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

    // Clique no botão "Adicionar"
    container.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('btn-adicionar')) {
        const id = parseInt(e.target.dataset.id);
        adicionarAoCarrinhoPorId(id, null); // null para pegar do input
      }
    });

    // Scroll infinito para carregar mais produtos
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

// Adiciona produto ao carrinho
function adicionarAoCarrinhoPorId(id, quantidade = null) {
  console.log('adicionarAoCarrinhoPorId chamada - ID:', id);
  const produto = produtosDisponiveis.find(p => p.id === id);
  if (!produto) {
    console.warn('Produto não encontrado:', id);
    return;
  }

  // Só pega do input se quantidade for null (caso do botão)
  if (quantidade === null) {
    const input = document.getElementById(`quantidade-${id}`);
    if (input && !isNaN(parseInt(input.value))) {
      quantidade = parseInt(input.value);
    } else {
      quantidade = 1;
    }
  }

  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    existente.quantidade += quantidade;
    console.log(`Quantidade atualizada: ${existente.nome} = ${existente.quantidade}`);
  } else {
    carrinho.push({ 
      ...produto, 
      quantidade, 
      preco_unitario_venda: parseFloat(produto.preco_unitario_venda) || 0 
    });
    console.log(`Produto adicionado: ${produto.nome} x${quantidade}`);
  }

  atualizarCarrinho();
}

// Atualiza visualmente o carrinho
function atualizarCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  if (!lista) {
    console.error('Div #lista-carrinho não encontrada!');
    return;
  }

  lista.innerHTML = '';
  let totalGeral = 0;

  // Cabeçalho alinhado estilo nota fiscal
  const cabecalho = document.createElement('pre');
  cabecalho.textContent = `ITEM CÓDIGO      DESCRIÇÃO                QTD  V.UNIT(R$)  V.TOTAL(R$)`;
  cabecalho.style.fontFamily = 'monospace';
  cabecalho.style.marginBottom = '10px';
  lista.appendChild(cabecalho);
  
  carrinho.forEach((item, index) => {
    const totalItem = item.preco_unitario_venda * item.quantidade;
    totalGeral += totalItem;

    // Cria um container para a linha e o botão remover
    const linhaContainer = document.createElement('div');
    linhaContainer.style.display = 'flex';
    linhaContainer.style.alignItems = 'center';
    linhaContainer.style.marginBottom = '6px'; // espaçamento entre linhas
    linhaContainer.style.padding = '0';

    const linha = document.createElement('pre');
    linha.style.fontFamily = 'monospace';
    linha.style.margin = 0;
    linha.style.padding = 0;
    linha.style.lineHeight = 0;
    linha.textContent =
      `${String(index + 1).padEnd(4)}${String(item.codigo_barras).padEnd(11)}${item.nome.padEnd(22)}${String(item.quantidade).padStart(5)}${item.preco_unitario_venda.toFixed(2).padStart(13)}${(totalItem).toFixed(2).padStart(14)}`;

    // Botão remover
    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'Remover';
    btnRemover.style.marginLeft = '8px';
    btnRemover.style.fontSize = '11px';
    btnRemover.style.height = '16px';
    btnRemover.style.padding = '0 4px';
    btnRemover.onclick = function() { removerItem(index); };

    linhaContainer.appendChild(linha);
    linhaContainer.appendChild(btnRemover);
    lista.appendChild(linhaContainer);
  });

  const separador = document.createElement('div');
  separador.textContent = '---------------------------------------------------------------';
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

// Função para remover item específico do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Leitor de código de barras via input visível
const leitor = document.getElementById("leitor-codigo");
const btnLeitorEnter = document.getElementById("btn-leitor-enter");

if (leitor) {
  let tempoUltimaTecla = 0;
  let bufferCodigo = "";

  leitor.addEventListener("keydown", function (e) {
    const agora = Date.now();

    // Se o tempo entre teclas for muito curto, provavelmente é um leitor de código de barras
    if (agora - tempoUltimaTecla < 30) {
      bufferCodigo += e.key;
    } else {
      bufferCodigo = e.key;
    }
    tempoUltimaTecla = agora;

    // Se buffer ficou grande rapidamente, considera bipado e adiciona automaticamente
    if (bufferCodigo.length >= 8 && (agora - tempoUltimaTecla < 30)) {
      setTimeout(() => {
        adicionarProdutoPorLeitor();
        bufferCodigo = "";
      }, 10);
    }
    // Se pressionou Enter, só adiciona se foi digitado manualmente (buffer pequeno)
    if (e.key === "Enter") {
      if (bufferCodigo.length < 8) { // ajuste conforme o tamanho dos seus códigos
        adicionarProdutoPorLeitor();
      }
      bufferCodigo = "";
      e.preventDefault();
    }
  });

  if (btnLeitorEnter) {
    btnLeitorEnter.addEventListener("click", function () {
      adicionarProdutoPorLeitor();
    });
  }

  document.addEventListener("click", (e) => {
    const popup = document.getElementById('popup-pagamento');
    if (popup && popup.style.display === 'block') {
      // Não foca no leitor se o popup está aberto
      return;
    }
    if (leitor) leitor.focus();
  });
} else {
  console.error('Input #leitor-codigo não encontrado!');
}

function adicionarProdutoPorLeitor() {
  const codigo = leitor.value.trim();
  leitor.value = "";

  if (!codigo) return;

  console.log('Código lido:', codigo);

  const produto = produtosDisponiveis.find(p => String(p.codigo_barras) === codigo);
  if (produto) {
    adicionarAoCarrinhoPorId(produto.id, 1);
  } else {
    alert("Produto não encontrado para o código: " + codigo);
    console.warn('Código não encontrado:', codigo);
  }
}

// Funções extras para os botões do carrinho (opcional)
function cancelarVenda() {
  if (confirm("Deseja cancelar a venda?")) {
    carrinho = [];
    atualizarCarrinho();
  }
}

function abrirPopupPagamento() {
  document.getElementById('popup-pagamento').style.display = 'block';
}

function verificarForma() {
  const forma = document.getElementById('formaPagamento').value;
  document.getElementById('dinheiro-section').style.display = forma === 'dinheiro' ? 'block' : 'none';
}

function calcularTroco() {
  const total = carrinho.reduce((acc, item) => acc + item.preco_unitario_venda * item.quantidade, 0);
  const recebido = parseFloat(document.getElementById('valorRecebido').value) || 0;
  const troco = recebido - total;
  document.getElementById('troco').textContent = troco >= 0 ? troco.toFixed(2) : '0.00';
}

function finalizarVenda() {
  alert('Venda finalizada! (implemente o backend para processar)');
  carrinho = [];
  atualizarCarrinho();
  document.getElementById('popup-pagamento').style.display = 'none';
}