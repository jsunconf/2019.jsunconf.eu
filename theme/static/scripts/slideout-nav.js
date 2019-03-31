const CLASS_ACTIVE = 'is-active';
const ESC_KEY_CODE = 27;

const mainHeader = document.getElementById('main-header');
const mainNav = document.getElementById('main-nav').cloneNode(true);
const slideOutNav = document.createElement('nav');
const hamburger = document.createElement('button');

const setFocus = (slideOutNavIsOpen) => {
  if (slideOutNavIsOpen) {
    slideOutNav.querySelector('a').focus();
    return;
  }

  hamburger.focus();
};

const toggleSlideOutNav = () => {
  hamburger.classList.toggle(CLASS_ACTIVE);
  slideOutNav.classList.toggle(CLASS_ACTIVE);

  const slideOutNavIsOpen = hamburger.classList.contains(CLASS_ACTIVE);
  const ariaHidden = slideOutNavIsOpen ? 'false' : 'true';

  setFocus(slideOutNavIsOpen);
  slideOutNav.setAttribute('aria-hidden', ariaHidden);
};

const closeSlideOutNav = (evnt) => {
  const slideOutNavIsOpen = hamburger.classList.contains(CLASS_ACTIVE);

  if (evnt.keyCode === ESC_KEY_CODE && slideOutNavIsOpen) {
    toggleSlideOutNav();
  }
};

const navigate = (evnt) => {
  if (evnt.target.pathname === location.pathname && evnt.target.hash) {
    evnt.preventDefault();
    setTimeout(() => {
      location.hash = evnt.target.hash;
    }, 200);
  }

  toggleSlideOutNav();
};

mainNav.removeAttribute('id');
slideOutNav.className = 'slideout-nav';
slideOutNav.id = 'slideout-nav';
slideOutNav.setAttribute('aria-label', 'Main navigation');
slideOutNav.setAttribute('aria-hidden', 'true');
hamburger.className = 'hamburger';
hamburger.innerHTML = `
  <span class="hamburger-icon" aria-hidden="true"></span>
  <span class="hamburger-label">Menu</span>
`;
hamburger.setAttribute('aria-controls', slideOutNav.id);
hamburger.setAttribute('aria-haspopup', 'true');

mainHeader.appendChild(hamburger);
slideOutNav.appendChild(mainNav);
document.body.appendChild(slideOutNav);

hamburger.addEventListener('click', toggleSlideOutNav);
document.addEventListener('keyup', closeSlideOutNav);

[].slice
  .call(mainNav.getElementsByTagName('a'))
  .forEach((anchor) => anchor.addEventListener('click', navigate));
