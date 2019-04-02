import LazyLoad from 'vanilla-lazyload';

export const lazyLoad = (elements) =>
  new LazyLoad(
    {
      callback_enter: (el) => el.classList.add(el.dataset.lazyloadClass),
    },
    elements
  );
