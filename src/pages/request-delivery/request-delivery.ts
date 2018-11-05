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
            attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 10
        }).addTo(this.map);

        this.map.locate({
            setView: true,
            maxZoom: 5
        }).on('locationfound', (e) => {
            let markerGroup = leaflet.featureGroup();
            let marker: any = leaflet.marker([12.8797, 121.7740]).on('click', () => {
              alert('Marker clicked');
            })
            markerGroup.addLayer(marker);
            this.map.addLayer(markerGroup);
            }).on('locationerror', (err) => {
              alert(err.message);
        })
    }

    visitPage(page) {
        if(page == 4) {
            if(!(this.selectedDate && this.selectedTime 
                && this.deliveryObj.pickupLocation && this.deliveryObj.destination 
                && this.deliveryObj.custom.receiverContactNumber && this.deliveryObj.packageType 
                && this.deliveryObj.weight && this.deliveryObj.dimension)) {
                    this.errorVisitingPage();
                    return;
            }
        }

        if(page > this.currentPage) {
            if(this.currentPage == 1) {
                if(!(this.selectedDate && this.selectedTime && this.deliveryObj.pickupLocation)) {
                    this.errorVisitingPage();
                    return;
                }
    
            } else if(this.currentPage == 2) {
                if(!(this.deliveryObj.destination && this.deliveryObj.custom.receiverContactNumber)) {
                    this.errorVisitingPage();
                    return;
                }
    
            } else if(this.currentPage == 3) {
                if(!(this.deliveryObj.packageType && this.deliveryObj.weight & this.deliveryObj.dimension)) {
                    this.errorVisitingPage();
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
        delivery.ownerId = 'owner12';
        delivery.driver = 'null';
        delivery.pickupDate = new Date(this.selectedDate + ' ' + this.selectedTime).getTime();
        delivery.deliveryStatus = 'pending.clientRequest';
        delivery.custom.senderEmail = this.user.email;
        delivery.custom.senderContactNumber = this.user.custom.contactNumber;
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