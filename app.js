// Variables globales.
var facilities;
var facilitiesMap;
var collections = [];

// FUNCIONES RELATIVAS AL MAPA DE INSTALACIONES.
// Inicialización del mapa sobre la Puerta del Sol de Madrid.
function initMap(){
  facilitiesMap = L.map('facilities-map').setView([40.416826, -3.703535], 16);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(facilitiesMap);
}

// Centrado del mapa sobre la instalación seleccionada
function centerMap (lat, lng, facility){
  var location = new L.LatLng(lat, lng);
  facilitiesMap.panTo(location);
  // Añado marcador y globo de texto
  var marker = L.marker(location).addTo(facilitiesMap);
  var popup = L.popup();
    popup
      .setLatLng(location)
      .setContent("<img src='images/psignal.jpg' height='35px' width='35px'>" + " " + facility.title)
      .openOn(facilitiesMap);
  // Si se hace click sobre un marcador se centrará el mapa sobre él y se mostrará el popup
  marker.on('click', function(e){
    showFacilityInfo(facility.id);
  });
}

// FUNCIONES RELATIVAS AL MANEJO DE INSTALACIONES.
// Carga de las instalaciones desde el archivo json.
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

// Llenado de la lista de instalaciones
function showFacilities(callback){
  var l = facilities.length;
  var facilitiesListLocation = document.getElementById('facilities-list');
  var collectionsFacilitiesListLocation = document.getElementById('collections-facilities-list');
  // Creo una lista y añado un enlace por cada instalación.
  var list = document.createElement("ul");
  var clist = document.createElement("ul");
  facilitiesListLocation.innerHTML = "";
  collectionsFacilitiesListLocation.innerHTML = "";
    for (var i = 0; i<l; i++ ) {
      var facility = facilities[i];
      var facilityID = facility.id;
      var facilityType = facility.title.split(".",1)[0];
      var facilityAddr = facility.address;
      var listItem = document.createElement("li");
      var clistItem = document.createElement("li");

      listItem.innerHTML = "<a onclick='showFacilityInfo(" + facilityID + ")'>" +
      facilityType + ", " + facilityAddr["street-address"] + "</a>";

      clistItem.innerHTML = "<a class='ui-widget-content draggable-anchor' "+
      "onclick='addToCollection(" + facilityID + ")' " +
      "ondrop='addToCollection(" + facilityID + ")'>" + facilityType + ", " +
      facilityAddr["street-address"] + "</a>";

      list.appendChild(listItem);
      clist.appendChild(clistItem);
    }
  facilitiesListLocation.appendChild(list);
  collectionsFacilitiesListLocation.appendChild(clist);
  $( ".draggable-anchor" ).draggable();
}

// Localización de la instalación por su ID
function searchFacility(id){
  var l = facilities.length;
  for (var i = 0; i < l; i++) {
    if (facilities[i].id == id || facilities[l-i] == id) {
      return facilities[i];
    }
  }
  return null;
}

// Exposición de la información sobre la instalación seleccionada
function showFacilityInfo(id){
  var choosenFacility = searchFacility(id);
  facilityInfo = document.getElementById('facility-info');
  facilityInfo.innerHTML = "";
  // Añado tipo de aparcamiento.
  var title = document.createElement("p");
  title.appendChild(document.createTextNode(choosenFacility.title));
  facilityInfo.appendChild(title);
  // Añado dirección.
  var address = document.createElement("p");
  address.appendChild(document.createTextNode("Dirección: " + choosenFacility.address["street-address"] + ". "));
  address.appendChild(document.createTextNode(choosenFacility.address["postal-code"] + ". " + choosenFacility.address.locality));
  facilityInfo.appendChild(address);
  // Añado información adicional de plazas, accesibilidad, etc.
  var info = document.createElement("p");
  info.appendChild(document.createTextNode(choosenFacility.organization["organization-desc"]));
  facilityInfo.appendChild(info);
  // Centro el mapa sobre la instalación seleccionada.
  var lat = choosenFacility.location.latitude;
  var lng = choosenFacility.location.longitude;
  centerMap(lat,lng,choosenFacility);
}

// FUNCIONES RELATIVAS AL MANEJO DE COLECCIONES.

// Crear colección
function createCollection(name){
  var newCollection = {
    "name": name,
    "facilities": []
  };
  collections.push(newCollection);
  showCollections();
}

// Añadir una instalación a una colección
function addToCollection(collectionName, facility){
  // TODO: crear funcionalidad
  console.log("Funcionalidad de añadir a colección aún no implementada");
}

// Buscar una colección por su nombre
function searchCollectionByName(name){
  var l = collections.length;
  for (var i = 0; i < l; i++) {
    if (collections[i].name == name || collections[l-i] == name) {
      return collections[i];
    }
  }
  return null;
}

// Mostrar la lista de colecciones.
function showCollections(){
  var collectionsListDiv = document.getElementById("collection-list");
  collectionsListDiv.innerHTML = "";
  var list = document.createElement("ul");
  var l = collections.length;
  for (var i = 0; i<l; i++) {
    var listItem = document.createElement("li");
    var nameArg = '"' + collections[i].name + '"';
    listItem.innerHTML = "<a onclick='showCollectionInfo(" + nameArg + ")'>" + collections[i].name + "</a>";
    list.appendChild(listItem);
  }
  collectionsListDiv.appendChild(list);
}

function showCollectionInfo(name) {
  var collection = searchCollectionByName(name);
  console.log("Nombre" + collection.name);
  console.log("Instalaciones: " + collection.facilities);
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

  $('#collectionName').click(function(){
    this.value = "";
  });

  $('#createCollection').click(function(){
    var name = $('#collectionName').val();
    createCollection(name);
  });

  initMap();
});
