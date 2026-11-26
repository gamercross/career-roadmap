// 커리어 로드맵: 데일리 로그 (이 브라우저의 localStorage에만 저장한다)
(function(){
  var STORAGE_KEY = 'career-roadmap-log';
  var listEl = document.getElementById('log-list');
  var formEl = document.getElementById('log-form');
  var statusEl = document.getElementById('log-status');
  var clearBtn = document.getElementById('log-clear');
  var didEl = document.getElementById('log-did');
  if (!listEl || !formEl) return;

  function load(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function save(entries){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    }catch(e){ return false; }
  }

  // 글은 textContent로만 넣는다(innerHTML 없음)
  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }

  function render(entries){
    listEl.replaceChildren();
    if(!entries || !entries.length){
      listEl.append(el('div', 'log-empty', '아직 기록이 없습니다. 위 폼에 오늘 한 일을 남겨보세요.'));
      return;
    }
    var list = el('div', 'log-list');
    entries.forEach(function(e){
      var box = el('div', 'log-entry');
      box.append(el('div', 'log-date', e.date || ''));
      var dl = el('dl');
      [['한 일', e.did], ['이유', e.why], ['막힌 점', e.blocker], ['다음', e.next]].forEach(function(row, i){
        if (i > 0 && !row[1]) return;
        dl.append(el('dt', null, row[0]), el('dd', null, row[1] || ''));
      });
      box.append(dl);
      list.append(box);
    });
    listEl.append(list);
  }

  render(load());

  didEl.addEventListener('input', function(){
    if (didEl.value.trim()) { didEl.removeAttribute('aria-invalid'); statusEl.classList.remove('err'); }
  });

  formEl.addEventListener('submit', function(ev){
    ev.preventDefault();
    var did = didEl.value.trim();
    if(!did){
      statusEl.textContent = '오늘 무엇을 했는지는 꼭 적어주세요.';
      statusEl.classList.add('err');
      didEl.setAttribute('aria-invalid', 'true');
      didEl.focus();
      return;
    }
    statusEl.classList.remove('err');
    didEl.removeAttribute('aria-invalid');
    var entry = {
      date: new Date().toISOString().slice(0,10),
      did: did,
      why: document.getElementById('log-why').value.trim(),
      blocker: document.getElementById('log-blocker').value.trim(),
      next: document.getElementById('log-next').value.trim()
    };
    var entries = [entry].concat(load());
    if(save(entries)){
      render(entries);
      formEl.reset();
      statusEl.textContent = '이 브라우저에 저장됐습니다.';
    }else{
      statusEl.textContent = '저장에 실패했습니다 (브라우저 저장소를 사용할 수 없음).';
      statusEl.classList.add('err');
    }
  });

  clearBtn.addEventListener('click', function(){
    if(!confirm('이 브라우저에 저장된 기록을 모두 지울까요?')) return;
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    render([]);
    statusEl.textContent = '기록을 모두 지웠습니다.';
  });
})();
