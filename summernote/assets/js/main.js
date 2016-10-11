Class(UI, 'CaptionWidget').inherits(Widget)({
    elementClass: "caption",
    html : `<div>
        <div id="summernote" class="editor"></div>
        <input class="editor-input form-control" type="text" name="" placeholder="Enter some text...">
    </div>`,
    prototype : {
        editorElement : null,
        inputElement : null,
        wysiwygWrapper: null,
        uploadBtn : null,
        headingButton: null,
        toolbar:null,
        value : '',
        init : function (config) {
          if(!config){
            config = {};
          }
          Widget.prototype.init.call(this, config);
          this.element.css('display', 'inline-block');
            var sSCaption = this;
            this.wysiwygWrapper = this.element.find('> .editor');
            this.inputElement = this.element.find('> .editor-input');
            this.uploadBtn = $('.btn-group.stage-actions > .stage-upload-image-container');
            this.statusBar = null;
            this.wysiwygWrapper.summernote({
                toolbar : [
                  ['style', ['bolding', 'heading']],
                  ['actions', ['save', 'exit']]
                ],
                buttons: {
                  bolding: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                      contents: 'B',
                      click: function () {
                        context.invoke('editor.bold');
                        if ($(this).hasClass('active')) {
                          $(this).removeClass('active');
                          context.invoke('editor.removeFormat');
                        } else {
                          $(this).addClass('active');
                        }
                      }
                    });
                    return button.render();
                  },
                  heading: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                      contents: 'H',
                      click: function () {
                        var range = context.invoke('editor.createRange');
                          if (range.toString()) {
                            var heading = document.createElement('h4');
                            $(heading).text(range.toString());
                            context.invoke('editor.insertNode', heading);
                          } else {
                            context.invoke('editor.formatH4');
                          }
                      }
                    });
                    sSCaption.headingButton = button.render();
                    return sSCaption.headingButton;
                  },
                  save: function (context) {
                    var ui = $.summernote.ui;
                    var button = ui.button({
                      contents: 'SAVE',
                      click: function () {
                        sSCaption.deactivate();
                        var text = context.invoke('code');
                        if (text.replace(/<\/?[^>]+(>|$)/g, "")) {
                          sSCaption.setValue(text);
                          sSCaption.dispatch('change');
                        } else {
                          console.warn("Empty text");
                        }
                      }
                    });
                    return button.render();
                  },
                  exit: function(context){
                    var ui = $.summernote.ui;
                    var button = ui.button({
                      contents: 'X',
                      click: function (){
                        sSCaption.deactivate();
                      }
                    });
                    return button.render();
                  }
                },
                callbacks:{
                  onInit: function(){
                      sSCaption.statusBar = sSCaption.element.find('.note-statusbar');
                      sSCaption.editorElement = sSCaption.element.find('> .note-editor');
                      sSCaption.editorElement.hide();
                      sSCaption.statusBar.hide();
                      sSCaption.wysiwygWrapper.summernote('removeModule', 'autoLink');

                      $('.note-editor [data-event="insertUnorderedList"]').tooltip('disable');
                      $('.note-btn.btn.btn-default.btn-sm').attr('data-original-title','');
                  },
                  onChange: function (data) {
                    sSCaption.setValue(data);
                    sSCaption.enableHeadingButton();
                    $(data).each(function(index, element) {
                      if(element.nodeName == "H4" && !sSCaption.headingButton.prop('disabled') &&
                        element.innerHTML !== '<br>'){
                        sSCaption.disableHeadingButton();
                      }
                    });
                  }
                }
            });

            this.setValue(config.value || '');
            this.inputElement.bind('focus', function() {
                sSCaption.activate();
            });
        },
        disableHeadingButton : function disableHeadingButton() {
          this.headingButton.prop('disabled', true);
          return this;
        },
        enableHeadingButton : function enableHeadingButton() {
          this.headingButton.prop('disabled', false);
          return this;
        },
        setValue : function setValue(value) {
            this.value = value;
            this.inputElement.val(value.replace(/<\/?[^>]+(>|$)/g, " "));
            return this;
        },
        getValue : function getValue() {
            return this.value;
        },
        activate : function activate() {
            this.inputElement.hide();
            this.editorElement.show();
            this.wysiwygWrapper.summernote('focus');
            Widget.prototype.activate.call(this);
        },
        deactivate : function deactivate() {
            this.inputElement.show();
            this.inputElement.css('width', $(this.editorElement).css('width'));
            this.editorElement.hide();
            this.setValue(this.wysiwygWrapper.summernote('code').replace(/<\/?[^>]+(>|$)/g, " "));
            Widget.prototype.deactivate.call(this);
        }
    }
});
