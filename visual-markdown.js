// Kopiert im MPE-Preview den Verweis auf das Dokument oder einen Schritt:
// Dateipfad, bei Schritten mit #Kennung und, falls gesetzt, dem Thread. MPE lädt die Datei über head.html, aber nur mit
// markdown-preview-enhanced.enablePreviewScripts. Ohne sie bleibt der Knopf verborgen.
(function () {
  var sourceUri = null;
  try {
    var meta = document.getElementById('crossnote-data');
    if (meta) sourceUri = JSON.parse(meta.getAttribute('data-config')).sourceUri || null;
  } catch (error) { /* Ohne Konfiguration bleibt nur die Kennung. */ }
  // Sprung zu einem Anker, wenn ein Link aus einer anderen Datei auf `datei.md#id` zeigt. Die Nachricht kommt von der
  // gepatchten MPE-Extension (scripts/patch-mpe.mjs), mehrfach, weil das Preview erst laden und rendern muss.
  // Sobald der Leser selbst scrollt, zählen weitere Wiederholungen nicht mehr.
  var anchor = { id: null, readerMoved: false };
  function scrollToAnchor() {
    if (!anchor.id || anchor.readerMoved) return;
    var target = document.getElementById(anchor.id);
    if (target) target.scrollIntoView({ block: 'start' });
  }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
    window.addEventListener(type, function () { if (anchor.id) anchor.readerMoved = true; }, { passive: true, capture: true });
  });
  new MutationObserver(scrollToAnchor).observe(document.documentElement, { childList: true, subtree: true });

  // MPE schickt beim Wechsel der Datei im selben Preview eine neue sourceUri.
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.command === 'updateHtml' && data.sourceUri) sourceUri = data.sourceUri;
    if (data && data.command === 'vmScrollToAnchor' && data.id) {
      if (anchor.id !== data.id) anchor = { id: String(data.id), readerMoved: false };
      scrollToAnchor();
    }
  });

  function filePath() {
    var uri = sourceUri;
    if (!uri) {
      var base = document.querySelector('base');
      uri = base && base.getAttribute('href');
    }
    if (!uri) return '';
    if (uri.charAt(0) === '/') return uri;
    try { return decodeURIComponent(new URL(uri).pathname); } catch (error) { return ''; }
  }

  function legacyCopy(text, html) {
    var active = document.activeElement;
    var selection = window.getSelection();
    var ranges = [];
    if (selection) for (var i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i).cloneRange());
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    var copied = false;
    var onCopy = function (event) {
      if (!event.clipboardData) return;
      event.clipboardData.setData('text/plain', text);
      if (html !== undefined) event.clipboardData.setData('text/html', html);
      event.preventDefault();
      copied = true;
    };
    document.body.appendChild(area);
    document.addEventListener('copy', onCopy);
    try {
      area.select();
      if (!document.execCommand('copy') || (html !== undefined && !copied)) throw new Error('Clipboard unavailable');
    } finally {
      document.removeEventListener('copy', onCopy);
      area.remove();
      if (active && active.focus) active.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        ranges.forEach(function (range) { selection.addRange(range); });
      }
    }
  }

  function writeClipboard(text, html) {
    // Start the native write in the click handler, while user activation is live.
    try {
      if (html !== undefined && navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        return navigator.clipboard.write([new window.ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' })
        })]).catch(function () { legacyCopy(text, html); });
      }
      if (html === undefined && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(function () { legacyCopy(text); });
      }
      legacyCopy(text, html);
      return Promise.resolve();
    } catch (error) { return Promise.reject(error); }
  }

  function messagePayload(body) {
    var clone = body.cloneNode(true);
    // Plain-text destinations still get the link targets, including Linear and PR URLs.
    clone.querySelectorAll('a[href]').forEach(function (link) {
      var url = link.getAttribute('href');
      if (link.textContent !== url) link.textContent += ' (' + url + ')';
    });
    clone.style.position = 'fixed';
    clone.style.left = '-100000px';
    clone.style.width = '800px';
    document.body.appendChild(clone);
    try { return { text: clone.innerText.trim(), html: body.innerHTML }; }
    finally { clone.remove(); }
  }

  function copyMessage(button) {
    var message = button.closest('.vm-message');
    if (!message || message.getAttribute('aria-busy') === 'true') return;
    var status = message.querySelector('.vm-message-status');
    var buttons = message.querySelectorAll('.vm-message-copy');
    var markdown = button.getAttribute('data-copy-format') === 'markdown';
    var payload = markdown ? { text: message.getAttribute('data-message-markdown') } : messagePayload(message.querySelector('.vm-message-body'));
    message.setAttribute('aria-busy', 'true');
    buttons.forEach(function (control) { control.disabled = true; });
    status.textContent = '';
    status.classList.remove('vm-message-error');
    writeClipboard(payload.text, payload.html).then(function () {
      status.textContent = button.textContent + ': ' + message.getAttribute('data-copy-success');
    }).catch(function () {
      status.textContent = message.getAttribute('data-copy-error');
      status.classList.add('vm-message-error');
    }).finally(function () {
      message.removeAttribute('aria-busy');
      buttons.forEach(function (control) { control.disabled = false; });
    });
  }

  document.documentElement.classList.add('vm-scripts');
  document.addEventListener('click', function (event) {
    var messageButton = event.target.closest && event.target.closest('.vm-message-copy');
    if (messageButton) { event.preventDefault(); copyMessage(messageButton); return; }
    var button = event.target.closest && event.target.closest('.vm-copy');
    if (!button) return;
    event.preventDefault();
    // Ohne data-copy-id verweist der Knopf auf das ganze Dokument.
    var id = button.getAttribute('data-copy-id');
    var text = filePath() + (id ? '#' + id : '');
    if (!text) return;
    var thread = button.getAttribute('data-copy-thread');
    if (thread) text += ' ' + thread;
    var title = button.getAttribute('title');
    writeClipboard(text).then(function () {
      button.classList.add('vm-copied');
      button.setAttribute('title', button.getAttribute('data-copied') || title);
      setTimeout(function () {
        button.classList.remove('vm-copied');
        button.setAttribute('title', title);
      }, 1500);
    }).catch(function () {
      button.setAttribute('title', 'Kopieren fehlgeschlagen / Copy failed');
    });
  });
})();
