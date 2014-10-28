

//*****************************************************************************
// Services
// https://docs.angularjs.org/api/ngResource/service/$resource

var btsServices = angular.module('bts.services', ['ngResource']);

btsServices.factory('TaxonomySvc', ['$resource',
  function($resource){
    return $resource('http://api.behindthesite.com/v1/taxonomy/');
  }]);

btsServices.factory('StackSvc', ['$resource',
  function($resource){
    return $resource('http://api.behindthesite.com/v1/stacks/');
  }]);

//*****************************************************************************
// Directives
// https://docs.angularjs.org/guide/directive

var btsDirectives = angular.module('bts.directives', []);

btsDirectives.directive('affix', function($templateCache) {
  console.log('affix')
    return function(scope, element, attrs) {
      var ele = angular.element(element);

      scope.affix_widths = [];

      ele.affix({
        offset: {
          top: function() { 
            return  $('#main').offset().top;
          }
        }
      })

      ele.on('affix.bs.affix', function (e) {
        console.log('affix.prior');

        var ths = ele.find('th');
        ths.each(function(i) { 
          scope.affix_widths[i] = $(this).width();
        })

      });

      ele.on('affixed.bs.affix', function (e) {
        console.log('affix.post');
        var ths = ele.find('th');
        ths.each(function(i) {
          $(this).width(scope.affix_widths[i]);
          //console.log(scope.affix_widths[i])
        })
      });

    };
  });

btsDirectives.directive('itemDisplayed', function($templateCache, $compile) {
  console.log('itemDisplayed')
    return function(scope, element, attrs) {
//    console.log(attrs);
      var ele = angular.element(element);
      var span = ele.find('span');

      var tmpl = $templateCache.get('productHoverTmpl.html')
      scope.website = attrs.website;
      scope.twitter = attrs.twitter;
      scope.irc = attrs.irc;
      scope.blogs = attrs.blogs;
      scope.description = attrs.description;
      scope.repo = attrs.repo;
      scope.issues = attrs.issues;
      scope.docs = attrs.docs;
      scope.category = attrs.category;
      scope.categorypath = attrs.categorypath;
      scope.notes = attrs.notes;
      // https://docs.angularjs.org/api/ng/service/$compile
      var contentHtml = $compile($templateCache.get('productHoverContentTmpl.html'))(scope);

      var popupConfig = {
        html: true,
        title: attrs.title,
        content: contentHtml,
        placement: 'top',
        template: tmpl,
        trigger: 'manual'
      };

      span.data('state', 'hover');
      span.popover(popupConfig);
      span.on('mouseenter', function (e) { 
        if (span.data('state') === 'hover') {
          span.popover('show');
        }
      });
      span.on('mouseleave', function (e) { 
        if (span.data('state') === 'hover') {
          span.popover('hide');
        }
      });
      span.on('click', function (e) { 
        if (span.data('state') === 'hover') {
            span.data('state', 'pinned');
        } else {
            span.data('state', 'hover');
            span.popover('hide');
        }
      });

      ele.on('shown.bs.popover', function () {
        ele.find('.close-btn').click( function () {
          span.data('state', 'hover');
          span.popover('hide');
        });        
      });

    };
  });

//*****************************************************************************
// filters
// https://docs.angularjs.org/guide/filter

var btsFilters = angular.module('bts.filters', []);

btsFilters.filter('ws', function () {
    return function (input) {
      if (input) {
        return input.toLowerCase().replace(/[^a-z_]/g, '_');
      }
    };
  });

btsFilters.filter('nocraigslist', function() {
  return function(input) {
    var output = [];
    if(input) {
      for(var i in input) {
        if(input[i].name != 'Craigslist Website' ) {
          output.push(input[i]);
        }
      }
    }
    return output;
  };
});

//*****************************************************************************
// Controllers
// https://docs.angularjs.org/api/ng/directive/ngController

var btsControllers = angular.module('bts.controllers', []);

btsControllers.controller('MainCtrl', MainCtrl);

function MainCtrl($scope, TaxonomySvc, StackSvc) {

  var vm = this;
  vm.headers = [];
  vm.products = [];

  vm.getTaxonomyIds = function (taxonomy) {
    var ids = [];
    ids.push( taxonomy.id );
    for( var i in taxonomy.children ) {
      var c = taxonomy.children[i];
      ids = ids.concat( vm.getTaxonomyIds(c) );
    }
    return ids;
  }

  vm.findHeaderIndex = function (tier) {
    var id = tier.category.id;
//    console.log('Searching for: ' + id + ' ' + typeof(id) );
    for(var i in vm.headers) {
//      console.log('In: ' + vm.headers[i].ids);
      var index = $.inArray(id, vm.headers[i].ids);
      if(index > -1) {
        return i;
      }
    }
    return -1;
  }

  TaxonomySvc.get(function(res) {
      var taxonomy = res.taxonomy;
      console.log('Taxonomy: ' + taxonomy.length  );
      for(var index in taxonomy) {
        var t = taxonomy[index];
        var h = { name: t.name }
        h.ids = vm.getTaxonomyIds( t );
//        console.log( h.name + ', ' + h.ids);
        vm.headers.push( h )
      }

      StackSvc.get(function(res) {
          var products = res.products;
          console.log('Products: ' + products.length  );
          for(var index in products) {
            var product = products[index];
            var model = { name: product.name };
            model.company = product.company;
            model.tiers = [];
            for(var header in vm.headers) {
              model.tiers[header] = [];
              model.tiers[header].name = vm.headers[header].name;
            }
            var tiers = product.stack.tiers;
            for(var tier in tiers) {
              var index = vm.findHeaderIndex( tiers[tier] )
    //          console.log('index: ' + index);
    //          console.log(tiers[tier].product);
              model.tiers[index].push( tiers[tier] )
            }
    //        console.log( i.name );
    //        console.log( i.tiers );
            vm.products.push( model )
          } 

        // https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$broadcast downward
        // https://docs.angularjs.org/api/ng/type/$rootScope.Scope#emit upward
        //  $scope.$emit('MainCtrl.completed');    
        //  $scope.$broadcast('MainCtrl.completed');
        });

    });

}