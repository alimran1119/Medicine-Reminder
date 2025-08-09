// Common helpers (auth, nav highlighting, fetch wrapper)
const App = {
  token() { return localStorage.getItem('token'); },
  user() { try { return JSON.parse(localStorage.getItem('user')||'null'); } catch { return null; } },
  setSession({token, user}) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  clearSession(){ localStorage.removeItem('token'); localStorage.removeItem('user'); },
  async api(path, opts={}){
    const headers = opts.headers || {};
    if(!(opts.body instanceof FormData)){
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if(this.token()) headers['Authorization'] = 'Bearer ' + this.token();
    const res = await fetch(path, { ...opts, headers });
    if(!res.ok) throw new Error((await res.json()).error || ('HTTP '+res.status));
    return res.json();
  },
  highlightNav(){
    const here = location.pathname;
    document.querySelectorAll('nav a.link').forEach(a => {
      if(a.getAttribute('href') === here) a.classList.add('active');
    });
    const u = this.user();
    if(u?.role === 'admin'){
      const admin = document.getElementById('adminLink');
      if(admin) admin.classList.remove('hidden');
    }
  }
};
window.App = App;
// THEME manager
const Theme = {
  key: 'theme',
  get(){ return localStorage.getItem(this.key) || 'forest'; },
  set(name){ localStorage.setItem(this.key, name); this.apply(); },
  apply(){
    const t = this.get();
    document.body.setAttribute('data-theme', t);
  },
  init(){
    this.apply();
    // Inject selector into top nav
    const nav = document.querySelector('nav .container');
    if(nav && !document.getElementById('themeSelectNav')){
      const sel = document.createElement('select');
      sel.id = 'themeSelectNav';
      sel.className = 'theme-select';
      ['forest','sunset','ocean'].forEach(x=>{
        const opt = document.createElement('option');
        opt.value = x; opt.textContent = x[0].toUpperCase()+x.slice(1);
        if(x===this.get()) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', e=> this.set(e.target.value));
      // insert before Logout button
      const rightBtn = nav.querySelector('a.btn');
      if(rightBtn) nav.insertBefore(sel, rightBtn);
      else nav.appendChild(sel);
    }
  }
};
window.Theme = Theme;


document.addEventListener('DOMContentLoaded', () => { App.highlightNav(); Theme.init(); });

// Bottom nav & sheet
function renderBottomNav(){
  const isAdmin = App.user()?.role === 'admin';
  const here = location.pathname;
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <div class="container">
      <a href="/dashboard.html" class="${here==='/dashboard.html'?'active':''}">🏠</a>
      <a href="/catalog.html" class="${here==='/catalog.html'?'active':''}">💊</a>
      ${isAdmin ? '<a href="/admin.html" class="'+(here==='/admin.html'?'active':'')+'">🛠️</a>' : '<span></span>'}
      <button id="menuBtn" aria-label="menu"><div class="hamburger"><span></span><span></span><span></span></div></button>
    </div>`;
  document.body.appendChild(nav);

  // Sheet menu
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.innerHTML = `
    <div class="title">Menu</div>
    <div class="sheet-item"><a href="/index.html">Login</a></div>
    <div class="sheet-item"><a href="/dashboard.html">Reminders</a></div>
    <div class="sheet-item"><a href="/catalog.html">Medicine Corner</a></div>
    ${isAdmin ? '<div class="sheet-item"><a href="/admin.html">Admin Upload</a></div>' : ''}
    <div class="sheet-item"><a href="/cart.html">Cart</a></div>
    <div class="sheet-item"><a href="#" id="logoutLink">Logout</a></div>
    <p class="muted mt-12">Tap outside or press the menu button to close.</p>
  `;
  document.body.appendChild(sheet);

  document.getElementById('menuBtn').addEventListener('click', ()=> sheet.classList.toggle('open'));
  const tForest = sheet.querySelector('#tForest');
  const tSunset = sheet.querySelector('#tSunset');
  const tOcean = sheet.querySelector('#tOcean');
  if(tForest){ tForest.addEventListener('click', ()=> { Theme.set('forest'); }); }
  if(tSunset){ tSunset.addEventListener('click', ()=> { Theme.set('sunset'); }); }
  if(tOcean){ tOcean.addEventListener('click', ()=> { Theme.set('ocean'); }); }

  sheet.addEventListener('click', (e)=>{
    if(e.target.id==='logoutLink'){ App.clearSession(); location.href='/index.html'; }
  });
  // Close on ESC
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') sheet.classList.remove('open'); });
}
window.renderBottomNav = renderBottomNav;

// Simple client-side cart
const Cart = {
  read(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; } },
  write(items){ localStorage.setItem('cart', JSON.stringify(items)); },
  add(item){ const items = Cart.read(); items.push(item); Cart.write(items); },
  remove(i){ const items = Cart.read(); items.splice(i,1); Cart.write(items); },
  clear(){ Cart.write([]); }
};
window.Cart = Cart;