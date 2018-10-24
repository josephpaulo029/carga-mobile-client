import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, ToastController, NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthService } from '../../providers/auth.api';
import { DeliveryService } from '../../providers/delivery.api';
import { DatePicker } from '@ionic-native/date-picker';
import leaflet from 'leaflet';

declare var google:any;

@IonicPage()
@Component({
  selector: 'page-request-delivery',
  templateUrl: 'request-delivery.html',
  providers: [AuthService, DeliveryService]
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

    constructor(private storage: Storage, 
        private datePicker: DatePicker,
        private toast: ToastController,
        private navCtrl: NavController,
        private modalCtrl: ModalController,
        private deliveryService: DeliveryService,
        private auth: AuthService) {
    }

    ionViewDidEnter() {
        this.getUser();
        this.loadMap();
    }

    getUser() {
        this.storage.get('authToken').then( token => {
            this.user = this.auth.decodeToken(token);
        });
    }

    loadMap() {
        this.map = leaflet.map("map-small").fitWorld();
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attributions: 'www.tphangout.com',
        maxZoom: 18
        }).addTo(this.map);
    }

    sendRequest(delivery) {
        this.isSaving = true;
        delivery.ownerId = 'test';
        delivery.driver = 'null';
        delivery.pickupDate = new Date(this.selectedDate + ' ' + this.selectedTime).getTime();
        delivery.deliveryStatus = 'pending.clientRequest';
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
        console.log('test');
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

    isValid() {
        if(this.selectedDate && this.selectedTime 
            && this.deliveryObj.pickupLocation && this.deliveryObj.destination 
            && this.deliveryObj.custom.receiverContactNumber && this.deliveryObj.packageType 
            && this.deliveryObj.weight & this.deliveryObj.dimension)
            return true;
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
            this.deliveryObj.destination = '';
            modal.onDidDismiss( data => {
                if(data){
                    console.log('data', data.description);
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
            this.deliveryObj.pickupLocation = '';
            modal.onDidDismiss( data => {
                if(data){
                    console.log('data', data.description);
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