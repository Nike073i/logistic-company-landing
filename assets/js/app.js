function toggleClassOnComponenetPassed({
  target,
  className,
  component,
  container,
}) {
  const componentHeight = component.outerHeight();
  const scrollTop = container.scrollTop();
  const componentBottom = component.offset().top + componentHeight;
  target.toggleClass(className, scrollTop > componentBottom);
}

function scrollTo({ component, container }) {
  const componentTop = component.offset().top;
  return (duration, offset = 0) =>
    container.animate(
      {
        scrollTop: componentTop - offset,
      },
      duration
    );
}

function isExists(element) {
  return element && element.length;
}

const linearSearch = (collection, position) => {
  const result = collection.reduce(
    (acc, curr, index) => (curr <= position ? index : acc),
    -1
  );
  return result;
};

const withPrev = (fn, initial) => {
  let prev = initial;

  return (...args) => {
    const curr = fn(...args);
    const result = [prev, curr];
    prev = curr;
    return result;
  };
};

function scrollSpy({ points, activate, deactivate, offset = 0 }) {
  const findPoint = withPrev(
    (position) => linearSearch(points, position + offset),
    -1
  );

  function handle(scrollTop) {
    const [prev, curr] = findPoint(scrollTop);
    if (prev === curr) return;

    if (prev !== -1) deactivate(prev);
    if (curr !== -1) activate(curr);
  }

  return handle;
}

function createTargetsMap({
  elements,
  targetIdAttr,
  classNameAttr,
  defaultClassName = "activate",
}) {
  const spyTargets = {};

  elements.each(function () {
    const $this = $(this);
    const targetId = $this.data(targetIdAttr);
    const $target = $(`#${targetId}`);
    const className = $this.data(classNameAttr) || defaultClassName;

    if (!spyTargets[targetId]) {
      spyTargets[targetId] = {
        position: $target.offset().top,
        element: $target,
        listeners: [],
      };
    }

    spyTargets[targetId].listeners.push({
      className,
      element: $this,
    });
  });

  return spyTargets;
}

$(document).ready(() => {
  const $header = $(".header");
  const $intro = $(".intro");
  const $window = $(window);
  const $html = $("html");
  const $body = $(document.body);

  /* set header dark after section intro */
  const SET_HEADER_OPACITY_THROTTLE_DELAY = 250;
  const HEADER_DARK_CLASS_NAME = "header--dark";

  const setHeaderOpacity = () =>
    toggleClassOnComponenetPassed({
      target: $header,
      className: HEADER_DARK_CLASS_NAME,
      component: $intro,
      container: $window,
    });

  const throttledSetHeaderOpacity = $.throttle(
    SET_HEADER_OPACITY_THROTTLE_DELAY,
    setHeaderOpacity
  );

  $window.on("scroll resize", throttledSetHeaderOpacity);

  /* Smooth scrolling to sections */
  const SMOOTH_SCROLLING_DURATION = 500;
  const SMOOTH_SCROLLING_OFFSET = $header.height() + 25;
  const SMOOTH_SCROLLING_ATTR = "scroll";
  const SMOOTH_SCROLLING_SELECTOR = `[data-${SMOOTH_SCROLLING_ATTR}]`;

  $(SMOOTH_SCROLLING_SELECTOR).each(function () {
    const $this = $(this);
    const targetSelector = `#${$this.data(SMOOTH_SCROLLING_ATTR)}`;
    const $target = $(targetSelector);

    if (!isExists($target)) return;

    const scrollFunction = scrollTo({
      component: $target,
      container: $html,
    });

    $this.click(function (e) {
      e.preventDefault();
      scrollFunction(SMOOTH_SCROLLING_DURATION, SMOOTH_SCROLLING_OFFSET);
    });
  });

  /* ScrollSpy */
  const SCROLLSPY_TARGET_ATTR = "scrollspy";
  const SCROLLSPY_TARGET_SELECTOR = `[data-${SCROLLSPY_TARGET_ATTR}]`;
  const SCROLLSPY_CLASSNAME_ATTR = "scrollspy-class";
  const SCROLLSPY_THROTTLE_DELAY = 250;
  const SCROLLSPY_OFFSET = $window.height() / 3;

  const targetsMap = createTargetsMap({
    elements: $(SCROLLSPY_TARGET_SELECTOR),
    targetIdAttr: SCROLLSPY_TARGET_ATTR,
    classNameAttr: SCROLLSPY_CLASSNAME_ATTR,
  });

  const sortedTargetsMap = Object.values(targetsMap).sort(
    (a, b) => a.position - b.position
  );
  const spyHandler = scrollSpy({
    points: sortedTargetsMap.map((p) => p.position),
    activate: (ind) =>
      sortedTargetsMap[ind].listeners.forEach((l) =>
        l.element.addClass(l.className)
      ),
    deactivate: (ind) =>
      sortedTargetsMap[ind].listeners.forEach((l) =>
        l.element.removeClass(l.className)
      ),
    offset: SCROLLSPY_OFFSET,
  });

  const throttledSpyHandler = $.throttle(SCROLLSPY_THROTTLE_DELAY, spyHandler);

  $window.on("scroll", function () {
    const scrollTop = $(this).scrollTop();
    throttledSpyHandler(scrollTop);
  });

  /* Modals */
  const MODAL_TRIGGER_ATTR = "modal";
  const MODAL_OPEN_CLASSNAME = "show";
  const MODAL_TRIGGER_SELECTOR = `[data-${MODAL_TRIGGER_ATTR}]`;
  const MODAL_CLOSE_ATTR = `modal-close`;
  const MODAL_CLOSE_SELECTOR = `[data-${MODAL_CLOSE_ATTR}]`;
  const NOSCROLL_CLASSNAME = "no-scroll";
  const MODAL_CONTENT_SELECTOR = ".modal-wrapper";
  const MODAL_CLASSNAME = '.modal';

  $(MODAL_TRIGGER_SELECTOR).on("click", function (e) {
    e.preventDefault();
    const modalId = $(this).data(MODAL_TRIGGER_ATTR);
    const $modal = $(`#${modalId}`);
    $body.addClass(NOSCROLL_CLASSNAME);
    $modal.addClass(MODAL_OPEN_CLASSNAME);
  });

  $(MODAL_CLOSE_SELECTOR).on("click", function (e) {
    e.preventDefault();
    const $modal = $(this).closest(MODAL_CLASSNAME);
    $modal.removeClass(MODAL_OPEN_CLASSNAME);
    $body.removeClass(NOSCROLL_CLASSNAME);
  });

  $(MODAL_CONTENT_SELECTOR).on('click', function(e) {
    e.stopPropagation();
  });

  /* 
    Carousel 
    lib - https://kenwheeler.github.io/slick/
  */
  const CAROUSEL_TARGET_ATTR = "carousel-target";
  const CAROUSEL_NEXT_ATTR = "carousel-next";
  const CAROUSEL_NEXT_SELECTOR = `[data-${CAROUSEL_NEXT_ATTR}]`;
  const CAROUSEL_PREV_ATTR = "carousel-prev";
  const CAROUSEL_PREV_SELECTOR = `[data-${CAROUSEL_PREV_ATTR}]`;
  const INTRO_CAROUSEL_CONTAINER_SELECTOR = "#intro-carousel";

  $(INTRO_CAROUSEL_CONTAINER_SELECTOR).slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    speed: 500,
    draggable: false
  });

  const slideActionHandler = (selector, action) => {
    $(selector).each(function () {
      const $this = $(this);
      const targetId = $this.data(CAROUSEL_TARGET_ATTR);
      const $target = $(`#${targetId}`);
      if (!isExists($target)) return;
      $this.click(function () { action($target) });
    });
  }

  slideActionHandler(CAROUSEL_NEXT_SELECTOR, target => target.slick('slickNext'));
  slideActionHandler(CAROUSEL_PREV_SELECTOR, target => target.slick('slickPrev'));

  /* invoke by load */
  spyHandler($window.scrollTop());
  setHeaderOpacity();
});
