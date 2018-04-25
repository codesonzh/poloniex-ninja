function Promo() {}

Promo.prototype.fetchPromoDiv = function() {
  return new Promise(function(resolve, reject){
    $.get(chrome.extension.getURL('html/promo.html'), function(html) {
      return resolve($(html));
    });
  });
}
