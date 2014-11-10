/**
 *
 * jQuery ajax Image Upload plugin
 * version 0.1 alpha
 * Require jQuery 2.1 or later
 * Copyright (c) 2014. Raccoon
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 */

+function($){
    "use strict";
    $.fn.ajaxImageUpload = function(options){
        if(options && options.url && options.success) {
            return this.each(function () {
                $(this).on('change', function () {
                    var fd = new FormData();
                    fd.append('image', this.files[0]);
                    $.ajax({
                        url: options.url,
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            options.success(data);
                        }
                    });
                });
            });
        }else{
            throw new Error("");
        }
    };
}(jQuery);