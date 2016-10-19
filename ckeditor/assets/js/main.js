// (function () {

  $('#cke_input').on('focus', function (event) {
    event.preventDefault();
    $('#cke_ckeditor').show();
    $('#cke_input').hide();
  })
  // Your custom style.
  var headerStyle = new CKEDITOR.style( {
      element: 'span',
      attributes: {
          'class': 'heading-title'
      },
      styles: {
        'font-size': '26px'
      }
  } );



  CKEDITOR.replace('ckeditor', {
    on: {
          // Register command and button along with other plugins.
          pluginsLoaded: function() {
              var editor = this;
              // Registers a command that applies the style.
              // Note: it automatically adds Advanced Content Filter rules.
              this.addCommand( 'headerStyle', new CKEDITOR.styleCommand( headerStyle ) );
              editor.attachStyleStateChange( headerStyle, function( state ) {
                  !editor.readOnly && editor.getCommand( 'headerStyle' ).setState( state );
              } );
              // Add toolbar button for this command.
              this.ui.addButton && this.ui.addButton( 'headingButton', {
                  label: 'H',
                  command: 'headerStyle',
                  toolbar: 'basicstyles,0',
                  // You may want to set some icon here.
                  // icon: 'icon',
                  click: function(e){
                    if (!headerStyle.checkActive(editor.elementPath(), editor)) {
                      editor.applyStyle(headerStyle);
                    } else {
                      editor.removeStyle(headerStyle);
                    }
                  }
              } );

              this.ui.addButton && this.ui.addButton('saveButton', {
                label: 'SAVE',
                command: 'hideEditor',
                toolbar: 'actions,0',
                click: function(event){
                  $('#cke_ckeditor').hide();
                  $('#cke_input').show();
                  $('#cke_input').val(editor.getData()
                  .replace(/<p>/, '')
                  .replace(/<\/p>/, '')
                  .replace(/<strong>/, '')
                  .replace(/<\/strong>/, ''))
                }
              });

          },
          instanceReady: function() {
            $('#cke_ckeditor').hide();
          }
        }
    } );
// })();
