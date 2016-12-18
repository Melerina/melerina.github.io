jQuery(document).ready(function(){
    jQuery('.jwg_slider_module').jwgSlider('both','400');
    jQuery('.video-button').on('click', function(ev){
        jQuery('.activated_div').addClass("animated fadeOut");
        setTimeout(
            function()
            {
                jQuery('.deactivated_div').addClass("animated fadeIn");
            },1000);


        setTimeout(
            function()
            {
                jQuery('.activated_div').toggle();
                jQuery('.deactivated_div').toggle();
            },1000);

        setTimeout(
            function()
            {
                jQuery('#video')[0].src += "&autoplay=1";
                ev.preventDefault();
            },2500);

    });
});
