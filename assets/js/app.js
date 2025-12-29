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

$(document).ready(() => {
  const $header = $(".header");
  const $intro = $(".intro");
  const $window = $(window);
  const $html = $("html");

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

  /* invoke by load */
  setHeaderOpacity();
});
