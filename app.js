// Variables globales.
var facilities;
var facilitiesMap;
var collections = [];
var selectedCollection;
var marker;
var activeMarkers = [];
var github;
var token;
var repoName;
var ghRepo;


// FUNCIONES RELATIVAS AL MAPA DE INSTALACIONES.

// Inicialización del mapa sobre la Puerta del Sol de Madrid.
function initMap(){
  facilitiesMap = L.map('facilities-map').setView([40.416826, -3.703535], 16);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(facilitiesMap);
}

// Centrado del mapa sobre la instalación seleccionada
function centerMap (lat, lng, facility, collection){
  var location = new L.LatLng(lat, lng);
  facilitiesMap.panTo(location);

  // Añado marcador y globo de texto

  // Marcador personalizado
  var myIcon = L.icon({
      iconUrl: 'images/purple_marker.png',
      iconSize:     [45, 50], // size of the icon
      iconAnchor:   [22, 55], // point of the icon which will correspond to marker's location
      popupAnchor:  [0, -43] // point from which the popup should open relative to the iconAnchor
  });

  marker = new L.marker(location, {icon: myIcon}).addTo(facilitiesMap);
  var popup = L.popup();
  popup
    .setLatLng(location)
    .setContent("<img src='./images/psignal.png' height='35px' width='35px'>" +
      " " + facility.title + "<br><a style='margin-left: 39px' onclick='deleteMarker(" +
      facility.id + ")'> Borrar este marcador</a>");
  marker.bindPopup(popup).openPopup();

  // Si se hace click sobre un marcador se centrará el mapa sobre él y se mostrará el popup
  marker.on('click', function(e){
    showFacilityInfo(facility.id);
  });

  // Añado el marcador al array de marcadores activos
  addMarker(facility.id,marker);
}

// Función para añadir el marcador al array de marcadores activos
function addMarker(id,marker){
  var l = activeMarkers.length;
  var markerToAdd = {
    "id":id,
    "marker":marker
  };
  if (l === 0) {
    activeMarkers.push(markerToAdd);
    return;
  }
  else {
    var markerExists = false;
    var index = 0;
    while (!markerExists && index < l){
      if (activeMarkers[index].id == id){
        markerExists = true;
      }
      else{
        index++;
      }
    }
    if (markerExists) {
      return;
    }
    else{
      activeMarkers.push(markerToAdd);
      return;
    }
  }
}

//TODO: Estas dos funciones no borran marcadores del mapa

// Función para borrar un marcador activo del array y del mapa.
function deleteMarker(id) {

    for (var i = 0; i < activeMarkers.length; i++) {
      if (activeMarkers[i].id === id.toString()) {
        activeMarkers[i].marker.remove();
        console.log("marcador de instalación " + id + " borrado");
        return;
      }
    }
}

// Borrado de todos los marcadores activos
function deleteActiveMarkers(){
  if (activeMarkers.length === 0) {
    return;
  }
  else {
    for (var i = activeMarkers.length-1; i >-1; i--) {
      activeMarkers[i].marker.remove();
    }
    activeMarkers = [];
  }
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
function showFacilities(){
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

      clistItem.innerHTML = "<a class='draggable' id='"+ facilityID +
      "' onclick='addFacilityToCollection(" + facilityID + ")'>" + facilityType +
      ", " + facilityAddr["street-address"] + "</a>";

      list.appendChild(listItem);
      clist.appendChild(clistItem);
    }
  facilitiesListLocation.appendChild(list);
  collectionsFacilitiesListLocation.appendChild(clist);
  $(".draggable").draggable({
    containment: "document",
    revert: true,
    helper:"clone",
  });
  $("#collection-added-facilities").droppable(
    {
      drop: function(event, ui){
        var id = ui.draggable.attr("id");
        addFacilityToCollection(id);
      }
    }
  );
}

// Localización de la instalación por su ID
function getFacilityById(id){
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
  var choosenFacility = getFacilityById(id);
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
function addFacilityToCollection(facilityID){

  if (selectedCollection !== undefined) {
    var facility = getFacilityById(facilityID);
    var i = 0;
    while (collections[i].name !== selectedCollection) {
      i++;
    }
    collections[i].facilities.push(facility);
    showCollectionInfo(collections[i].name);
    return;
  }
  else{
    alert("Seleccione una colección para añadir un aparcamiento");
  }

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

function getToken(){
  token = $("#token").val();
  console.log (token);
  github = new Github({
    token: token,
    auth: "oauth"
  });
  getRepo();
}

function getRepo() {
  repoName = $("#repo").val();
  console.log(repoName);
  ghRepo = github.getRepo("damapin", repoName);
  console.log("ghRepo is: " + ghRepo + "\nReading file...");
  readGhFile();
}

function readGhFile() {
  // ghRepo.read('master', 'resources/collections.json')
  // .done(function(data) {
  //   console.log("SUCCESS!!: ghRepo is: " +ghRepo);
  //   var collectionsJSON = data;
  //   console.log(collectionsJSON);
  //   console.log("loaded. Hiding form");
  //   $("#ghForm").hide(600,"linear");
  // })
  // .fail(function(err) {
  //   console.log("FAIL!! ghRepo is: " + ghRepo);
  //   alert("Ha ocurrido un error al cargar las colecciones");
  //   console.log("load error: " + err);
  // });
  //console.log("In readGhFile. ghRepo.read is: " + ghRepo.read);
  ghRepo.read('master', 'collections.json', function(err, data) {
     if (err){
       console.log(ghRepo.read);
       alert("Ha ocurrido un error al cargar las colecciones");
       console.log("load error: " + err);
     }
     else{
       console.log(data);
       var collectionsJSON = data;
       console.log(collectionsJSON);
       console.log("loaded. Hiding form");
       $("#ghForm").hide(600,"linear");
     }
  });
}

function loadCollections() {
  console.log("in loadCollections...");
  $("#ghForm").show(600,"linear");
  $("#doLoadCollections").click(function(){
    getToken();
  });
}

// Mostrar la lista de colecciones.
function showCollections(){
  //var collectionsListDiv = document.getElementById("collection-list");
  //collectionsListDiv.innerHTML = "";
  $(".collection-list").empty();
  var list = document.createElement("ul");
  var l = collections.length;
  for (var i = 0; i<l; i++) {
    var listItem = document.createElement("li");
    var nameArg = '"' + collections[i].name + '"';
    listItem.innerHTML = "<a onclick='showCollectionInfo(" + nameArg + ")'>" + collections[i].name + "</a>";
    list.appendChild(listItem);
  }
  $(".collection-list").html(list.innerHTML);
  //collectionsListDiv.appendChild(list);
}

function showCollectionInfo(name) {
  deleteActiveMarkers();
  selectedCollection = name;
  var collection = searchCollectionByName(name);
  if (collection.facilities !== []){
    // Vacío y escribo el nombre de la colección
    $("#selected-collection-facilities").empty();
    $("#selected-collection-facilities").append("<h4>" + name + "</h4><br>");
    $("#collection-added-facilities").empty();
    $("#collection-added-facilities").append("<h4>" + name + "</h4><br>");
    $("#collection-added-users").empty();
    $("#collection-added-users").append("<h4>" + name + "</h4><br>");
    for (var i in collection.facilities) {
      $("#selected-collection-facilities").append("<a onclick='showFacilityInfo(" +
      collection.facilities[i].id + ")'>" + collection.facilities[i].title +
      "</a><br>");

      $("#collection-added-facilities").append(collection.facilities[i].title + "<br>");
      showFacilityInfo(collection.facilities[i].id);
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

  $("#ghForm").hide();

  $('#load_facilities').click(function(){
    loadFacilities("resources/facilities.json");
  });

  $('#loadCollections').click(function () {
    loadCollections();
  });

  $('#collectionNameInput').click(function(){
    this.value = "";
  });

  $('#createCollection').click(function(){
    var name = $('#collectionNameInput').val();
    createCollection(name);
  });

  initMap();
});
