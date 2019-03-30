(function(doc) {
  'use strict';

  var CLASS_ACTIVE = 'is-active';
  var ESC_KEY_CODE = 27;

  var mainHeader = doc.getElementById('main-header');
  var mainNav = doc.getElementById('main-nav').cloneNode(true);
  var slideOutNav = doc.createElement('nav');
  var hamburger = doc.createElement('button');

  function setFocus(slideOutNavIsOpen) {
    if (slideOutNavIsOpen) {
      slideOutNav.querySelector('a').focus();
      return;
    }

    hamburger.focus();
  }

  function toggleSlideOutNav() {
    hamburger.classList.toggle(CLASS_ACTIVE);
    slideOutNav.classList.toggle(CLASS_ACTIVE);

    var slideOutNavIsOpen = hamburger.classList.contains(CLASS_ACTIVE);
    var ariaHidden = slideOutNavIsOpen ? 'false' : 'true';

    setFocus(slideOutNavIsOpen);
    slideOutNav.setAttribute('aria-hidden', ariaHidden);
  }

  function closeSlideOutNav(evnt) {
    var slideOutNavIsOpen = hamburger.classList.contains(CLASS_ACTIVE);

    if (evnt.keyCode === ESC_KEY_CODE && slideOutNavIsOpen) {
      toggleSlideOutNav();
    }
  }

  function navigate(evnt) {
    if (evnt.target.pathname === location.pathname && evnt.target.hash) {
      evnt.preventDefault();
      setTimeout(function() {
        location.hash = evnt.target.hash;
      }, 200);
    }

    toggleSlideOutNav();
  }

  slideOutNav.className = 'slideout-nav';
  slideOutNav.id = 'slideout-nav';
  slideOutNav.setAttribute('aria-label', 'Main navigation');
  slideOutNav.setAttribute('aria-hidden', 'true');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = [
    '<span class="hamburger-icon" aria-hidden="true"></span>',
    '<span class="hamburger-label">Menu</span>',
  ].join('');
  hamburger.setAttribute('aria-controls', slideOutNav.id);
  hamburger.setAttribute('aria-haspopup', 'true');

  mainHeader.appendChild(hamburger);
  slideOutNav.appendChild(mainNav);
  doc.body.appendChild(slideOutNav);

  hamburger.addEventListener('click', toggleSlideOutNav);
  doc.addEventListener('keyup', closeSlideOutNav);

  [].slice.call(mainNav.getElementsByTagName('a')).forEach(function(anchor) {
    anchor.addEventListener('click', navigate);
  });
})(document);
