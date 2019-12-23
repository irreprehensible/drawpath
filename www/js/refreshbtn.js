(function ( $ ) {
    $.fn.refreshbtn = function (options) {
        var defaults = {
            width: 32,
            height: 32
        }
        options = $.extend(defaults, options);
        // var w = options.width;
        // var h = options.height;
        // if (Number(window.innerWidth) < 768) {
        //     w = w - 8;
        //     h = h - 8;
        //     $(this).html('<div id="btnReset" style="width:' + w + 'px;height:' + h + 'px;margin-bottom:52px" title="reset location"><div id="blRing" ><div id="wRing" class="plus" ></div></div></div>');
        // }
        // else {
            $(this).html('<div id="btnReset" style="width:' + w + 'px;height:' + h + 'px" title="reset location"><div id="blRing" ><div id="wRing" class="plus" ></div></div></div>');
        // }
        
        // $('#btnReset').click(function () {
            
        // });
    }
}(jQuery));
