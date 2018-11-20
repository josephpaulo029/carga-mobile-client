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

    options = {
        layers: [
            tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        ],
        zoom: 6,
        center: latLng(12.8797, 121.7740)
    };

    layers: any = [];
    layersCopy: any = [];
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

    ionViewWillEnter() {
        this.getUser();
        this.listenToSocketStatus();
    }

    listenToSocketStatus() {
        this.deviceSocket.on('connect', () => {
            this.getVehicles();
        });
    }

    getVehicles() {
        this.storage.get('authToken').then( token => {
            this.vehicleService.list({}, token).subscribe( vehicles => {
                this.vehicles = vehicles['data'] || [];

                this.initWebSockets();
                this.initDevices();
            });
        })
    }

    onMapReady(map: Map) {
        this.geolocation.getCurrentPosition().then( response => {
            let lat = response.coords.latitude;
            let long = response.coords.longitude;
            
            map.setView(latLng(lat, long), 13);
            this.layers[0] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/user-marker.png'
                })
            });
        });
        
        let watch = this.geolocation.watchPosition();
        watch.subscribe( data => {
            let lat = data.coords.latitude;
            let long = data.coords.longitude;
            this.layers[0] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/user-marker.png'
                }),
            });
        });
    }

    initDevices() {
        console.log('devices', this.devices);
        for(let i = 0; i < this.vehicles.length; i++) {
            console.log('vehicles', this.vehicles);            
            this.deviceSocket.emit('subscribe', {
                topic: '/device/' + this.vehicles[i].pairedDriver.username + '/pub/' + this.vehicles[i].pairedDevice.deviceId
            });
            console.log('test','/device/' + this.vehicles[i].pairedDriver.username + '/pub/' + this.vehicles[i].pairedDevice.deviceId );
        }
        // const username = 'new.driver.1';
        // const deviceId = '1234';
        // const topic = '/device/' + username + '/pub/' + deviceId;

        // this.deviceSocket.emit('subscribe', {
        //     topic: topic
        // });
    }

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            console.log('data', data);
            let splits = data.payload.split(',');

            let lat = splits[0];
            let long = splits[1];
            this.layers[1] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/marker.png'
                })
            });

            for(let index = 1; index <= this.vehicles.length; index++) {
                this.layers[index] = marker([lat, long], {
                    icon: icon({
                        iconUrl: 'assets/imgs/user-marker.png'
                    })
                });

                this.layersCopy[index] = this.vehicles[index - 1].pairedDevice.deviceId;
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
                        }
                    });
                }
            });
    
            modal.present();
        }
    }

}