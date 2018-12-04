import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, ToastController, NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthService } from '../../providers/auth.api';
import { DeliveryService } from '../../providers/delivery.api';
import { DatePicker } from '@ionic-native/date-picker';
import { tileLayer, latLng, marker, icon, polyline, Map } from 'leaflet';
import { DeviceSocket } from '../../providers/devicesocket.service';
import { Geolocation } from '@ionic-native/geolocation';
import { VehicleService } from '../../providers/vehicle.api';

declare var google:any;
import {
    GoogleMaps,
    GoogleMap,
    LatLng
} from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-request-delivery',
  templateUrl: 'request-delivery.html',
  providers: [AuthService, DeliveryService, VehicleService, DeviceSocket]
})
export class RequestDeliveryPage {
    deliveryObj: any = {
        custom: {}
    };
    user: any = {};
    currentPage = 1;
    selectedTime: any;
    selectedDate: any;
    selectedPickup: any;
    selectedDestination: any;
    isSaving: Boolean = false;
    placesService:any;
    geocoder: any;
    length: Number;
    width: Number;
    height: Number;

    map: GoogleMap;

    lat: any;
    lng: any;
    markers: any = [{}, {}];
    markersCopy: any = [{}, {}];
    line: any = {};
    devices: any = [];
    vehicles: any = [];

    constructor(private storage: Storage, 
        private datePicker: DatePicker,
        private toast: ToastController,
        private navCtrl: NavController,
        private geolocation: Geolocation,
        private deviceSocket: DeviceSocket,
        private modalCtrl: ModalController,
        private deliveryService: DeliveryService,
        private vehicleService: VehicleService,
        private auth: AuthService) {
    }

    ionViewDidLoad() {
        this.getUser();
        this.storage.get('currentLocation').then( value => {
            if(value) {
                this.map = GoogleMaps.create('map', {
                    camera: {
                        target: {
                            lat: value.lat,
                            lng: value.lng
                        },
                        zoom: 5
                    }
                });

                let coordinates: LatLng = new LatLng(value.lat, value.lng);

                if(this.isEmptyObject(this.markers[0])) {
                    this.setLocationMarker(coordinates);
                }
            } else {
                this.map = GoogleMaps.create('map', {
                    camera: {
                        target: {
                            lat: 12.8797,
                            lng: 121.7740
                        },
                        zoom: 5
                    }
                });
            }
        }).catch( () => {
            this.map = GoogleMaps.create('map', {
                camera: {
                    target: {
                        lat: 12.8797,
                        lng: 121.7740
                    },
                    zoom: 5
                }
            });
        });
        this.listenToSocketStatus();
    }

    listenToSocketStatus() {
        this.deviceSocket.on('connect', () => {
            this.loadMap();
        });
    }

    getVehicles(params) {
        this.storage.get('authToken').then( token => {
            this.vehicleService.getNearby(params, token).subscribe( vehicles => {
                this.vehicles = vehicles['data'] || [];

                this.initWebSockets();
                this.initDevices();
            });
        })
    }

    loadMap() {
        this.geolocation.getCurrentPosition().then( response => {
            this.lat = response.coords.latitude;
            this.lng = response.coords.longitude;

            let coordinates: LatLng = new LatLng(this.lat, this.lng);

            if(this.isEmptyObject(this.markers[0])) {
                this.setLocationMarker(coordinates);
            }
        });
    }

    setLocationMarker(coordinates) {
        this.map.setCameraTarget(coordinates);
        this.map.setCameraZoom(13);
        let marker = this.map.addMarkerSync({
            icon: 'assets/imgs/user-marker.png',
            position: {
                lat: coordinates.lat,
                lng: coordinates.lng
            }
        });
        this.markers[0] = marker;
        this.getVehicles({lat: coordinates.lat, lng: coordinates.lng});
    }

    initDevices() {
        for(let i = 0; i < this.vehicles.length; i++) {
            this.deviceSocket.emit('subscribe', {
                topic: '/device/' + this.vehicles[i].ownerId + '/pub/' + this.vehicles[i].pairedDevice.deviceId
            });
        }
    }

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            let splits = data.payload.split(',');

            let lat = splits[0];
            let lng = splits[1];

            let deviceId = data.topic;
            deviceId = deviceId.split('/');
            deviceId = deviceId[4];

            let index = this.markersCopy.findIndex( vehicle => vehicle.deviceId == deviceId);

            if(index != -1) {
                this.markers[index].setPosition({
                    lat: lat,
                    lng: lng
                });
            } else {
                let marker = this.map.addMarkerSync({
                    icon: 'assets/imgs/marker.png',
                    position: {
                        lat: lat,
                        lng: lng
                    }
                });
                this.markers.push(marker);
                this.markersCopy.push( {deviceId: deviceId});
            }
        });
    }

    getUser() {
        this.storage.get('authToken').then( token => {
            this.user = this.auth.decodeToken(token);
        });
    }

    visitPage(page) {
        if(page > this.currentPage) {if(this.currentPage == 1) {
            if(page == 2) {
                if(!(this.selectedDate && this.selectedTime && this.deliveryObj.pickupLocation)) { 
                    this.errorVisitingPage();
                    return;
                }
            } else {
                return;
            }

        } else if(this.currentPage == 2) {
            if(page == 3) {
                if(!(this.deliveryObj.destination && this.deliveryObj.custom.receiverContactNumber)) {
                    this.errorVisitingPage();
                    return;
                }
            } else {
                return;
            }

        } else if(this.currentPage == 3) {
                if(page == 4) {
                    if(!(this.deliveryObj.packageType && this.deliveryObj.weight && this.length && this.width && this.height)) {
                        this.errorVisitingPage();
                        return;
                    }
                } else {
                    return;
                }
            }
        }

        this.currentPage = page;
    }

    errorVisitingPage() {
        let toast = this.toast.create({
            message: 'Fields must be filled up before proceeding',
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }

    sendRequest(delivery) {
        this.isSaving = true;
        delivery.ownerId = 'null';
        delivery.driver = 'null';
        delivery.pickupDate = new Date(this.selectedDate + ' ' + this.selectedTime).getTime();
        delivery.deliveryStatus = 'pending.clientRequest';
        delivery.custom.senderEmail = this.user.email;
        delivery.custom.senderContactNumber = this.user.custom.contactNumber;
        delivery.custom.pickupLocationAddressString = this.selectedPickup;
        delivery.custom.destinationAddressString = this.selectedDestination;
        delivery.dimension = this.length.toString() + 'x' + this.width.toString() + 'x' + this.height.toString();
        this.storage.get('authToken').then( token => {
            this.deliveryService.create(delivery, token).subscribe( () => {
                let toast = this.toast.create({
                    message: 'Request has been sent',
                    duration: 3000,
                    position: 'bottom'
                });
                toast.present();
                this.isSaving = false;
                this.navCtrl.pop();
            });
        });
    }

    selectDate(event) {
        event.stopPropagation();
        this.datePicker.show({
            date: new Date(),
            mode: 'date',
            androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        }).then(
            date => this.selectedDate = this.formatDate(date),
            err => console.log('Error occurred while getting date: ', err)
        );
    }

    formatTime(time) {
        // Check correct time format and split into components
        if(time) {
            time = time.toString().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
      
            if (time.length > 1) { // If time format correct
              time = time.slice (1);  // Remove full string match value
              time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
              time[0] = +time[0] % 12 || 12; // Adjust hours
            }
            return time.join (''); // return adjusted time or original string
        }

        return time;
    }

    formatDate(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];
      
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
      
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    isEmptyObject(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    showModal(type) {
        if(type === 'destination') {
            let modal = this.modalCtrl.create('SearchAddressPage');
            modal.onDidDismiss( data => {
                if(data){
                    this.selectedDestination = data.description;
    
                    this.geocoder = new google.maps.Geocoder();
    
                    this.geocoder.geocode({address: data.description}, (results, status) => {
                        if( status == 'OK') {
                            this.deliveryObj.destination = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();

                            if(!this.isEmptyObject(this.markers[1])) {
                                this.markers[1].setPosition({
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng()
                                });
                            } else {
                                let marker = this.map.addMarkerSync({
                                    icon: 'assets/imgs/user-marker.png',
                                    position: {
                                        lat: results[0].geometry.location.lat(),
                                        lng: results[0].geometry.location.lng()
                                    }
                                });
                                this.markers[1] = marker;
                            }

                            let pickUpCoordinates = this.deliveryObj.pickupLocation.split(',');

                            let points = [
                                {
                                    lat: pickUpCoordinates[0],
                                    lng: pickUpCoordinates[1]
                                },
                                {
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng()
                                }
                            ];

                            if(!this.isEmptyObject(this.line)) {
                                let pickupCoordinates = this.deliveryObj.pickupLocation.split(',');

                                let points = [
                                    {
                                        lat: parseFloat(pickupCoordinates[0]),
                                        lng: parseFloat(pickupCoordinates[1])
                                    },
                                    {
                                        lat: results[0].geometry.location.lat(), 
                                        lng: results[0].geometry.location.lng() 
                                    }
                                ];

                                this.line.setPoints(points);
                            } else {
                                this.line = this.map.addPolylineSync({
                                    points: points,
                                    color : '#1B747D',
                                    width: 8,
                                    geodesic: true
                                });
                            }
                        }
                    });
                }
            });
    
            modal.present();
        } else {
            let modal = this.modalCtrl.create('SearchAddressPage', {
                mode: 'pickup'
            });
            modal.onDidDismiss( data => {
                if(data){
                    this.selectedPickup = data.description;
    
                    this.geocoder = new google.maps.Geocoder();
    
                    this.geocoder.geocode({address: data.description}, (results, status) => {
                        if( status == 'OK') {
                            this.deliveryObj.pickupLocation = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();

                            if(!this.isEmptyObject(this.markers[0])) {
                                this.markers[0].setPosition({
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng()
                                });
                            } else {
                                let marker = this.map.addMarkerSync({
                                    icon: 'assets/imgs/user-marker.png',
                                    position: {
                                        lat: results[0].geometry.location.lat(),
                                        lng: results[0].geometry.location.lng()
                                    }
                                });
                                this.markers[0] = marker;
                            }

                            let coordinates: LatLng = new LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

                            this.map.setCameraTarget(coordinates);
                            this.map.setCameraZoom(13);

                            if(!this.isEmptyObject(this.line)) {
                                let destinationCoordinates = this.deliveryObj.destination.split(',');

                                let points = [
                                    {
                                        lat: results[0].geometry.location.lat(),
                                        lng: results[0].geometry.location.lng()
                                    },
                                    {
                                        lat: parseFloat(destinationCoordinates[0]),
                                        lng: parseFloat(destinationCoordinates[1])
                                    }
                                ];

                                this.line.setPoints(points);
                            }
                        }
                    });
                }
            });
    
            modal.present();
        }
    }

}