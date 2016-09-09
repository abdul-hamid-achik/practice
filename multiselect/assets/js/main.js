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
          this.loadItems(jsonItems.items);
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
      },
      _removeFromSelectedItems: function _removeFromSelectedItems(item){
        var index = this.selectedValues.indexOf(item);
        this.selectedValues.splice(index, 1);
      },
      _bindEvents: function _bindEvents(){
        var Widget = this;
        this.$inner.on("click", this._itemClickHandler.bind(this));
        this.$select.on("change", function(){
          Widget.dispatch("change");
        });
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
      // render: function render(){
      //   $('.selectpicker').selectpicker();
      // },
      _refresh: function _refresh(){
          this.$select.selectpicker('refresh');
      },
      _activate: function () {
        console.log("activated");
        Widget.prototype._activate.call(this);
      },
      _deactivate: function () {
        console.log("deactivate");
        Widget.prototype._deactivate.call(this);
      }
    }
});

Class(UI, 'Sidebar').inherits(Widget)({
  HTML: '<aside></aside>',
  prototype: {
    filters: [],
    init: function(config){
      Widget.prototype.init.call(this);
      var sidebar = this;
      this.filters.push(
        new UI.Select({ multiple: true, title: 'filter 1' })
      );
      this.filters.push(
        new UI.Select({ multiple: false, title: 'filter 2' })
      );
      this.filters.forEach(function(filter){
        filter.render(sidebar.element);
        $(filter.element).on("change", function(ev){
          console.log(ev.target, filter.getSelectedItems());
        });
      });
    }
  }
});

var sidebar = new UI.Sidebar();
sidebar.render($(document.body));
//
// $(document.body).addClass('container');
// var a = new UI.Select({ multiple: true, title: "diget" });
// a.render($(document.body));
//
//
// var b = new UI.Select({ multiple: false });
// b.render($(document.body));
//
//
// var c = new UI.Select({ multiple: true, title: "widget 4" });
// c.render($(document.body));
// c.clearItemsList();
// c.loadItems([{ id: 0, data: "blabla" }]);
