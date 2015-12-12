$(function() {
  $("#applicationkey").val(localStorage.getItem("applicationkey"));
  $("#clientkey").val(localStorage.getItem("clientkey"));
  
  $(".export").on("click", function(e) {
    var application_key = $("#applicationkey").val();
    var client_key      = $("#clientkey").val();
    var ncmb = new NCMB(application_key, client_key);
    e.preventDefault();
    var classname = $("#classname").val();
    var Data = ncmb.DataStore(classname);
    var exist = true;
    var skip  = 0;
    var limit = 10;
    var data = [];
    var a = $(".download");
    a.addClass("hide");
    Promise.resolve(0).then(function loop(skip) {
      return new Promise(function(resolve, reject) {
        Data.limit(limit)
          .skip(skip)
          .fetchAll()
          .then(function(ary) {
            ary.forEach(function(item) {
              var new_item = {};
              $.each(item, function(i, v) {
                if (i == "className")
                  return true;
                if (typeof v == "object" || typeof v == "function")
                  return true;
                new_item[i] = v;
              });
              data.push(new_item);
            });
            if (ary.length > 0) {
              skip += limit;
              return loop(skip);
            }
            return resolve(data);
          });
      }).then(function() {
        var blob = new Blob([new CSV(data, { header: true }).encode()]);
        var url = window.URL || window.webkitURL;
        var blobURL = url.createObjectURL(blob);
        a.attr("download", classname + ".csv");
        a.attr("href",blobURL);
        a.removeClass("hide");
      });
    });
  });
  
  $(".key").on("change", function(e) {
    localStorage.setItem($(e.target).attr("id"), $(e.target).val());
  });
});