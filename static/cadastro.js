// Manipulação de cálculo do formulário principal
document.addEventListener("DOMContentLoaded", function () {
  const barcodeInput = document.getElementById("barcode");
  const packagePriceInput = document.getElementById("packagePrice");
  const unitsPerPackageInput = document.getElementById("unitsPerPackage");
  const packageQtyInput = document.getElementById("packageQty");
  const unitCostInput = document.getElementById("unitCost");
  const marginInput = document.getElementById("margin");
  const marginValueSpan = document.getElementById("marginValue");
  const finalPackagePriceInput = document.getElementById("finalPackagePrice");
  const finalUnitPriceInput = document.getElementById("finalUnitPrice");
  const totalCostInput = document.getElementById("totalCost");
  const totalUnitsInput = document.getElementById("totalUnits");
  const tabela = document.getElementById("productTableBody");

  function calcular() {
    const precoFardo = parseFloat(packagePriceInput.value) || 0;
    const unidadesPorFardo = parseInt(unitsPerPackageInput.value) || 0;
    const quantidadeFardos = parseInt(packageQtyInput.value) || 0;
    const margem = parseFloat(marginInput.value) || 0;

    const totalUnidades = unidadesPorFardo * quantidadeFardos;
    const custoTotal = precoFardo * quantidadeFardos;
    const custoUnitario = totalUnidades > 0 ? custoTotal / totalUnidades : 0;
    const precoFinalFardo = custoTotal * (1 + margem / 100);
    const precoFinalUnidade = totalUnidades > 0 ? precoFinalFardo / totalUnidades : 0;

    totalUnitsInput.value = totalUnidades;
    unitCostInput.value = custoUnitario.toFixed(2);
    totalCostInput.value = custoTotal.toFixed(2);
    finalPackagePriceInput.value = precoFinalFardo.toFixed(2);
    finalUnitPriceInput.value = precoFinalUnidade.toFixed(2);
    marginValueSpan.textContent = `${margem}%`;
  }

  packagePriceInput.addEventListener("input", calcular);
  packageQtyInput.addEventListener("input", calcular);
  unitsPerPackageInput.addEventListener("input", calcular);
  marginInput.addEventListener("input", calcular);

  barcodeInput.addEventListener("change", async function () {
    const codigo = barcodeInput.value;
    try {
      const response = await fetch(`/api/produtos/${codigo}`);
      if (response.ok) {
        const produto = await response.json();
        document.getElementById("name").value = produto.nome;
        packagePriceInput.value = produto.preco_final_fardo;
        unitsPerPackageInput.value = produto.total_unidades / produto.quantidade_fardos;
        packageQtyInput.value = produto.quantidade_fardos;
        calcular();
      } else {
        console.log("Produto não encontrado");
      }
    } catch (erro) {
      console.error("Erro ao buscar produto:", erro);
    }
  });
});

// Funções globais acessíveis via HTML onclick
window.carregarRelatorio = function () {
  fetch('/api/relatorio')
    .then(res => res.json())
    .then(produtos => {
      const tabela = document.getElementById("productTableBody");
      tabela.innerHTML = "";
      produtos.forEach(p => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${p.id}</td>
          <td>${p.codigo_barras}</td>
          <td>${p.nome}</td>
          <td>${p.quantidade_fardos}</td>
          <td>R$ ${parseFloat(p.preco_final_fardo).toFixed(2)}</td>
          <td>${p.total_unidades}</td>
          <td>R$ ${parseFloat(p.preco_unitario_venda).toFixed(2)}</td>
        `;
        tabela.appendChild(linha);
      });
    })
    .catch(err => console.error("Erro ao carregar relatório:", err));
};

window.registerProduct = function () {
  const nome = document.getElementById("name").value;
  const codigo = document.getElementById("barcode").value;
  const precoFardo = parseFloat(document.getElementById("finalPackagePrice").value) || 0;
  const precoUnit = parseFloat(document.getElementById("finalUnitPrice").value) || 0;
  const qtdFardos = parseInt(document.getElementById("packageQty").value) || 0;
  const qtdTotalUnidades = parseInt(document.getElementById("totalUnits").value) || 0;

  if (!nome || !codigo || precoFardo <= 0 || precoUnit <= 0 || qtdFardos <= 0 || qtdTotalUnidades <= 0) {
    alert("Preencha todos os campos corretamente antes de cadastrar.");
    return;
  }

  fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codigo_barras: codigo,
      nome: nome,
      quantidade_fardos: qtdFardos,
      preco_final_fardo: precoFardo,
      total_unidades: qtdTotalUnidades,
      preco_unitario_venda: precoUnit
    })
  })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao salvar produto no banco de dados.");
      return response.json();
    })
    .then(() => {
      alert("Produto cadastrado com sucesso!");
      carregarRelatorio();
    })
    .catch(error => {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar produto. Verifique o console.");
    });
};

window.excluircadastro = function () {
  document.getElementById("deleteId").value = "";
  document.getElementById("deleteBarcode").value = "";
  document.getElementById("deletePopup").style.display = "flex";
};

window.fecharPopup = function () {
  document.getElementById("deletePopup").style.display = "none";
};

window.confirmarExclusao = function () {
  const id = document.getElementById("deleteId").value;
  const barcode = document.getElementById("deleteBarcode").value;

  if (!id && !barcode) {
    alert("Informe pelo menos o ID ou o Código de Barras.");
    return;
  }

  const url = id && barcode
    ? `/api/produtos/verificar/${id}/${barcode}`
    : id
      ? `/api/produtos/${id}`
      : `/api/produtos/codigo/${barcode}`;

  fetch(url, { method: 'DELETE' })
    .then(res => {
      if (res.ok) {
        alert("Produto excluído com sucesso!");
        fecharPopup();
        carregarRelatorio();
      } else {
        alert("Erro ao excluir produto.");
      }
    })
    .catch(err => {
      console.error("Erro:", err);
      alert("Erro ao excluir produto.");
    });
};

window.abrirEdicaoPopup = function () {
  document.getElementById("editId").value = "";
  document.getElementById("editBarcode").value = "";
  document.getElementById("editForm").style.display = "none";
  document.getElementById("editPopup").style.display = "flex";
};

window.fecharEdicaoPopup = function () {
  document.getElementById("editPopup").style.display = "none";
};

window.buscarProdutoParaEdicao = function () {
  const id = document.getElementById("editId").value;
  const barcode = document.getElementById("editBarcode").value;

  if (!id && !barcode) {
    alert("Informe o ID ou o Código de Barras.");
    return;
  }

  const url = id ? `/api/produtos/id/${id}` : `/api/produtos/${barcode}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Produto não encontrado.");
      return res.json();
    })
    .then(produto => {
      document.getElementById("editForm").style.display = "block";
      document.getElementById("editNome").value = produto.nome;
      document.getElementById("editQtdFardos").value = produto.quantidade_fardos;
      document.getElementById("editPrecoFardo").value = produto.preco_final_fardo;
      document.getElementById("editUnitsPerPackage").value = produto.total_unidades / produto.quantidade_fardos;
      document.getElementById("editMargin").value = 30;
      calcularEdicao();
    })
    .catch(err => {
      console.error("Erro ao buscar produto:", err);
      alert("Produto não encontrado.");
    });
};

window.salvarAlteracoesPopup = function () {
  const barcode = document.getElementById("editBarcode").value;
  const nome = document.getElementById("editNome").value;
  const quantidade_fardos = parseInt(document.getElementById("editQtdFardos").value) || 0;
  const preco_final_fardo = parseFloat(document.getElementById("editPrecoFardo").value) || 0;
  const total_unidades = parseInt(document.getElementById("editTotalUnidades").value) || 0;  
  const preco_unitario_venda = parseFloat(document.getElementById("editPrecoUnit").value) || 0;

  if (!barcode) {
    alert("Preencha o campo Código de Barras.");
    return;
  }

  fetch(`/api/produtos/codigo/${barcode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      quantidade_fardos,
      preco_final_fardo,
      total_unidades,
      preco_unitario_venda
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao salvar alterações.");
      return res.json();
    })
    .then(() => {
      alert("Produto alterado com sucesso!");
      fecharEdicaoPopup();
      carregarRelatorio();
    })
    .catch(err => {
      console.error("Erro ao salvar alterações:", err);
      alert("Não foi possível salvar as alterações.");
    });
};

// Cálculo automático para o formulário de edição
function calcularEdicao() {
  const precoFardo = parseFloat(document.getElementById("editPrecoFardo").value) || 0;
  const unidadesPorFardo = parseInt(document.getElementById("editUnitsPerPackage").value) || 0;
  const qtdFardos = parseInt(document.getElementById("editQtdFardos").value) || 0;
  const margem = parseFloat(document.getElementById("editMargin").value) || 0;

  const totalUnidades = unidadesPorFardo * qtdFardos;
  const custoTotal = precoFardo * qtdFardos;
  const custoUnitario = totalUnidades > 0 ? custoTotal / totalUnidades : 0;
  const precoFinalFardo = custoTotal * (1 + margem / 100);
  const precoUnitario = totalUnidades > 0 ? precoFinalFardo / totalUnidades : 0;

  document.getElementById("editTotalUnidades").value = totalUnidades;
  document.getElementById("editTotalCost").value = custoTotal.toFixed(2);
  document.getElementById("editUnitCost").value = custoUnitario.toFixed(2);
  document.getElementById("editFinalPackagePrice").value = precoFinalFardo.toFixed(2);
  document.getElementById("editPrecoUnit").value = precoUnitario.toFixed(2);
  document.getElementById("editMarginValue").textContent = `${margem}%`;
}

// Eventos de recalcular ao editar
document.getElementById("editPrecoFardo").addEventListener("input", calcularEdicao);
document.getElementById("editUnitsPerPackage").addEventListener("input", calcularEdicao);
document.getElementById("editQtdFardos").addEventListener("input", calcularEdicao);
document.getElementById("editMargin").addEventListener("input", calcularEdicao);
