var facilities;

function showFacilities(){
  var l = facilities["@graph"].length;
  var list = document.getElementById('facilities-list');
  list.innerHTML = "";
    for (var i = 0; i<l; i++ ) {
      //console.log(facilities["@graph"][i].id + " : " + facilities["@graph"][i].title);
      var facility = document.createElement("a");
      facility.appendChild(document.createTextNode(facilities["@graph"][i].title));
      list.appendChild(facility);
      list.appendChild(document.createElement("br"));
    }
}

function loadFacilities(url){
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data){
      facilities = data;
    }
  }).done(function(){
    showFacilities();
  });
}

$(document).ready(function() {

  $("#main-tab").show(600,"linear");
  $("#collections").hide();
  $("#users").hide();

  $("#main-tab-btn").click(function() {
    $("#main-tab").show(600,"linear");
    $("#collections").hide(500,"linear");
    $("#users").hide(500,"linear");
  });

  $("#init").click(function() {
    $("#main-tab").show(600,"linear");
    $("#collections").hide(500,"linear");
    $("#users").hide(500,"linear");
  });

  $("#collections-btn").click(function() {
    $("#collections").show(600,"linear");
    $("#main-tab").hide(500,"linear");
    $("#users").hide(500,"linear");

  });

  $("#users-btn").click(function() {
    $("#users").show(600,"linear");
    $("#collections").hide(500,"linear");
    $("#main-tab").hide(500,"linear");
  });

  $('#load_facilities').click(function(){
    loadFacilities("resources/facilities.json");
  });
});
