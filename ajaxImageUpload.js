/**
 *
 * jQuery ajax Image Upload plugin
 * version 0.3 alpha
 * Require jQuery 2.1 or later
 * Copyright (c) 2014. Raccoon
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 */

+function($){
    "use strict";

    var requestCounter = 0;
    var finishedCounter = 0;

    /**
     * 自動將 hidden欄位轉換為file 上傳欄位
     * 增加 Preview 圖與 選擇檔案的按鈕
     * @param options
     */
    $.fn.ajaxImageUploadGenerater = function(options){
        this.each(function(){
            var $field = $(this);
            var $spec_id = $field[0].id;
            var $generateHTML = '' +
                '<button id="'+ $spec_id +'_fake_button" class="ui tiny button">' +
                '   選擇檔案' +
                '   <i class="ui icon file"></i>' +
                '</button>' +
                '<input type="file" id="'+ $spec_id +'_file_field" />' +
                '<div class="preview" id="'+ $spec_id +'_preview" >' +
                '   <div class="ui striped progress"><div class="bar"></div></div>' +
                '   <div class="img"><img src="/images/default_100.jpg" /></div>' +
                '</div>';
            $field.after($generateHTML);

            var $preview_progress = $("#" + $spec_id + "_preview .progress");
            var $preview_progressBar = $("#" + $spec_id + "_preview .progress .bar");
            var $preview_imgContainer = $("#" + $spec_id + "_preview .img");
            var $preview_img = $("#" + $spec_id + "_preview img");
            var $file_input_field = $("#" + $spec_id + "_file_field");
            var $fake_button = $("#" + $spec_id + "_fake_button");

            if(options.defaultImage ){
                $preview_img.attr('src' , options.defaultImage);
            }

            if($field.val() != ""){
                $preview_img.attr('src' , '/upload/s_' + $field.val());
            }

            var $ajaxEvent = {
                success:function(data){
                    $field.val(data.filename);
                    $preview_progress.hide();
                    $preview_img.attr('src', data.thumb);
                    $preview_imgContainer.show();
                    $preview_progressBar.css('width' , '0%');
                },
                error:function(jqXHR){
                    // some trick to clean file field content
                    $file_input_field.replaceWith($file_input_field.val('').clone(true));

                    if(jqXHR.status === 413){
                        alert("上傳檔案過大！");
                    }else{
                        alert("上傳錯誤，請稍候再試");
                    }
                    $preview_imgContainer.show();
                    $preview_progress.hide();
                },
                progress:function(data){
                    $preview_imgContainer.hide();
                    $preview_progress.show();
                    $preview_progressBar.css('width' , data + '%');
                }
            };

            $preview_progress.hide();
            $file_input_field.hide();
            $fake_button.on('click' , function(e){
                e.preventDefault();
                $file_input_field.click();
            });

            $file_input_field.ajaxImageUpload($.extend($ajaxEvent , options));

        })
    };

    /**
     * 使用XMLHttpRequest進行圖片上傳
     * @param options
     * @returns {*}
     */
    $.fn.ajaxImageUpload = function(options){
        if(options && options.url && options.success) {
            return this.each(function () {
                var that = $(this);
                $(this).on('change', function () {

                    var file = this.files[0];

                    if(options.max_size){
                        if(options.max_size < file.size){
                            alert("檔案大小限制" + Math.round(options.max_size /1024/1024) + "M，請縮小檔案的大小！");
                            return false;
                        }
                    }
                    var fd = new FormData();
                    fd.append('image', this.files[0]);
                    if(options.size){
                        fd.append('width' , options.size[0]);
                        fd.append('height' , options.size[1]);
                    }
                    if(options.crop){
                        fd.append('crop' , options.crop);
                    }
                    requestCounter++;
                    $.ajax({
                        xhr: function(){
                            var xhr = new XMLHttpRequest();
                            xhr.upload.addEventListener('progress' , function(event){
                                if(event.lengthComputable){
                                    var persentage = (event.loaded / event.total) * 100;
                                    options.progress.apply(that , [persentage]);
                                }
                            }, false);
                            return xhr;
                        },
                        url: options.url,
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            options.success(data);
                        },
                        error:function(){
                            if(options.error){
                                options.error.apply(that , arguments);
                            }
                        }
                    }).done(function(){
                        finishedCounter++;
                    });
                });
            });
        }else{
            throw new Error("Options Error!");
        }
    };

    // 可以判斷目前是否還有圖片尚未上傳完成
    $.fn.ajaxImageUpload.isDone = function(){
        if(requestCounter == 0){
            return true;
        }
        return (requestCounter == finishedCounter);
    }
}(jQuery);