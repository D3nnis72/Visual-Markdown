import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const runtime = readFileSync(new URL('../visual-markdown.js', import.meta.url), 'utf8');
const classes = () => {
  const values = new Set();
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
};
function setup({ native = true, reject = false, legacy = true } = {}) {
  const listeners = {};
  const writes = [];
  const status = { textContent: '', classList: classes() };
  const source = 'Hi **Victor**.\n\nCheck [ASK-11014](https://linear.app/asklio/issue/ASK-11014).';
  const href = 'https://linear.app/asklio/issue/ASK-11014';
  const body = {
    innerHTML: `<p>Hi <strong>Victor</strong>.</p>\n<p>Check <a href="${href}">ASK-11014</a>.</p>`,
    cloneNode() {
      const link = { textContent: 'ASK-11014', getAttribute: () => href };
      return { style: {}, querySelectorAll: () => [link], get innerText() { return `Hi Victor.\n\nCheck ${link.textContent}.`; }, remove() {} };
    },
  };
  const attrs = { 'data-message-markdown': source, 'data-copy-success': 'Kopiert', 'data-copy-error': 'Kopieren fehlgeschlagen.' };
  const buttons = ['rich', 'markdown'].map(format => ({ disabled: false, textContent: format, getAttribute: () => format, closest: () => message }));
  const message = {
    getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = value; }, removeAttribute: key => { delete attrs[key]; },
    querySelector: selector => selector === '.vm-message-status' ? status : body,
    querySelectorAll: () => buttons,
  };
  const clipboard = {
    write: async items => { if (reject) throw new Error('Denied'); writes.push(items[0].data); },
    writeText: async text => { if (reject) throw new Error('Denied'); writes.push({ 'text/plain': text }); },
  };
  const document = {
    activeElement: { focus() {} }, documentElement: { classList: classes() }, body: { appendChild() {} },
    getElementById: () => null, querySelector: () => null,
    createElement: () => ({ value: '', style: {}, select() {}, remove() {} }),
    addEventListener: (type, fn) => { listeners[type] = fn; }, removeEventListener: type => { delete listeners[type]; },
    execCommand: () => {
      if (!legacy) return false;
      const data = {};
      listeners.copy?.({ clipboardData: { setData: (type, value) => { data[type] = value; } }, preventDefault() {} });
      writes.push(data); return true;
    },
  };
  const window = { addEventListener() {}, getSelection: () => null, ClipboardItem: class { constructor(data) { this.data = data; } } };
  vm.runInNewContext(runtime, { document, window, navigator: { clipboard: native ? clipboard : undefined }, Blob, URL, MutationObserver: class { observe() {} }, setTimeout: fn => fn() });
  async function click(index = 0) {
    listeners.click({ target: { closest: selector => selector === '.vm-message-copy' ? buttons[index] : null }, preventDefault() {} });
    await new Promise(resolve => setImmediate(resolve));
  }
  return { writes, status, buttons, click, source, body, listeners };
}

test('rich copy writes HTML links and plain text with link targets, excluding header', async () => {
  const app = setup(); await app.click();
  const data = app.writes[0];
  assert.equal(await data['text/html'].text(), app.body.innerHTML);
  assert.equal(await data['text/plain'].text(), 'Hi Victor.\n\nCheck ASK-11014 (https://linear.app/asklio/issue/ASK-11014).');
  assert.doesNotMatch(await data['text/html'].text(), /An Victor|button|status/);
  assert.match(app.status.textContent, /Kopiert/);
  assert.equal(app.buttons[0].disabled, false);
});

test('Markdown copy retains exact source and does not add HTML', async () => {
  const app = setup(); await app.click(1);
  assert.deepEqual(app.writes[0], { 'text/plain': app.source });
});

test('missing or denied clipboard API falls back with both content types', async () => {
  for (const options of [{ native: false }, { reject: true }]) {
    const app = setup(options); await app.click();
    assert.equal(app.writes[0]['text/html'], app.body.innerHTML);
    assert.match(app.writes[0]['text/plain'], /https:\/\/linear.app/);
    assert.match(app.status.textContent, /Kopiert/);
  }
});

test('failed native and legacy copy reports failure, permits another attempt', async () => {
  const app = setup({ reject: true, legacy: false });
  await app.click();
  assert.equal(app.writes.length, 0);
  assert.match(app.status.textContent, /fehlgeschlagen/);
  assert.equal(app.status.classList.contains('vm-message-error'), true);
  assert.equal(app.buttons[0].disabled, false);
  await app.click(1);
  assert.match(app.status.textContent, /fehlgeschlagen/);
});

test('repeated copying replaces feedback and the requested format', async () => {
  const app = setup();
  await app.click(); await app.click(1); await app.click();
  assert.equal(app.writes.length, 3);
  assert.match(app.status.textContent, /^rich: Kopiert$/);
});

test('existing reference copy still writes the file, section and thread', async () => {
  const app = setup();
  const attrs = { 'data-copy-id': 'case', 'data-copy-thread': '[Thread: Test; ref=x]', title: 'Verweis kopieren', 'data-copied': 'Kopiert' };
  const button = { getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = value; }, classList: classes() };
  app.listeners.click({ target: { closest: selector => selector === '.vm-copy' ? button : null }, preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.writes[0]['text/plain'], '#case [Thread: Test; ref=x]');
});
