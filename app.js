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
var users = [];
var userData;
var facilitiesUsers = [];
var selectedUserData;
var usersTabSelectedFacility;
var apiKey = 'AIzaSyCQY8qYKRsLrDVKR4qpdm5AtqNmCrDnqTs';


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
  var usersFacilitiesListLocation = document.getElementById('users-facilities-list');

  // Creo una lista y añado un enlace por cada instalación.
  var list = document.createElement("ul");
  var clist = document.createElement("ul");
  var ulist = document.createElement("ul");
  facilitiesListLocation.innerHTML = "";
  collectionsFacilitiesListLocation.innerHTML = "";
  usersFacilitiesListLocation.innerHTML = "";
    for (var i = 0; i<l; i++ ) {
      var facility = facilities[i];
      var facilityID = facility.id;
      var facilityType = facility.title.split(".",1)[0];
      var facilityAddr = facility.address;
      var listItem = document.createElement("li");
      var clistItem = document.createElement("li");
      var ulistItem = document.createElement("li");
      listItem.innerHTML = "<a onclick='showFacilityInfo(" + facilityID + ")'>" +
      facilityType + ", " + facilityAddr["street-address"] + "</a>";

      clistItem.innerHTML = "<a class='draggable' id='"+ facilityID +
      "' onclick='addFacilityToCollection(" + facilityID + ")'>" + facilityType +
      ", " + facilityAddr["street-address"] + "</a>";

      ulistItem.innerHTML = "<a onclick='showFacilityInUsersTab(" + facilityID + ")'>" +
      facilityType + ", " + facilityAddr["street-address"] + "</a>";

      list.appendChild(listItem);
      clist.appendChild(clistItem);
      ulist.appendChild(ulistItem);
    }
  // Una vez terminadas pongo cada lista en su zona correspondiente
  facilitiesListLocation.appendChild(list);
  collectionsFacilitiesListLocation.appendChild(clist);
  usersFacilitiesListLocation.appendChild(ulist);
  // Hago que los enlaces de la lista de colecciones sean arrastrables
  $(".draggable").draggable({
    containment: "document",
    revert: true,
    helper:"clone",
  });
  // Habilito la zona que añadirá la instalación a la colección al soltarla.
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
  if (facilities === undefined){
    alert("Debe cargar la lista de aparcamientos para ejecutar esta operación");
    return null;
  }
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
  //console.log("Showing info about facility " + choosenFacility.title);
  getImages(lat,lng);
  var showCarousel = "<a id='showCarousel' href='#carousel-location' onclick='showCarousel()'>" +
  "<span class='glyphicon glyphicon-camera' aria-hidden='true'>" +
  "</span> Ver fotos</a>";
  $("#facility-info").append(showCarousel);
}

function getImages(lat, lng) {

  var myUrl = "https://commons.wikimedia.org/w/api.php?" +
  "format=json&action=query&generator=geosearch&ggsprimary=all&" +
  "ggsnamespace=6&ggsradius=1500&ggscoord=" + lat + "|" + lng +
  "&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200" +
  "&iiurlheight=200";

  //console.log("Getting images. Lat: " + lat + " long: " + lng);

  $.ajax({
   dataType: "jsonp",
   url: myUrl,
   type: 'GET',
   crossDomain: true,
   jsonpCallback:'imagesOk',
   success: function(jsondata) {
     console.log("JSONP query success");
     buildCarousel(jsondata);
   },
   error: function (error) {
     console.log("JSONP error: " + error);
   }
 });
}

function imagesOk(){
  console.log("Retrieving images...");
}

function buildCarousel(data){
  $("#facility-images").empty();
  //console.log("Changing images list");
  var elementActive = "<div class='item active'><img src='";
  var element = "<div class='item'><img src='";
  var divEnd = "'></div>";
  var picNum = 1;
  for (var i in data.query.pages) {
    for (var j in data.query.pages[i].imageinfo) {
      var imgurl = data.query.pages[i].imageinfo[j].url;
      if (picNum == 1) {
        $("#facility-images").append(elementActive + imgurl + divEnd);
      } else {
        $("#facility-images").append(element + imgurl + divEnd);
      }
      picNum++;
    }
  }
  $("#close-carousel").click(function() {
    $("#facility-carousel").hide(600, "linear");
  });
  $("#facility-carousel").carousel();
  console.log("Carousel built. That's all, folks!");
}

function showCarousel() {
  $("#facility-carousel").show(600, "linear");
}

function showFacilityInUsersTab(Id) {
  var choosenFacility = getFacilityById(Id);
  facilityInfo = document.getElementById('added-users');
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

  usersTabSelectedFacility = Id;
  showFacilityUsers(Id);
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

function setupGithub(action){
  if (github === undefined) {
    token = $("#token").val();
    github = new Github({
      token: token,
      auth: "oauth"
    });
  }
  getRepo(action);
}

function getRepo(action) {
  repoName = $("#repo").val();
  ghRepo = github.getRepo("damapin", repoName);
  if (action == "read") {
    readCollectionsFromGh();
  } else {
    writeCollectionsToGh();
  }
}

function readCollectionsFromGh() {
  ghRepo.read('master', 'resources/collections.json', function(err, data) {
     if (err){
       alert("Ha ocurrido un error al cargar las colecciones");
       console.log("load error: " + err);
       $("#ghForm").hide(600,"linear");
     }
     else{
       var parsedData = JSON.parse(data);
       collections = parsedData.items;
       $("#ghForm").hide(600,"linear");
       showCollections();
     }
  });
}

function writeCollectionsToGh() {
  var CollectionsList = {"items": collections};
  var CollectionsListTowrite = JSON.stringify(CollectionsList);
  ghRepo.write('master', './resources/collections.json',
		CollectionsListTowrite, "Colecciones actualizadas", function(err) {
      if (err) {
        alert("Ha ocurrido un error al guardar las colecciones");
        $("#ghForm").hide(600,"linear");
		    console.log (err);
      }
    });
  $("#ghForm").hide(600,"linear");
}

function loadCollections() {
  $("#ghForm").show(600,"linear");
  $("#doLoadCollections").show();
  $("#doStoreCollections").hide();
  $("#doLoadCollections").click(function(){
    setupGithub("read");
  });
}

function storeCollections(){
  //console.log("Saving collections");
  $("#ghForm").show(600,"linear");
  $("#doLoadCollections").hide();
  $("#doStoreCollections").show();
  $("#doStoreCollections").click(function(){
    setupGithub("write");
  });
}

// Mostrar la lista de colecciones.
function showCollections(){
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
}

function showCollectionInfo(name) {
  deleteActiveMarkers();
  selectedCollection = name;
  var collection = searchCollectionByName(name);
  if (collection.facilities !== []){
    // Vacío y escribo el nombre de la colección
    $("#selected-collection-info p").empty();
    $("#selected-collection-facilities").empty();
    $("#selected-collection-info p").append("<h4>" + name + "</h4>");
    $("#collection-added-facilities").empty();
    $("#collection-added-facilities").append("<h4>" + name + "</h4><br>");
    for (var i in collection.facilities) {
      $("#selected-collection-facilities").append("<a onclick='showFacilityInfo(" +
      collection.facilities[i].id + ")'>" + collection.facilities[i].title +
      "</a><br>");

      $("#collection-added-facilities").append(collection.facilities[i].title + "<br>");
      showFacilityInfo(collection.facilities[i].id);
    }
  }
}


// FUNCIONES RELATIVAS AL MANEJO DE LOS USUARIOS

// Conexión con el servidor de Id's de usuarios G+
function setupWebsocket(server,port){
  var usersList;
  try {

    var host = "ws://" + server + ":" + port + "/";
    console.log("Host:", host);

    var s = new WebSocket(host);

    // Al abrir la conexión se genera un elemento lista para añadirlo al DOM
    s.onopen = function (e) {
      console.log("Socket opened.");
      usersList = document.createElement("ul");
      $("#users-list").empty();
      $("#users-list").append(usersList);
      $("#added-users").droppable(
        {
          drop: function(event, ui){
            var id = ui.draggable.attr("id");
            addUserToFacility(id);
          }
        }
      );
    };

    s.onclose = function (e) {
      console.log("Socket closed.");
    };

    // Al recibir cada Id de usuario se comprueba que no esté ya en la lista y
    // se procesa en caso de que no lo esté.
    s.onmessage = function (e) {
      if (!userExists(e.data)) {
        users.push(e.data);
        fulfillUsersList(e.data, userData, usersList);
      }
    };

    s.onerror = function (e) {
      console.log("Socket error:", e);
    };

  } catch (ex) {
    console.log("Socket exception:", ex);
  }
}

// Comprobación de Id de usuario recibida
function userExists(userId) {
  for (var i = 0; i < users.length; i++) {
    if(users[i] == userId) return true;
  }
  return false;
}

// Adición de usuario a la colección seleccionada.
function addUserToFacility(userId) {
  if (usersTabSelectedFacility !== undefined){
    //var collection = searchCollectionByName(selectedCollection);
    retrieveUserData(userId, selectedUserData);
  }
  else{
    alert("Debe seleccionar un aparcamiento para añadir usuarios");
  }
}

// Extracción de datos de usuario a partir de su id en G+.
function retrieveUserData(userId,  userData) {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': userId
      });
    request.execute(function(resp) {
      userData = {
        "id": userId,
        "imgSrc": resp.image.url,
        "name": resp.displayName
      };
      //console.log("Retrieving info about " + userData.name);
      var facilityUsers = {
        id : usersTabSelectedFacility,
        users : []
      };
      //console.log("Facilities and users associations: " + JSON.stringify(facilitiesUsers));
      if (facilitiesUsers === undefined) {
        facilityUsers.users.push(userData);
        facilitiesUsers.push(facilityUsers);
        //console.log("(1)Facilities and users associations after adding user: " + JSON.stringify(facilitiesUsers));
        return;
      }
      else {
        for (var i in facilitiesUsers) {
          if (facilitiesUsers[i].id == usersTabSelectedFacility) {
            facilitiesUsers[i].users.push(userData);
            //console.log("(2)Facilities and users associations after adding user: " + JSON.stringify(facilitiesUsers));
            return;
          }
        }
        facilityUsers.users.push(userData);
        facilitiesUsers.push(facilityUsers);
        //console.log("(3)Facilities and users associations after adding user: " + JSON.stringify(facilitiesUsers));
      }
      showFacilityInUsersTab(usersTabSelectedFacility);
    });
  });
}

function showFacilityUsers(Id) {
  for (var i in facilitiesUsers) {
    console.log("Searching for facility " + Id);
    if (facilitiesUsers[i].id == Id) {
      console.log("facility found");
      return;
    }
  }

}

function handleClientLoad(){
  console.log("Setting up API key: " + apiKey);
  gapi.client.setApiKey(apiKey);
  console.log("done");
}

function fulfillUsersList(userId, usrData, list) {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.people.get({
      'userId': userId
      });
    request.execute(function(resp) {
      //console.log("Response: " + JSON.stringify(resp));
      usrData = {
        "imgSrc": resp.image.url,
        "name": resp.displayName
      };
      var newUser = document.createElement("li");
      newUser.innerHTML = "<a class='draggable' id='"+ userId + "'>" +
      "<img src='" + usrData.imgSrc + "'/><span>" + usrData.name +
      "</span></a>";
      list.appendChild(newUser);
      $("#users-list .draggable").draggable({
          containment: "document",
          revert: true,
          helper:"clone",
        }
      );
    });
  });
}

$(document).ready(function() {

  $("#collections-btn").hide();
  $("#users-btn").hide();
  $("#facility-carousel").hide();

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
    $("#collections-btn").show(300,"linear");
    $("#users-btn").show(300,"linear");
  });

  $('#loadCollections').click(function () {
    loadCollections();
  });

  $('#storeCollections').click(function () {
    storeCollections();
  });

  $('#collectionNameInput').click(function(){
    this.value = "";
  });

  $('#createCollection').click(function(){
    var name = $('#collectionNameInput').val();
    createCollection(name);
  });

  setupWebsocket("localhost","12345");

  initMap();
});
