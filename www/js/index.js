//global map var
var map;
var settings; //settings file
const appVersion = '2.5.41';
var firstUse=false;
var firstLoad=false;
var markers = [];
var fired = false;
var exitBit = false;
var multiLoad= false;
var urlLoc='';
var mnuItems = [
                {"name":"Settings","icon":"fa fa-cog fa-lg","fun":"showSettings()"},
                {"name":"Users","icon":"fa fa-user fa-2x","fun":"ShowSignIn()"},
                {"name":"Compass","icon":"fa fa-compass fa-3x","fun":"setScreenForCompass()"},
                {"name":"Verse","icon":"fa fa-bookmark-o fa-4x","fun":"showAyah()"},
                {"name":"Help","icon":"fa fa-question-circle-o","fun":"showHelp()"},
                {"name":"Share","icon":"fa fa-share","fun":"shareApp()"}
            ];
var watch_value = 0;
var latC;
var lonC;
var latQ;
var lonQ;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
   
    onDeviceReady: function() {
        if(!map)
        {
            if(screen.orientation.type.indexOf('portrait')>-1)
            {
                screen.orientation.lock('portrait');
            }
            if(screen.orientation.type.indexOf('portrait')==-1)
            {
                screen.orientation.lock('portrait');
                setTimeout(function(){
                },800);
            }
        }
        checkState(3000);
        cordova.plugins.diagnostic.registerLocationStateChangeHandler(function (state) {
           // console.log("Location state changed to: " + state);
            checkState(3000);
        }, function (error) {
            console.error("Error registering for location state changes: " + error);
        });
        $('#btnLocRequest').click(function(){
            requestLocation();
        })
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);
    },
}//app

function onOnline(){
    $('#divOffline').hide();  
    //hidealerts();
    checkState(3000); 
}
function onOffline(){
    $('#divOffline').show();
}
function checkState(delay){
    var networkState = navigator.connection.type;
    if(networkState == Connection.NONE)
        {
            $('#splashText').html('location available<br>Network unavailable<br>Please enable wifi or data services on your device...');
            $('#divOffline').show();
            window.plugins.toast.showWithOptions(
            {
              message: "This application need internet to function,\n please check your Network",
              duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
              position: "center",
            });
        }
        else
        {
            $('#splashText').html('location available<br>Network available,<br>Loading map...');   
            $('#divOffline').hide();
            if(fired && $('#hidCurrentLocation').val().length > 1)
            {
                var ltln = JSON.parse($('#hidCurrentLocation').val());
                buttons(false);
                hidealerts();
                getmasjids(ltln.lat, ltln.lng);
            }
        }
        //location check
        cordova.plugins.diagnostic.isLocationAvailable(function(available){
            if(available){
                $('#splashText').html('Getting location<br>Loading map...');
                if(!fired){
                    var posOptions = { timeout: 35000, enableHighAccuracy: true, maximumAge: 5000 };
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var lt = position.coords.latitude;
                        var ln = position.coords.longitude;
                        //to set the location on startup then declare as below
                        // lt = 21.16980812743961; // mysuru
                        // ln = 79.0795353478851;
                        // lt = 52.4533811; //Birmingham UK
                        // ln = -1.9281113;
                        if($('#splash').is(':visible'))
                            $('#splash').hide();
                        $('#dvMap').css('height', $(document).height() + 'px');
                        var mapDiv = document.getElementById("dvMap");
                        var loc = new plugin.google.maps.LatLng(lt,ln);
                        $('#hidCurrentLocation').val(JSON.stringify(loc));
                        $('#hidInitialLocation').val(JSON.stringify(loc));
                        map = plugin.google.maps.Map.getMap(mapDiv, {
                            'camera': {
                            'latLng': loc,
                            'zoom': 13
                            }
                        });
                        //showDebug('getting settings');
                        // getSettings(function(res){
                        //     if(!res){
                        //         $('#hidNotifications').val(1);
                        //         $('#hidMaslak').val(0);
                        //         $('#calcMethodVal').val(2);
                        //         $('#hidRadius').val(2000);
                        //         $('#hidLimit').val(20);
                        //         $('#hidAppVersion').val(appVersion);
                        //     }
                        //     //hideDebug();
                        // }); //reads settings from file, if not there, creates thwm with initial oes and loads into hidden fields
                        // firstLoad=true;
                        getLocShowMap(lt, ln);
                        
                    }, function (err) {
                        //console.error("Position error: code="+ err.code + "; message=" + err.message);
                        $('#splashText').html("Error getting your Position error\ncode="+ err.code + "\nmessage=" + err.message);
                    }, posOptions);
                    fired=true;
                }
            }   
            else{
                //loction is off
                $('#splashText').html('The location could not be initialized<br>Please start Location services on your device');
                // window.plugins.toast.showWithOptions(
                //     {
                //     message: "This application needs your current location,\n please enable your location",
                //     duration: "5000", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                //     position: "center",
                //     });
                setTimeout(function(){
                    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
                        switch(status){
                            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                                //alert(status);
                                break;
                            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                                //console.log("Permission granted");
                                cordova.plugins.diagnostic.switchToLocationSettings();
                                break;
                            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                                //alert(status);
                                break;
                            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                                //alert(status);
                                break;
                        }
                        if(status!=cordova.plugins.diagnostic.permissionStatus.GRANTED){
                            cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
                                switch(status){
                                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                                        //alert(status);
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                                        //console.log("Permission granted");
                                        checkState(3000);
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.DENIED:
                                        $('#btnLocDiv').show();
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                                        $('#btnLocDiv').show();
                                        break;
                                }
                            }, function(error){
                                $('#splashText').html('The location could not be initialized<br>Please start Location services on your device');
                            });
                        }
                        else{
                            $('#splashText').html('The location could not be initialized<br>Please start Location services on your device');
                        }
                    }, function(error){
                        $('#splashText').html('The location could not be initialized<br>Please start Location services on your device');
                    });
                
                },1000)
            }
        }, function(error){
            $('#splashText').html('The location could not be initialized<br>Please start Location services on your device: '+error.message);
        });

        
}
function requestLocation(){
    //showAlert('request');
    cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
        //showAlert(status);
        switch(status){
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                //console.log("Permission not requested");
                break;
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                //console.log("Permission granted");
                checkState(3000);
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                $('#btnLocDiv').show();
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                $('#btnLocDiv').show();
                break;
        }
    }, function(error){
        console.error(error);
    });
}

function getLocShowMap(lt, ln){
    var loc = new plugin.google.maps.LatLng(lt,ln);
    map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
        map.addMarker({
        'position': loc,
        'draggable': false,
        'icon':'./img/pin.png'
        }, function(marker) {
            //allow drag
            // marker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function(mloc) {
            //     map.setCameraTarget(mloc);
            //     $('#hidCurrentLocation').val(JSON.stringify(mloc));
            //     multiLoad=false;
            //     getmasjids(mloc.lat, mloc.lng);
            // });
        });
       // getmasjids(lt, ln);
    });
    //unlock portrait screen
    screen.orientation.unlock();
}


function showAlert(msg, delay) {
    $('#loader').hide();
    $('#alertMsg').addClass('alert alert-masjid fade in')
    $('#alertMsg').prop('style', 'position: absolute; z-index: 9999;left:30%;top:30%');
    if(delay){
            $('#alertMsg').html(msg);
            $('#alertMsg').delay(delay).fadeOut();
    }
    else{
        $('#alertMsg').html('<a class="close" onclick=$("#alertMsg").html("").hide()>&times;</a>'+msg);
    }
}
function showDebug(msg) {

    $('#debugLoader').html(msg);
    $('#debugLoader').show();
}
function hideDebug(){
    $('#debugLoader').fadeOut('slow');
}
function hidealerts(){
    $('#loader').hide();
    $("#alertMsg").html("").hide()
}