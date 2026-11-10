(function () {
  'use strict';
  var triggers = Array.from(document.querySelectorAll('a')).filter(function (link) {
    return link.textContent.trim() === 'Free webinar';
  });
  if (!triggers.length) return;

  var style = document.createElement('style');
  style.textContent = '.webinar-dialog{box-sizing:border-box;width:min(560px,calc(100% - 32px));max-height:calc(100dvh - 32px);padding:32px;border:0;border-radius:24px;background:#fff;color:#131A22;font:17px/1.6 Figtree,system-ui,sans-serif;overflow:auto}.webinar-dialog::backdrop{background:rgb(19 26 34 / .65)}.webinar-dialog h2{font-family:"Bricolage Grotesque",sans-serif;font-size:30px;line-height:1.2;margin:0 44px 12px 0}.webinar-dialog p{color:#5E534A;margin:0 0 24px}.webinar-dialog form{display:grid;gap:18px;padding:0!important}.webinar-dialog label{display:grid;gap:6px;font-weight:600;font-size:15px}.webinar-dialog input:not([type=hidden]){box-sizing:border-box;width:100%;min-height:50px;padding:10px 14px;border:1px solid #9A8877;border-radius:12px;font:inherit}.webinar-dialog button{font:inherit;cursor:pointer}.webinar-close{position:absolute;right:20px;top:20px;width:44px;height:44px;border:0;border-radius:50%;background:#FFF3E5;color:#131A22;font-size:28px!important}.webinar-send{min-height:54px;border:0;border-radius:999px;background:#F78E1D;color:#131A22;font-weight:700!important}.webinar-dialog small{color:#5E534A;font-size:14px}@media(max-width:480px){.webinar-dialog{padding:24px}.webinar-dialog h2{font-size:26px}}';
  document.head.appendChild(style);

  var dialog = document.createElement('dialog');
  dialog.className = 'webinar-dialog';
  dialog.id = 'webinar-dialog';
  dialog.setAttribute('aria-labelledby', 'webinar-dialog-title');
  dialog.setAttribute('aria-describedby', 'webinar-dialog-description');
  dialog.innerHTML = '<button type="button" class="webinar-close" aria-label="Close registration form">×</button>' +
    '<h2 id="webinar-dialog-title">Join the free webinar</h2>' +
    '<p id="webinar-dialog-description">Leave your details and we’ll get in touch with the webinar information.</p>' +
    '<form action="https://formsubmit.co/mediarecyclebin@gmail.com" method="POST">' +
    '<input type="hidden" name="_subject" value="New IQCBS free webinar registration">' +
    '<input type="hidden" name="_template" value="table">' +
    '<input type="hidden" name="interest" value="Free webinar">' +
    '<label for="webinar-name">Your name<input id="webinar-name" name="name" type="text" autocomplete="name" required></label>' +
    '<label for="webinar-phone">WhatsApp number<input id="webinar-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91" required></label>' +
    '<label for="webinar-email">Email<input id="webinar-email" name="email" type="email" autocomplete="email" required></label>' +
    '<button class="webinar-send" type="submit">Register for free</button>' +
    '<small>Your registration will be sent by email. We’ll contact you using the details provided.</small></form>';
  document.body.appendChild(dialog);
  var opener;
  var previousOverflow;
  triggers.forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', function (event) {
      event.preventDefault();
      opener = link;
      previousOverflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      dialog.querySelector('#webinar-name').focus();
    });
  });
  dialog.querySelector('.webinar-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    var rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', function () {
    document.documentElement.style.overflow = previousOverflow || '';
    if (opener) opener.focus();
  });
})();
