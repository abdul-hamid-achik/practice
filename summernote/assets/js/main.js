$(document).ready(function() {
  caption.render();
});

var options = {
  el: $('#summernote')
}
var CaptionWidget = function(options){
  var el = options.el;
  var render = function(){
    $('#summernote').summernote({
      toolbar: [
        ['mybutton',['save']],
        ['style', ['bold', 'hello']
        ]
      ],
      buttons: {
        hello : headingButton,
        save : SaveButton
      },
      height: 175,
      width: 400,
      disableResizeEditor:true,
      callbacks: {
        onInit: function(){
          $('.note-resizebar').hide();
          $('.note-editor').hide();
        }
      },
    });

    addtxt();
  };


  return {
    render:render
  };
};

function bFocus(){
    $('#stateA').hide();
    $('.note-editor').show();
    addtxt();
};

function b(){
    $('#stateA').show();
    $('.note-editor').hide();
    addtxt();
}

function addtxt(){
  $('#stateA').val($('.note-editable').text())
}

var headingButton = function (context) {
  var ui = $.summernote.ui;
  var button = ui.button({
    contents: '<i class="glyphicon glyphicon-header"/>',
    tooltip: 'heading',
    click: function () {
        $('#summernote').summernote('formatH4');
    }
  });

  return button.render();
};

var SaveButton = function (context) {
  var ui = $.summernote.ui;
  var button = ui.button({
    contents: 'SAVE <i class="glyphicon glyphicon-save"/>',
    tooltip: 'save',
    click: function () {
      b();
    }
  });

  return button.render();
}


UI = {};
Class(UI, 'Widget').includes(CustomEventSupport)({
    HTML : '<div></div>',
    prototype : {
        init : function() {
        },
        render : function() {
            CaptionWidget(options).render()
        },
        clickSave: function(eventHandler){
          this.dispatch('call-clickSave', { callback: eventHandler });
        }
    }
});
var caption = new UI.Widget();
// caption.bind('call-clickSave', function(ev){
//   ev.callback();
//
// });
