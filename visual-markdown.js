// Kopiert im MPE-Preview den Verweis auf das Dokument oder einen Schritt:
// Dateipfad, bei Schritten mit #Kennung und, falls gesetzt, dem Thread. MPE lädt die Datei über head.html, aber nur mit
// markdown-preview-enhanced.enablePreviewScripts. Ohne sie bleibt der Knopf verborgen.
(function () {
  var sourceUri = null;
  try {
    var meta = document.getElementById('crossnote-data');
    if (meta) sourceUri = JSON.parse(meta.getAttribute('data-config')).sourceUri || null;
  } catch (error) { /* Ohne Konfiguration bleibt nur die Kennung. */ }
  // MPE schickt beim Wechsel der Datei im selben Preview eine neue sourceUri.
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.command === 'updateHtml' && data.sourceUri) sourceUri = data.sourceUri;
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

  function writeClipboard(text) {
    var fallback = function () {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    fallback();
    return Promise.resolve();
  }

  document.documentElement.classList.add('vm-scripts');
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.vm-copy');
    if (!button) return;
    event.preventDefault();
    // Ohne data-copy-id verweist der Knopf auf das ganze Dokument.
    var id = button.getAttribute('data-copy-id');
    var text = filePath() + (id ? '#' + id : '');
    if (!text) return;
    var thread = button.getAttribute('data-copy-thread');
    if (thread) text += ' ' + thread;
    writeClipboard(text).then(function () {
      var title = button.getAttribute('title');
      button.classList.add('vm-copied');
      button.setAttribute('title', button.getAttribute('data-copied') || title);
      setTimeout(function () {
        button.classList.remove('vm-copied');
        button.setAttribute('title', title);
      }, 1500);
    });
  });
})();
