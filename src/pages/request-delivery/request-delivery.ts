import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, ToastController, NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthService } from '../../providers/auth.api';
import { DeliveryService } from '../../providers/delivery.api';
import { DatePicker } from '@ionic-native/date-picker';
import { tileLayer, latLng, marker, icon, polyline } from 'leaflet';
import { DeviceSocket } from '../../providers/devicesocket.service';

declare var google:any;

@IonicPage()
@Component({
  selector: 'page-request-delivery',
  templateUrl: 'request-delivery.html',
  providers: [AuthService, DeliveryService, DeviceSocket]
})
export class RequestDeliveryPage {
    @ViewChild('map-small') mapContainer: ElementRef;
    map: any;
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
        zoom: 5,
        center: latLng(12.8797, 121.7740)
    };

    layers: any = [];

    constructor(private storage: Storage, 
        private datePicker: DatePicker,
        private toast: ToastController,
        private navCtrl: NavController,
        private deviceSocket: DeviceSocket,
        private modalCtrl: ModalController,
        private deliveryService: DeliveryService,
        private auth: AuthService) {
    }

    ionViewWillEnter() {
        this.getUser();
        this.initDevices();
        this.initWebSockets();
    }

    initDevices() {
        const username = 'owner12';
        const deviceId = 'x1002';
        const topic = '/device/' + username + '/pub/' + deviceId;

        this.deviceSocket.emit('subscribe', {
            topic: topic
        });
    }

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            this.layers = [];
            let splits = data.payload.split(',');

            let lat = splits[0];
            let long = splits[1];
            this.layers.push( marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/marker.png'
                })
            }));
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
        let modal = this.modalCtrl.create('SearchAddressPage');
        if(type === 'destination') {
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