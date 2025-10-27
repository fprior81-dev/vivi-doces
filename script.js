document.addEventListener('DOMContentLoaded', function () {
  // ====== MODAL / PRODUTOS / CARRINHO ======
  const modal = document.getElementById('modalProduto');
  const modalImg = document.getElementById('modalImg');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalDescricao = document.getElementById('modalDescricao');
  const modalPreco = document.getElementById('modalPreco');
  const fechar = document.querySelector('.modal .fechar');
  const btnAddCarrinho = document.getElementById('addCarrinho');
  const setaEsq = document.querySelector('.modal .set-left');
  const setaDir = document.querySelector('.modal .set-right');

  // Scroll suave (desktop e mobile menu)
  document.querySelectorAll('.menu-header a, #menu-mobile a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      // Fecha menu mobile se estiver aberto
      if (menuMobile) menuMobile.style.display = 'none';
    });
  });

  const produtos = Array.from(document.querySelectorAll('.miniatura'));
  let indexAtual = 0;
  let carrinho = [];

  function abrirModal(i) {
    const produto = produtos[i];
    if (!produto) return;
    modal.style.display = 'block';
    modalImg.src = produto.dataset.img;
    modalTitulo.textContent = produto.dataset.titulo;
    modalDescricao.textContent = produto.dataset.descricao;
    modalPreco.textContent = "R$ " + parseFloat(produto.dataset.preco).toFixed(2);
    indexAtual = i;
  }

  produtos.forEach((produto, i) => produto.addEventListener('click', () => abrirModal(i)));

  if (fechar) fechar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });

  // Navegação entre produtos
  if (setaEsq) setaEsq.addEventListener('click', () => {
    indexAtual = (indexAtual - 1 + produtos.length) % produtos.length;
    abrirModal(indexAtual);
  });
  if (setaDir) setaDir.addEventListener('click', () => {
    indexAtual = (indexAtual + 1) % produtos.length;
    abrirModal(indexAtual);
  });

  // Adicionar ao carrinho
  if (btnAddCarrinho) btnAddCarrinho.addEventListener('click', () => {
    const produto = produtos[indexAtual];
    if (!produto) return;
    const itemExistente = carrinho.find(i => i.titulo === produto.dataset.titulo);
    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({
        titulo: produto.dataset.titulo,
        preco: parseFloat(produto.dataset.preco) || 0,
        img: produto.dataset.img,
        quantidade: 1
      });
    }
    atualizarCarrinho();
    modal.style.display = 'none';
  });

  function atualizarCarrinho() {
    const container = document.getElementById('itensCarrinho');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, i) => {
      const div = document.createElement('div');
      div.classList.add('item-carrinho');
      div.innerHTML = `
        <img src="${item.img}" alt="${item.titulo}">
        <div>
          ${item.titulo} <br> R$ ${item.preco.toFixed(2)}
          <input type="number" min="1" value="${item.quantidade}" data-i="${i}" class="qtd" aria-label="Quantidade de ${item.titulo}">
        </div>
        <span class="remover" data-i="${i}" aria-label="Remover ${item.titulo}" role="button" tabindex="0">&times;</span>
      `;
      container.appendChild(div);
      total += item.preco * item.quantidade;
    });

    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = "Total: R$ " + total.toFixed(2);

    container.querySelectorAll('.remover').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.i;
        carrinho.splice(idx, 1);
        atualizarCarrinho();
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = e.target.dataset.i;
          carrinho.splice(idx, 1);
          atualizarCarrinho();
        }
      });
    });

    container.querySelectorAll('.qtd').forEach(input => {
      input.addEventListener('change', e => {
        const idx = e.target.dataset.i;
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        carrinho[idx].quantidade = val;
        atualizarCarrinho();
      });
    });
  }

  // ====== FORM / LGPD / WHATSAPP ======
  const form = document.getElementById('formPedido');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Verifica consentimento (ID deve existir e estar marcado)
      const consentimento = document.getElementById('consentimento');
      if (!consentimento) {
        console.error('Elemento #consentimento não encontrado. Verifique o HTML.');
        alert('Houve um erro ao validar o consentimento. Atualize a página e tente novamente.');
        return;
      }
      if (!consentimento.checked) {
        alert('Por favor, marque o campo de consentimento (LGPD) para prosseguir.');
        return;
      }

      // Coleta de dados
      const nome = (document.getElementById('nome')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const telefone = (document.getElementById('telefone')?.value || '').trim();
      const endereco = (document.getElementById('endereco')?.value || '').trim();
      const referencia = (document.getElementById('referencia')?.value || '').trim();
      const mensagem = (document.getElementById('mensagem')?.value || '').trim();

      // Itens do carrinho
      const listaProdutos = carrinho.length
        ? carrinho.map(i => `${i.quantidade}x ${i.titulo} (R$ ${i.preco.toFixed(2)})`).join('\n')
        : 'Sem itens no carrinho';

      const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0).toFixed(2);

      // Monta texto e codifica para URL
      const textoBruto =
        `Olá! Meu nome é ${nome}.
E-mail: ${email}
Telefone: ${telefone}
Endereço: ${endereco}
Referência: ${referencia}
Produtos:
${listaProdutos}
Total: R$ ${total}
Observações: ${mensagem}`;

      const textoCodificado = encodeURIComponent(textoBruto);
      const url = `https://wa.me/5521988364626?text=${textoCodificado}`;

      // Abre WhatsApp (user gesture: dentro do handler do submit)
      const win = window.open(url, '_blank');

      // Feedback visual
      const msgSucesso = document.getElementById('mensagemSucesso');
      if (msgSucesso) {
        msgSucesso.setAttribute('role', 'status');
        msgSucesso.setAttribute('aria-live', 'polite');
        msgSucesso.style.display = 'block';
        setTimeout(() => { msgSucesso.style.display = 'none'; }, 4000);
      }

      // Limpa formulário (mantém carrinho)
      form.reset();

      // Mantém o checkbox LGPD marcado? Se quiser manter, comente a linha acima e descomente abaixo:
      // document.getElementById('consentimento').checked = true;

      // Se o navegador bloquear pop-up:
      if (!win) {
        alert('Não foi possível abrir o WhatsApp (pop-up bloqueado). Permita pop-ups para este site e tente novamente.');
      }
    });
  }

  // ====== MENU MOBILE ======
  const hamburger = document.getElementById('hamburger');
  const menuMobile = document.getElementById('menu-mobile');
  const fecharMenu = document.getElementById('fecharMenu');

  if (hamburger && menuMobile) {
    hamburger.addEventListener('click', () => {
      menuMobile.style.display = 'flex';
    });
  }
  if (fecharMenu && menuMobile) {
    fecharMenu.addEventListener('click', () => {
      menuMobile.style.display = 'none';
    });
  }
});
