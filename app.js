'use strict';
const items = [
  {id:1,name:'Горнятка «Ранок»',category:'kitchen',subtitle:'Набір із 2 · кераміка',price:540,pos:'0% 0%',description:'Два сині горнятка для повільних ранків і розмов на кухні. Зручна ручка та гладка глазур.',material:'Кераміка',size:'300 мл · 2 шт.',care:'Ручне миття'},
  {id:2,name:'Дозатори «Чисто»',category:'cleaning',subtitle:'Набір із 2 · бурштинове скло',price:420,pos:'50% 0%',description:'Дозатори для рідкого мила або засобу для миття посуду. Зібрати все біля раковини в одному стилі — легко.',material:'Скло, пластик',size:'500 мл · 2 шт.',care:'Промивати теплою водою'},
  {id:3,name:'Банки «Порядок»',category:'storage',subtitle:'Набір із 3 · бамбукові кришки',price:690,pos:'100% 0%',description:'Прозорі банки для круп, пасти та маленьких кухонних запасів. Усе видно, усе під рукою.',material:'Скло, бамбук',size:'500 / 750 / 1000 мл',care:'Кришки мити вручну'},
  {id:4,name:'Рушники «Смуга»',category:'kitchen',subtitle:'Набір із 3 · бавовна',price:360,pos:'0% 100%',description:'М’які кухонні рушники в синю смужку. Для посуду, рук і щоденних дрібниць.',material:'100% бавовна',size:'40 × 60 см · 3 шт.',care:'Прання при 40 °C'},
  {id:5,name:'Кошик «Місце»',category:'storage',subtitle:'Плетений · натуральний колір',price:580,pos:'50% 100%',description:'Для рушників, побутових дрібниць або речей, які завжди шукають своє місце. Природна фактура для будь-якої кімнати.',material:'Плетене волокно',size:'30 × 20 × 15 см',care:'Протирати сухою тканиною'},
  {id:6,name:'Набір «Легко»',category:'cleaning',subtitle:'Щітка та губка · 2 предмети',price:240,pos:'100% 100%',description:'Дерев’яна щітка та губка для невеликих щоденних прибирань. Простий набір, який приємно тримати біля раковини.',material:'Дерево, щетина, целюлоза',size:'Щітка + губка',care:'Просушувати після використання'}
];
const cart = new Map();
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('uk-UA').format(value)+' ₴';
const safe = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const photo = (item,extra='') => `<div class="product-photo ${extra}" style="--pos:${item.pos}" role="img" aria-label="${item.name}"></div>`;
const count = () => [...cart.values()].reduce((a,b)=>a+b,0);
const subtotal = () => items.reduce((sum,item)=>sum+item.price*(cart.get(item.id)||0),0);
let toastTimer, selectedProduct=1, productQuantity=1;
function notify(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function renderProducts(category='all'){
  const visible=items.filter(item=>category==='all'||item.category===category);
  $('#result-count').textContent=category==='all'?'6 речей для вашого дому':'2 речі для вашого дому';
  $('#products').innerHTML=visible.map((item,index)=>`<article class="product-card" style="--i:${index}"><button class="photo-button" data-product="${item.id}" aria-label="Переглянути ${item.name}">${photo(item)}<span class="view-pill">Роздивитися ближче</span></button><div class="product-info"><div><h2><button class="title-button" data-product="${item.id}">${item.name}</button></h2><p>${item.subtitle}</p></div><span class="price">${money(item.price)}</span></div><button class="add-button" data-add="${item.id}" aria-label="Додати ${item.name} до кошика"><span>У кошик</span><span aria-hidden="true">+</span></button></article>`).join('');
}
function quantityControl(id,qty,mode='cart'){
  return `<div class="quantity"><button type="button" data-qty="${id}" data-delta="-1" data-mode="${mode}" aria-label="Зменшити кількість ${items.find(i=>i.id===id).name}" ${qty<=1?'disabled':''}>−</button><output aria-label="Кількість">${qty}</output><button type="button" data-qty="${id}" data-delta="1" data-mode="${mode}" aria-label="Збільшити кількість ${items.find(i=>i.id===id).name}" ${qty>=10?'disabled':''}>+</button></div>`;
}
function renderCart(){
  $('#cart-count').textContent=count();$('#drawer-count').textContent=count()?'('+count()+')':'';
  $('#open-cart').setAttribute('aria-label',`Відкрити кошик, ${count()} товарів`);
  if(!cart.size){$('#cart-content').innerHTML='<div class="cart-empty"><span class="empty-symbol" aria-hidden="true">✳</span><h3>Тут поки порожньо</h3><p>Знайдіть свою маленьку радість у каталозі.</p><button class="primary" data-close>До товарів</button></div>';return}
  $('#cart-content').innerHTML=items.filter(item=>cart.has(item.id)).map(item=>`<article class="cart-row">${photo(item)}<div><h3>${item.name}</h3><p>${item.subtitle}</p><div class="row-bottom">${quantityControl(item.id,cart.get(item.id))}<strong>${money(item.price*cart.get(item.id))}</strong></div><button class="remove" data-remove="${item.id}" aria-label="Видалити ${item.name}">Видалити</button></div></article>`).join('')+`<div class="total-row grand"><span>Товари</span><span>${money(subtotal())}</span></div><p class="cart-caption">Доставка розраховується під час оформлення.<br>До 10 одиниць кожного товару в демо.</p><button class="primary" id="go-checkout">Оформити замовлення</button><p class="demo-note" style="margin-top:15px">Це демо-магазин. Оплата й доставка не здійснюються.</p>`;
}
function addItem(id,qty=1){
  const current=cart.get(id)||0;if(current>=10){notify('У демо можна додати до 10 одиниць товару');return}
  cart.set(id,Math.min(10,current+qty));renderCart();
  const button=$('#open-cart');button.classList.remove('bump');requestAnimationFrame(()=>button.classList.add('bump'));
  notify('Додано до кошика · '+items.find(item=>item.id===id).name);
}
function openProduct(id){
  selectedProduct=id;productQuantity=1;const item=items.find(item=>item.id===id);
  $('#product-dialog').innerHTML=`<div class="dialog-head"><h2 id="product-title">${item.name}</h2><button class="close" data-close aria-label="Закрити товар">×</button></div><div class="product-layout">${photo(item)}<div class="product-details"><p class="eyebrow">${({kitchen:'Кухня',cleaning:'Прибирання',storage:'Зберігання'})[item.category]}</p><p>${item.description}</p><dl><div><dt>Матеріал</dt><dd>${item.material}</dd></div><div><dt>Розмір / комплект</dt><dd>${item.size}</dd></div><div><dt>Догляд</dt><dd>${item.care}</dd></div></dl><p class="price">${money(item.price)}</p><div class="buy-row"><div id="product-quantity">${quantityControl(id,1,'product')}</div><button class="primary" id="product-add">Додати до кошика</button></div><p class="small">Ілюстративний товар. Характеристики й ціна демонстраційні.</p></div></div>`;
  $('#product-dialog').showModal();
}
function renderSummary(){
  const shipping=$('[name=delivery]').value==='pickup'?0:80;
  const card=$('[name=payment]:checked').value==='card';
  $('#order-summary').innerHTML=`<h3>Ваші речі · ${count()}</h3>`+items.filter(item=>cart.has(item.id)).map(item=>`<div class="summary-product">${photo(item)}<p>${item.name}<br><span>${cart.get(item.id)} × ${money(item.price)}</span></p><strong>${money(item.price*cart.get(item.id))}</strong></div>`).join('')+`<div class="total-row"><span>Товари</span><span>${money(subtotal())}</span></div><div class="total-row"><span>Доставка · демо</span><span>${shipping?money(shipping):'Безкоштовно'}</span></div><div class="total-row grand"><span>Разом</span><span>${money(subtotal()+shipping)}</span></div><p class="payment-label">${card?'Оплату буде змодельовано. Гроші не списуються.':'Оплата при отриманні — лише демонстрація.'}</p>`;
  $('#place-order').textContent=card?'Оплатити та замовити · демо':'Створити замовлення · демо';
}
function openCheckout(){if(!cart.size)return;$('#cart-dialog').close();renderSummary();$('#checkout-dialog').showModal()}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')){button.closest('dialog').close();return}
  if(button.dataset.category){document.querySelectorAll('[data-category]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});renderProducts(button.dataset.category);return}
  if(button.dataset.product){openProduct(Number(button.dataset.product));return}
  if(button.dataset.add){addItem(Number(button.dataset.add));return}
  if(button.dataset.qty){
    const id=Number(button.dataset.qty),delta=Number(button.dataset.delta);
    if(button.dataset.mode==='product'){productQuantity=Math.max(1,Math.min(10,productQuantity+delta));$('#product-quantity').innerHTML=quantityControl(id,productQuantity,'product');$('#product-quantity').querySelector(`[data-delta="${delta}"]`).focus()}
    else{cart.set(id,Math.max(1,Math.min(10,cart.get(id)+delta)));renderCart();$('#cart-content').querySelector(`[data-qty="${id}"][data-delta="${delta}"]`).focus()}
    return;
  }
  if(button.dataset.remove){const id=Number(button.dataset.remove);cart.delete(id);renderCart();notify('Товар видалено з кошика');const next=$('#cart-content button');if(next)next.focus();return}
  if(button.id==='product-add'){addItem(selectedProduct,productQuantity);$('#product-dialog').close();return}
  if(button.id==='open-cart'){$('#cart-dialog').showModal();return}
  if(button.id==='go-checkout'){openCheckout();return}
});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}}));
$('#checkout-form').addEventListener('change',()=>{
  const pickup=$('[name=delivery]').value==='pickup';$('#address-fields').hidden=pickup;$('#pickup-note').hidden=!pickup;
  $('[name=city]').required=!pickup;$('[name=branch]').required=!pickup;renderSummary();
});
$('#checkout-form').addEventListener('submit',event=>{
  event.preventDefault();if(!cart.size)return;
  const form=new FormData(event.target),pickup=form.get('delivery')==='pickup',card=form.get('payment')==='card';
  const phone=String(form.get('phone')).replace(/\D/g,'');
  const phoneInput=$('[name=phone]');phoneInput.setCustomValidity(phone.length>=10&&phone.length<=15?'':'Введіть від 10 до 15 цифр телефону.');if(!event.target.reportValidity())return;
  const total=subtotal()+(pickup?0:80),totalCount=count(),name=safe(form.get('customer'));
  const number='DEMO-'+String(Date.now()).slice(-6);
  $('#checkout-dialog').close();
  $('#success-dialog').innerHTML=`<div class="success-mark" aria-hidden="true">✓</div><p class="eyebrow">${number}</p><h2 id="success-title">${name}, демо-замовлення готове!</h2><p>Ви пройшли весь шлях покупки.</p><div class="receipt"><p><span>Кількість товарів</span><strong>${totalCount}</strong></p><p><span>Доставка</span><strong>${pickup?'Самовивіз':'До відділення'}</strong></p><p><span>Спосіб оплати</span><strong>${card?'Карткою · симуляція':'При отриманні · демо'}</strong></p><p><span>Демонстраційна сума</span><strong>${money(total)}</strong></p></div><p class="demo-note">Гроші не списано. Замовлення не надіслано.<br>Товари не будуть доставлені.</p><button class="primary" data-close>Повернутися до магазину</button>`;
  cart.clear();renderCart();event.target.reset();$('#address-fields').hidden=false;$('#pickup-note').hidden=true;$('[name=city]').required=true;$('[name=branch]').required=true;
  $('#success-dialog').showModal();
});
$('[name=phone]').addEventListener('input',event=>event.target.setCustomValidity(''));
renderProducts();renderCart();
