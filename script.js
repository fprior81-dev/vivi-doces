document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modalProduto');
  const modalImg = document.getElementById('modalImg');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalDescricao = document.getElementById('modalDescricao');
  const modalPreco = document.getElementById('modalPreco');
  const fechar = document.querySelector('.modal .fechar');
  const btnAddCarrinho = document.getElementById('addCarrinho');
  const setaEsq = document.querySelector('.modal .set-left');
  const setaDir = document.querySelector('.modal .set-right');
  
  // Scroll suave para links do menu
document.querySelectorAll('.menu-header a').forEach(link => {
  link.addEventListener('click', function(e){
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


  const produtos = Array.from(document.querySelectorAll('.miniatura'));
  let indexAtual = 0;
  let carrinho = [];

  function abrirModal(i) {
    const produto = produtos[i];
    modal.style.display = 'block';
    modalImg.src = produto.dataset.img;
    modalTitulo.textContent = produto.dataset.titulo;
    modalDescricao.textContent = produto.dataset.descricao;
    modalPreco.textContent = "R$ " + parseFloat(produto.dataset.preco).toFixed(2);
    indexAtual = i;
  }

  produtos.forEach((produto, i) => produto.addEventListener('click', () => abrirModal(i)));
  fechar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

  // Navegação entre produtos
  setaEsq.addEventListener('click', () => {
    indexAtual = (indexAtual - 1 + produtos.length) % produtos.length;
    abrirModal(indexAtual);
  });

  setaDir.addEventListener('click', () => {
    indexAtual = (indexAtual + 1) % produtos.length;
    abrirModal(indexAtual);
  });

  // Adicionar ao carrinho
  btnAddCarrinho.addEventListener('click', () => {
    const produto = produtos[indexAtual];
    const item = { titulo: produto.dataset.titulo, preco: parseFloat(produto.dataset.preco), img: produto.dataset.img, quantidade: 1 };
    carrinho.push(item);
    atualizarCarrinho();
    modal.style.display = 'none';
  });

  function atualizarCarrinho() {
    const container = document.getElementById('itensCarrinho');
    container.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, i) => {
      const div = document.createElement('div');
      div.classList.add('item-carrinho');
      div.innerHTML = `
        <img src="${item.img}" alt="${item.titulo}">
        <div>${item.titulo} <br> R$ ${item.preco.toFixed(2)}
        <input type="number" min="1" value="${item.quantidade}" data-i="${i}" class="qtd"></div>
        <span class="remover" data-i="${i}">&times;</span>
      `;
      container.appendChild(div);
      total += item.preco * item.quantidade;
    });
    document.getElementById('total').textContent = "Total: R$ " + total.toFixed(2);

    document.querySelectorAll('.remover').forEach(btn => btn.addEventListener('click', e => {
      carrinho.splice(e.target.dataset.i,1); atualizarCarrinho();
    }));

    document.querySelectorAll('.qtd').forEach(input => {
      input.addEventListener('change', e => {
        const idx = e.target.dataset.i;
        let val = parseInt(e.target.value); if(val < 1) val = 1;
        carrinho[idx].quantidade = val; atualizarCarrinho();
      });
    });
  }

  // Formulário de pedidos
  const form = document.getElementById('formPedido');
  form.addEventListener('submit', e => {
    e.preventDefault();

    let nome = document.getElementById('nome').value;
    let email = document.getElementById('email').value;
    let telefone = document.getElementById('telefone').value;
    let endereco = document.getElementById('endereco').value;
    let referencia = document.getElementById('referencia').value;
    let mensagem = document.getElementById('mensagem').value;

    let listaProdutos = carrinho.map(i => `${i.quantidade}x ${i.titulo} (R$ ${i.preco.toFixed(2)})`).join('%0A');
    let total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0).toFixed(2);

    let texto = `Olá! Meu nome é ${nome}.%0AMeu e-mail: ${email}%0ATelefone: ${telefone}%0AEndereço: ${endereco}%0APonto de referência: ${referencia}%0AProdutos:%0A${listaProdutos}%0ATotal: R$ ${total}%0AObservações: ${mensagem}`;

    
    window.open(`https://wa.me/5521988364626?text=${texto}`, '_blank');
    
    const msgSucesso = document.getElementById('mensagemSucesso');
    msgSucesso.style.display = 'block';
    setTimeout(() => { msgSucesso.style.display = 'none'; }, 4000);

    form.reset();
  });
});


const hamburger = document.getElementById("hamburger");
const menuMobile = document.getElementById("menu-mobile");
const fecharMenu = document.getElementById("fecharMenu");

hamburger.addEventListener("click", () => {
  menuMobile.style.display = "flex";
});

fecharMenu.addEventListener("click", () => {
  menuMobile.style.display = "none";
});

