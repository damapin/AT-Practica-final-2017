var facilities;

function showFacilities(){
  var l = facilities.length;
  var list = document.getElementById('facilities-list');
  list.innerHTML = "";
    for (var i = 0; i<l; i++ ) {
      var facility = facilities[i];
      var facilityType = facility.title.split(".",1)[0];
      var facilityAddr = facility.address;
      var listItem = document.createElement("a");
      listItem.appendChild(document.createTextNode(facilityType + ", " + facilityAddr["street-address"]));
      list.appendChild(listItem);
      list.appendChild(document.createElement("br"));
    }
}

function loadFacilities(url){
  $.ajax({
    dataType: "json",
    url: url,
    success: function(data){
      facilities = data["@graph"];
    }
  }).done(function(){
    showFacilities();
  });
}

function initMap(){
  mymap = L.map('facilities-map').setView([40.416826, -3.703535], 16);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
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

  initMap();
});
