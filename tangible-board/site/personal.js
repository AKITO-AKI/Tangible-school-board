(function(){
  const STORAGE_KEY = 'tsb:personal';
  const state = {
    notes: [],
    reminders: []
  };
  const el = {
    notesList: document.getElementById('notesList'),
    remindersList: document.getElementById('remindersList'),
    quickForm: document.getElementById('quickForm'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        const data = JSON.parse(raw);
        state.notes = Array.isArray(data.notes) ? data.notes : [];
        state.reminders = Array.isArray(data.reminders) ? data.reminders : [];
      }
    }catch(e){ console.warn('Load failed', e); }
  }
  function save(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(e){ console.warn('Save failed', e); }
  }
  function uid(){ return Math.random().toString(36).slice(2,10); }

  function renderList(container, items, type){
    container.innerHTML = '';
    if (!items.length){
      const p = document.createElement('p'); p.className = 'empty'; p.textContent = type === 'note' ? 'まだメモがありません。' : 'まだリマインダーがありません。';
      container.appendChild(p);
      return;
    }
    items.forEach((it) => {
      const div = document.createElement('div'); div.className = 'item'; div.setAttribute('role','listitem'); div.dataset.id = it.id;
      const title = document.createElement('div'); title.className = 'item-title'; title.textContent = it.title || '(無題)';
      const body = document.createElement('div'); body.className = 'item-body'; body.textContent = it.body || '';
      div.appendChild(title);
      if (body.textContent) div.appendChild(body);
      if (type === 'reminder'){
        const meta = document.createElement('div'); meta.className = 'item-meta';
        const dueStr = it.due ? new Date(it.due).toLocaleString() : '期限なし';
        meta.textContent = `期限: ${dueStr}`;
        div.appendChild(meta);
      }
      const actions = document.createElement('div'); actions.className = 'actions';
      const editBtn = document.createElement('button'); editBtn.type='button'; editBtn.textContent='編集';
      const delBtn = document.createElement('button'); delBtn.type='button'; delBtn.textContent='削除';
      actions.appendChild(editBtn); actions.appendChild(delBtn); div.appendChild(actions);
      editBtn.addEventListener('click', () => editItem(type, it.id));
      delBtn.addEventListener('click', () => deleteItem(type, it.id));
      container.appendChild(div);
    });
  }

  function sync(){ save(); render(); }
  function render(){
    renderList(el.notesList, state.notes, 'note');
    renderList(el.remindersList, state.reminders, 'reminder');
  }

  function addItem(payload){
    const base = { id: uid(), title: payload.title, body: payload.body };
    if (payload.type === 'note'){
      state.notes.unshift(base);
    } else {
      state.reminders.unshift({ ...base, due: payload.due || null, done: false });
    }
    sync();
  }
  function deleteItem(type, id){
    if (type === 'note'){
      state.notes = state.notes.filter(n => n.id !== id);
    } else {
      state.reminders = state.reminders.filter(r => r.id !== id);
    }
    sync();
  }
  function editItem(type, id){
    const list = type === 'note' ? state.notes : state.reminders;
    const target = list.find(x => x.id === id);
    if (!target) return;
    const title = prompt('タイトルを編集', target.title || '');
    if (title === null) return;
    const body = prompt('本文を編集', target.body || '');
    target.title = title; target.body = body;
    if (type === 'reminder'){
      const due = prompt('期限 (YYYY-MM-DD hh:mm) 空欄可', target.due ? new Date(target.due).toISOString().slice(0,16).replace('T',' ') : '');
      if (due){
        const iso = due.replace(' ', 'T');
        const d = new Date(iso);
        if (!isNaN(d.getTime())) target.due = d.toISOString();
      } else {
        target.due = null;
      }
    }
    sync();
  }

  function exportData(){
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tsb-personal.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function importData(){
    const input = document.createElement('input'); input.type='file'; input.accept='application/json';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try{
          const data = JSON.parse(String(reader.result || '{}'));
          state.notes = Array.isArray(data.notes) ? data.notes : [];
          state.reminders = Array.isArray(data.reminders) ? data.reminders : [];
          sync();
        }catch(e){ alert('読み込みに失敗しました'); }
      };
      reader.readAsText(file);
    });
    input.click();
  }
  function resetAll(){
    if (!confirm('すべてのデータを削除します。よろしいですか？')) return;
    state.notes = []; state.reminders = []; sync();
  }

  function initEvents(){
    if (el.quickForm){
      el.quickForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const fd = new FormData(el.quickForm);
        const type = String(fd.get('type'));
        const title = String(fd.get('title') || '').trim();
        const body = String(fd.get('body') || '').trim();
        const due = String(fd.get('due') || '').trim();
        if (!title){ alert('タイトルを入力してください'); return; }
        addItem({ type, title, body, due: due ? new Date(due).toISOString() : null });
        el.quickForm.reset();
      });
    }
    const notesClear = document.querySelector('[data-notes-clear]');
    const remindersClear = document.querySelector('[data-reminders-clear]');
    notesClear && notesClear.addEventListener('click', () => { if (confirm('メモを全て削除しますか？')) { state.notes = []; sync(); } });
    remindersClear && remindersClear.addEventListener('click', () => { if (confirm('リマインダーを全て削除しますか？')) { state.reminders = []; sync(); } });

    el.exportBtn && el.exportBtn.addEventListener('click', exportData);
    el.importBtn && el.importBtn.addEventListener('click', importData);
    el.resetBtn && el.resetBtn.addEventListener('click', resetAll);
  }

  // init
  load();
  initEvents();
  render();
})();
