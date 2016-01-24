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
    var limit = 100;
    var data = [];
    var headers = {};
    var a = $(".download");
    a.addClass("hide");
    var status = $(".status");
    status.removeClass("hide");
    Promise.resolve(0).then(function loop(skip) {
      return new Promise(function(resolve, reject) {
        Data.limit(limit)
          .skip(skip)
          .order('createDate', true)
          .fetchAll()
          .then(function(ary) {
            ary.forEach(function(item) {
              var new_item = {};
              $.each(item, function(i, v) {
                if (i === "className" || i === "acl")
                  return true;
                if (typeof v == "function")
                  return true;
                headers[i] = true;
                if (typeof v == "object" && v.__type == "GeoPoint") {
                  new_item[i] = v.longitude + "," + v.latitude;
                  return true;
                }
                if (typeof v == "object" && v.__type == "Date") {
                  new_item[i] = v.iso;
                  return true;
                }
                
                new_item[i] = v;
              });
              data.push(new_item);
            });
            status.text(data.length + "件取得しました");
            if (ary.length > 0) {
              skip += limit;
              return loop(skip);
            }
            return resolve(data);
          });
      }).then(function() {
        data.forEach(function(rows, i) {
          $.each(headers, function(name) {
            if (typeof rows[name] === 'undefined')
              rows[name] = "";
          });
          data[i] = rows;
        });
        var blob = new Blob([new CSV(data, { header: true }).encode()]);
        var url = window.URL || window.webkitURL;
        var blobURL = url.createObjectURL(blob);
        a.attr("download", classname + ".csv");
        a.attr("href",blobURL);
        a.removeClass("hide");
        status.text("").addClass("hide");
      });
    });
  });
  
  $(".key").on("change", function(e) {
    localStorage.setItem($(e.target).attr("id"), $(e.target).val());
  });
});
