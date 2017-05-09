var facilities;

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

function showFacilities(){
  var l = facilities.length;
  var facilitiesListLocation = document.getElementById('facilities-list');
  var list = document.createElement("ul");
  facilitiesListLocation.innerHTML = "";
    for (var i = 0; i<l; i++ ) {
      var facility = facilities[i];
      var facilityID = facility.id;
      var facilityType = facility.title.split(".",1)[0];
      var facilityAddr = facility.address;
      var listItem = document.createElement("li");
      listItem.innerHTML = "<a onclick='chooseFacility(" + facilityID + ")'>" + facilityType + ", " + facilityAddr["street-address"] + "</a>";
      list.appendChild(listItem);
    }
  facilitiesListLocation.appendChild(list);
}

function initMap(){
  mymap = L.map('facilities-map').setView([40.416826, -3.703535], 16);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
}

function chooseFacility(id){
  var choosenFacility;
  var l = facilities.length;
  for (var i = 0; i < l; i++) {
    if (facilities[i].id == id || facilities[l-i] == id) {
      choosenFacility = facilities[i];
      facilityInfo = document.getElementById('facility-info');
      facilityInfo.innerHTML = "";
      console.log("Aparcamiento con id: " + id + " localizado");
      var title = document.createElement("p");
      title.appendChild(document.createTextNode(choosenFacility.title));
      facilityInfo.appendChild(title);
      var address = document.createElement("p");
      address.appendChild(document.createTextNode("Dirección: " + choosenFacility.address["street-address"]));
      facilityInfo.appendChild(address);
    }
  }
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
