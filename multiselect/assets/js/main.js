var jsonItems = {
  items:[
    { id: 0, data: 'item 0'},
    { id: 1, data: 'item 1'},
    { id: 2, data: 'item 2'},
    { id: 3, data: 'item 3'},
  ]
}

UI = {};

Class(UI, 'Select').inherits(Widget).includes(CustomEventSupport)({
    elementClass: 'bs-select-widget',
    ELEMENT_CLASS: 'dropdown',
    HTML: `<div>
            <h4></h4>
            <select class="selectpicker"></select>
          </div>`,
    prototype: {
      title: null,
      $select: null,
      $inner: null,
      $items: null,
      selectedValues: [],
      init: function(config){
          Widget.prototype.init.call(this, config);
          // option to set the multiselect to multiple or to single
          this.title = this.element.find('h4');
          this.$select = this.element.find('select');
          this._configure(config);
          this.$select.selectpicker();
          this.$inner = this.element.find('.dropdown-menu.inner');
          this.$items = this.$inner.find('> li');
          this._bindEvents();

      },
      _configure: function _configure(config){
        if (config.multiple){
          this.$select.prop('multiple', config.multiple);
        }
        if (config.title){
          this.title.text(config.title);
        }

        this._refresh();
      },
      getSelectedItems: function getSelectedItems(){
        // return this.$items.filter('.selected');
        return this.selectedValues;
      },
      _addToSelectedItems: function _addToSelectedItems(item){
        this.selectedValues.push(item);
        this.dispatch('change');
        return this;
      },
      _removeFromSelectedItems: function _removeFromSelectedItems(item){
        var index = this.selectedValues.indexOf(item);
        this.selectedValues.splice(index, 1);
        this.dispatch('change');
        return this;
      },
      _bindEvents: function _bindEvents(){
        var Widget = this;
        this.$inner.on("click", this._itemClickHandler.bind(this));
        return this;
      },
      _itemClickHandler: function _itemClickHandler(e){
        var value = $(e.target).text();
        if(this.selectedValues.indexOf(value) == -1){
          this._addToSelectedItems(value);
        }
        else{
          this._removeFromSelectedItems(value);
        }
        return this;
      },
      clearItemsList: function clearItemsList(){
        $.each(this.$select.find('option'), function(index, value){
          value.remove();
        });
        this._refresh();
        return this;
      },
      loadItems: function loadItems(items){
        var select = this.$select;
        // before render load items
        items.forEach(function(item){
            // each option has to have a click option??
          var content = "<span><img src='http://placehold.it/24x24'> "+item.data+"</span>"
          var option = $('<option class="ms-options" id="ms-bs-'+item.id+'" data-content="'+
          content +'" value="'+item.id+'"></option>');
          select.append(option);
        });
        this._refresh();
        return this;
      },
      unselectAll: function unselectAll(){
        this.$select.selectpicker('unselectAll');
      },
      _refresh: function _refresh(){
          this.$select.selectpicker('refresh');
      },
      _activate: function () {
        Widget.prototype._activate.call(this);
      },
      _deactivate: function () {
        Widget.prototype._deactivate.call(this);
      }
    }
});

Class(UI, 'Sidebar').inherits(Widget).includes(CustomEventSupport)({
  HTML: '<aside></aside>',
  ELEMENT_CLASS: 'sidebar',
  prototype: {
    filters: [],
    init: function(config){
      Widget.prototype.init.call(this, config);
      var sidebar = this;

      // loadFilter
      sidebar.loadFilter(new UI.Select({ multiple: true, title: 'filter 1' }), "/url");
      sidebar.loadFilter(new UI.Select({ multiple: false, title: 'filter 2' }), "/url2");
    },
    loadFilter: function loadFilter(filter, url){
      var widget = this;
      widget.filters.push(filter);
      filter.loadItems(jsonItems.items);
      filter.render(widget.element);
      // $.get(url, function(data){
      //   filter.loadItems(data.items);
      //   filter.render(widget.element);
      // });
      filter.bind("change", function(ev){
        console.log("changed", filter.getSelectedItems());
        widget.changed();
      });
      return widget;
    },
    _bindEvents: function _bindEvents(){
      var sidebar = this;
      sidebar.filters.forEach(function(filter){
        filter.loadItems(jsonItems.items);
        filter.render(sidebar.element);
      });
    },
    _changed: function _changed(){
      // later
    },
    changed: function changed(){
        this._changed();
        this.dispatch('change');
    }
  }
});

var sidebar = new UI.Sidebar();
sidebar.render($(document.body));

sidebar.bind("change", function(ev){
  suggestionsList.activateAboveButton();
});

Class(UI, 'SuggestionsList').inherits(Widget).includes(CustomEventSupport)({
  HTML: `<section style="display:inline-block">
    <div>
      <button>Get more suggestions</button>
    </div>
    <div class="suggestions"></div>
  </section>`,
  elementClass: 'suggestions-component',
  ELEMENT_CLASS: 'suggestions-component',
  prototype: {
    suggestions: [],
    listElement: null,
    aboveButtonElement: null,
    belowButtonElement: null,
    init: function init(config){
      Widget.prototype.init.call(this, config);
      var _this = this;
      // test data
      // watchout with "url" the request to url /api/v1/jobs
      // returns an image not an url with the image
      // as a result of research its ok to create an url with the blob file
      // and then revoke this reference when its no longer needed

      var suggestions = [
        { id: 0, url: 'http://placehold.it/640x480?text=suggestion+1'},
        { id: 1, url: 'http://placehold.it/640x480?text=suggestion+2'},
        { id: 2, url: 'http://placehold.it/640x480?text=suggestion+3'},
        { id: 3, url: 'http://placehold.it/640x480?text=suggestion+4'},
        { id: 4, url: 'http://placehold.it/640x480?text=suggestion+5'}
      ]

      this.listElement = this.element.find('.suggestions');
      this.aboveButtonElement = this.element.find('div > button');
      this.deactivateAboveButton();

      //render suggestions elements
      this.loadSuggestions(suggestions);
      //last element of the list
      // console.log(this._getLastSuggestion());

      // this.belowButtonElement = this.aboveButtonElement.clone();
      this._getLastSuggestion().element
            .append(this.aboveButtonElement.clone().attr('disabled', false));
      this.belowButtonElement = this.listElement.find('button');
    },

    loadSuggestions: function loadSuggestions(suggestionsList){
      var _this = this;
      suggestionsList.forEach(function(suggestion){
        var hold = new UI.Suggestion({
          id: suggestion.id,
          data: suggestion.data
        });

        hold.render(_this.listElement);
        hold.bind('clicked', function(evt){
            // dispatch clicked suggestion instance? it doesnt work then get id
          _this.dispatch('click:suggestion', { data: { suggestionID: evt.data } });
        });
        _this.suggestions.push(hold);
      });
      return _this;
    },
    unloadSuggestions: function unloadSuggestions(){
      this.suggestions.forEach(function(suggestion){
        suggestion.destroy();
      });
      return this;
    },
    _getLastSuggestion: function _getLastSuggestion(){
      return this.suggestions[this.suggestions.length - 1];
    },
    activateAboveButton: function activateAboveButton(){
      this.aboveButtonElement.attr('disabled', false);
    },
    deactivateAboveButton: function deactivateAboveButton(){
      this.aboveButtonElement.attr('disabled', true);
    },
    getSuggestionByID: function getSuggestionByID(id){
      return this.suggestions.filter(function(suggestion){
        if(id == suggestion.getID()){
          return suggestion;
        }
      });
    }
  }
});

Class(UI, 'Suggestion').inherits(Widget).includes(CustomEventSupport)({
  HTML: `<div>
    <canvas></canvas>
  </div>`,
  ELEMENT_CLASS: 'suggestion',
  elementClass: 'suggestion',
  prototype: {
    id: null,
    data: null,
    init: function init(config){
        Widget.prototype.init.call(this, config);
        this.id = config.id;
        this.data = config.data;
        this.canvas = this.element.find('canvas');
        this.loadImage(this.data);
        this._bindEvents();
    },
    loadImage: function loadImage(image){
      var blob = new Blob([image], {type: 'image/png'});
      var url = URL.createObjectURL(blob);
      var img = new Image;
      img.onload = function() {
          var ctx = this.canvas.getContext('2d');
          ctx.drawImage(this, 0, 0);
          URL.revokeObjectURL(url);
      }
      // this.img.src = url;

      return this;
    },
    _bindEvents: function _bindEvents(){
      this.element.on('click', this._clickHandler.bind(this));
      return this;
    },
    _clickHandler: function _clickHandler(evt){
      var suggestion = this;
      suggestion.dispatch("clicked", { data: { suggestionID: suggestion.getID() } }); // please dont do this abdul
      return this;
    },
    getID: function getID(){
      return this.id;
    }
  }
});

var suggestionsList = new UI.SuggestionsList();
suggestionsList.render($(document.body));

// send id to placeit
// suggestionsList.bind('click:suggestion', function(evt){
// });

// Class(UI, 'Button').inherits(Widget)({
//   HTML: `<div>
//     <button><button>
//   </div>`,
//   elementClass: 'button-widget',
//   prototype: {
//     init: function init(config){
//
//     }
//   }
// });
