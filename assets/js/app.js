function toggleClassOnComponenetPassed({ target, className, component, container }) {
    const componentHeight = component.outerHeight();
    const scrollTop = container.scrollTop();
    const componentBottom = component.offset().top + componentHeight;
    target.toggleClass(className, scrollTop > componentBottom);
}

$(document).ready(() => {
    const $header = $('.header');
    const $intro = $('.intro');
    const $window = $(window);

    /* set header dark after section intro */
    const setHeaderOpacity = () => toggleClassOnComponenetPassed(
        { target: $header, className: "header--dark", component: $intro, container: $window });

    const throttledSetHeaderOpacity = $.throttle(250, setHeaderOpacity);

    $window.on('scroll resize', throttledSetHeaderOpacity);

    /* invoke by load */
    setHeaderOpacity();
});