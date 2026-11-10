(function () {
  'use strict';
  if (document.getElementById('whatsapp-widget')) return;
  var style = document.createElement('style');
  style.textContent = '.whatsapp-widget{position:fixed;right:24px;bottom:24px;z-index:45;display:flex;align-items:flex-end;gap:12px;font:15px/1.5 Figtree,system-ui,sans-serif;color:#131A22}.whatsapp-intro{position:relative;box-sizing:border-box;max-width:245px;padding:16px 36px 16px 18px;background:#fff;border:1px solid #E6D9CB;border-radius:16px 16px 4px 16px;box-shadow:0 8px 32px #131a221f;animation:whatsapp-greeting .5s ease both}.whatsapp-intro strong{display:block;margin-bottom:4px}.whatsapp-intro p{margin:0;color:#5E534A}.whatsapp-intro a{display:inline-block;margin-top:8px;color:#176b39;font-weight:700}.whatsapp-dismiss{position:absolute;top:4px;right:4px;width:30px;height:30px;background:none;border:0;color:#5E534A;font:22px/1 system-ui;cursor:pointer}.whatsapp-launch{position:relative;flex:none;display:grid;place-items:center;width:60px;height:60px;border-radius:50%;background:#25D366;color:#fff!important;box-shadow:0 6px 22px #128c7e40;text-decoration:none}.whatsapp-launch::before{content:"";position:absolute;inset:0;border:2px solid #25D366;border-radius:50%;animation:whatsapp-pulse 2.6s ease-out 5;pointer-events:none}.whatsapp-launch:hover{background:#1db958;transform:translateY(-2px)}.whatsapp-launch:focus-visible,.whatsapp-dismiss:focus-visible{outline:3px solid #A85A0F;outline-offset:4px}.whatsapp-launch svg{width:33px;height:33px}@keyframes whatsapp-pulse{0%{transform:scale(1);opacity:.65}80%,100%{transform:scale(1.45);opacity:0}}@keyframes whatsapp-greeting{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media(max-width:860px){.whatsapp-widget{right:16px;bottom:calc(92px + env(safe-area-inset-bottom));gap:10px}.whatsapp-launch{width:54px;height:54px}.whatsapp-intro{max-width:min(230px,calc(100vw - 100px));font-size:14px;padding-left:14px}}@media(prefers-reduced-motion:reduce){.whatsapp-launch::before,.whatsapp-intro{animation:none}.whatsapp-launch:hover{transform:none}}';
  document.head.appendChild(style);
  var url = 'https://wa.me/919831932907?text=' + encodeURIComponent('Hi IQCBS! I would like to know more about your courses and free webinar.');
  var widget = document.createElement('div');
  widget.id = 'whatsapp-widget';
  widget.className = 'whatsapp-widget';
  widget.innerHTML = '<div class="whatsapp-intro"><button class="whatsapp-dismiss" type="button" aria-label="Dismiss WhatsApp greeting">×</button><strong>Hi there! 👋</strong><p>Have a question? Chat with IQCBS on WhatsApp.</p><a target="_blank" rel="noopener noreferrer" href="' + url + '"></a></div><a class="whatsapp-launch" target="_blank" rel="noopener noreferrer" href="' + url + '" aria-label="Chat with IQCBS on WhatsApp at +91 98319 32907"><svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .8A15.1 15.1 0 0 0 3.1 23.7L1 31l7.5-2A15.2 15.2 0 1 0 16 .8zm0 27.7a12.4 12.4 0 0 1-6.3-1.7l-.4-.3-4.5 1.2L6 23.3l-.3-.5A12.5 12.5 0 1 1 16 28.5zm6.9-9.3c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.3 0-.5 0-.7l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.7 4.1 6.5 5.7.9.4 1.6.7 2.2.8.9.3 1.8.2 2.4.2.8-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg></a>';
  document.body.appendChild(widget);
  var greeting = widget.querySelector('.whatsapp-intro');
  try { greeting.hidden = sessionStorage.getItem('iqcbs-whatsapp-dismissed') === 'yes'; } catch (_) {}
  widget.querySelector('.whatsapp-dismiss').addEventListener('click', function () {
    greeting.hidden = true;
    try { sessionStorage.setItem('iqcbs-whatsapp-dismissed', 'yes'); } catch (_) {}
    widget.querySelector('.whatsapp-launch').focus();
  });
})();
