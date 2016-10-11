var jsonItems = {
  items:[
    { id: 0, data: 'item 0'},
    { id: 1, data: 'item 1'},
    { id: 2, data: 'item 2'},
    { id: 3, data: 'item 3'},
  ]
}

UI = {};

Class(UI, 'ColorPicker').inherits(Widget).includes(BubblingSupport)({
  elementClass: 'colorpicker__container',
  html: `<div>
    <h4 class="title"></h4>
    <div class="input-group">
      <input placeholder="Select a color" class="form-control" type="text">
      <span class="input-group-btn">
        <button class="btn btn-default">Ok</button>
      </span>
    </div>
    <div class="selections--list"></div>
    <select multiple data-selected-text-format="count" data-width="147px" class="selectpicker">
    </select>
  </div>`,
  prototype: {
    $addBtn: null,
    $colorpicker: null,
    $selections: null,

    init: function init(config){
      Widget.prototype.init.call(this, config);

      var that = this;
      this.element.find('h4').text(config.title || 'Color Picker');
      this.$colorpicker = this.element.find('input');
      this.$span = this.element.find('span');
      this.$addBtn = this.element.find('span > button');
      this.$selections = this.element.find('.selections--list')
      this.$select = this.element.find('select');
      this.$span.hide();
      $(this.$colorpicker).colorpicker();
      var colorpicker = this.$colorpicker;
      $(this.$colorpicker).on('changeColor', function(event){
        console.log("Color: ", $(colorpicker).colorpicker('getValue'));
        that.$span.show();
      });
      if (!config.multiselect) {
        this.$select.remove();
        this.$addBtn.on('click', this.addColor.bind(this));
      } else {
        this.$selections.remove();
        $(this.$select).selectpicker();
        this.$label = this.element.find('.bootstrap-select button .filter-option');
        this.$inner = this.element.find('.bootstrap-select');
        this.$inner.hide();
        this.$addBtn.on('click', function(event){
          var option, content, color = $(that.$colorpicker).colorpicker('getValue');
          content = "<div style='background-color:"+color+";width:90%;height:18px;'></div>"
          option = $('<option data-content="' + content + '" value="'+color+'"></option>');
          that.$select.append(option);
          that.$select.selectpicker('refresh');
          that.$inner.show();
          that.$span.hide();
          that.$colorpicker.val(null);
          that.$select.selectpicker('selectAll');

          if (that.getValues().length >= 5) {
            that.hideStuff();
          }
        });
        $(this.$select).on('change', function(event){
          var options = $(event.target.options);
          options.each(function (index, option) {
            if (!option.selected) {
              option.remove();
            }
          });
          console.log(that.$label[0].innerHTML = that.$select.selectpicker('val').length + " selected");
          if (that.getValues().length - 1 < 5) {
            that.showStuff();
          }
          that.$select.selectpicker('refresh');
        });
      }
      return this;
    },
    addColor: function addColor(event){
      event.preventDefault();
      var that = this;
      this.$span.hide();
      this.appendChild(new UI.ColorThumbnail({
        name: 'thumbnail',
        color: $(this.$colorpicker).colorpicker('getValue'),
        id: this.children.length + 1
      })).render(this.$selections).bind('click', function(event){
        if (that.children.length - 1 < 5){
          that.showStuff();
        }
      });

      this.$colorpicker.val(null);

      if (this.children.length >= 5) {
        this.hideStuff();
      }
      return this;
    },

    hideStuff: function hideStuff(){
      this.$colorpicker.hide();
      return this;
    },

    showStuff: function showStuff(){
      this.$colorpicker.show();
      this.$span.hide();
      return this;
    },

    getValues: function getValues(){
      if (this.multiselect){
        return this.$select.selectpicker('val');
      } else {
        return this.children.map(function(child){
          return child.color
        });
      }
    }
  }
});

Class(UI, 'ColorThumbnail').inherits(Widget).includes(BubblingSupport)({
  elementClass: 'color__thumbnail',
  html: '<div></div>',
  prototype: {
    $item: null,
    init: function init(config){
      Widget.prototype.init.call(this, config);
      this.element.css('display', 'block');
      this.element.bind('click', this.clickHandler.bind(this));
      var that = this;
      this.element.mouseover(function(){
        that.element.css('opacity', '0.7');
      });
      this.element.mouseout(function(){
        that.element.css('opacity', '1');
      });
      this.changeColor(config.color || 'white');
    },
    clickHandler: function clickHandler(event) {
      event.preventDefault();
      console.log("CLICK", this.name, this.id);
      this.dispatch('click');
      this.destroy();
      return this;
    },
    changeColor : function changeColor(color){
      this.element.css('background', color);
      return this;
    }
  }
});

Class(UI, 'Select').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS: 'sidebar__filter-container multiselect',
    HTML: `<header>
              <h4 class='title'></h4>
              <select data-width="147px" data-selected-text-format="count" class="selectpicker">
                <option style="display:none" disabled selected hidden>Nothing selected</option>
              </select>
          </header>`,
    prototype: {
      title: null,
      $select: null,
      $inner: null,
      $items: null,
      $label: null,
      selectedValues: {},
      init: function(config){
          Widget.prototype.init.call(this, config);
          this.title = this.element.find('h4');
          this.$select = this.element.find('select');
          this._configure(config);
          this.$select.selectpicker();
          this.selectedValues[config.name] = config.multiple ? [] : null;
          this.$inner = this.element.find('.dropdown-menu.inner');
          this.$items = this.$inner.find('> li');
          this.$label = this.element.find('.bootstrap-select button .filter-option');
          var multiselect = this;
          this.element.addClass(config.name);
          this.$select.bind('change', function(event){
            event.preventDefault();
            if (multiselect.selectedValues[multiselect.name].constructor === Array) {
              if (multiselect.selectedValues[multiselect.name].length > 0) {
                multiselect.$label[0].innerHTML = multiselect.selectedValues[multiselect.name].length + ' selected';
              } else {
                multiselect.$label[0].innerHTML = 'Nothing selected';
              }
            }
          });
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
        return this.selectedValues[this.name];
      },
      _addToSelectedItems: function _addToSelectedItems(item){
        if (Object.prototype.toString.call( this.selectedValues[this.name] ) === '[object Array]'){
          this.selectedValues[this.name].push(item);
        } else {
          this.selectedValues[this.name] = item;
        }
        return this;
      },
      _removeFromSelectedItems: function _removeFromSelectedItems(item){
        if (Object.prototype.toString.call( this.selectedValues[this.name] ) === '[object Array]'){
          var index = this.selectedValues[this.name].indexOf(item);
          this.selectedValues[this.name].splice(index, 1);
        } else {
          this.selectedValues[this.name] = null;
        }
        return this;
      },
      _bindEvents: function _bindEvents(){
        var Widget = this;
        this.$inner.on("click", this._itemClickHandler.bind(this));
        return this;
      },
      _itemClickHandler: function _itemClickHandler(e){
        var value;
        console.log(e.target.nodeName, e.target);
        switch (e.target.nodeName){
          case "A":
            value = $(e.target).find('span').text()
          break;
          case "I":
            value = $(e.target.parentNode).text()
          break;
          case "IMG":
            value = $(e.target.parentNode).text()
          break;
          case "SPAN":
            value = $(e.target).text();
          break;
          case "P":
            value = $(e.target).text();
          break;
          case "STRONG":
            value = $(e.target).text();
          break;
        }
        if (Object.prototype.toString.call( this.selectedValues[this.name] ) === '[object Array]'){
          if(this.selectedValues[this.name].indexOf(value) === -1){
            this._addToSelectedItems(value);
          }
          else{
            this._removeFromSelectedItems(value);
          }
        } else {
          this._removeFromSelectedItems(value);
          this._addToSelectedItems(value);
        }
        this.dispatch('change');
        console.log(value, this.selectedValues[this.name]);
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
        items.forEach(function(item){
          var content, option;
          if (!item.color){
            content = "<span><img class='img-responsive' style='width:48px; margin:0 auto; margin-top:3px' src='"+item.image+"'><p style='display:none;'>"+item.name+"</p></span>"
            option = $('<option class="options" title="'+item.name+'" data-content="' + content + '" value="'+item.name+'"></option>');
          } else {
            content = "<span><p style='color:"+item.color+";text-align:center;'><strong>"+item.name+"</strong></p></span>"
            option = $('<option class="options" title="'+item.name+'" data-content="' + content + '" value="'+item.color+'"></option>');
          }
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
      }
    }
});

var colorpicker = new UI.ColorPicker({
  name: 'colorpicker'
});
colorpicker.render($(document.body));

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
//
// sidebar.bind("change", function(ev){
//   suggestionsList.activateAboveButton();
// });

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

// var suggestionsList = new UI.SuggestionsList();
// suggestionsList.render($(document.body));
//

Class(UI, 'Parent').inherits(Widget).includes(BubblingSupport)({
  HTML: '<div><h1>hey!</h1></div>',
  prototype:{
    init: function init(config) {
      Widget.prototype.init.call(this, config);

      this.appendChild(new UI.Child({ name: 'child1' }))
        .render(this.element);

      this.appendChild(new UI.Child({ name: 'child2' }))
        .render(this.element);

      this.appendChild(new UI.Child({ name: 'child3' }))
        .render(this.element);

      this.bind('click', function(event){
        console.log(event);
      });


    }
  }
});

Class(UI, 'Child').inherits(Widget).includes(BubblingSupport)({
  HTML: '<div><h4>KHEE!</h4></div>',
  prototype: {
    init: function init(config){
      Widget.prototype.init.call(this);
      var child = this;
      this.element.on('click', function(evt){
        console.log(evt);
        child.dispatch('click', { data: 'asdas' });
      });
    }
  }
});

var parent = new UI.Parent({name:"parent"});
parent.render($(document.body));
