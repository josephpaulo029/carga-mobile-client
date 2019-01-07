import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@IonicPage()
@Component({
    selector: 'page-search-address',
    templateUrl: 'search-address.html'
})
export class SearchAddressPage {

    autocompleteItems: any = [];
    autocomplete: any = {
        query: ''
    };
    acService:any;
    placesService: any;
    isPickUp: Boolean = false;
    loading: any;

    constructor(public viewCtrl: ViewController, 
        private geolocation: Geolocation,
        private alertCtrl: AlertController,
        private toast: ToastController,
        private loadingCtrl: LoadingController,
        private params: NavParams) { 
            if(params.get('mode')) this.isPickUp = true;
    }

    ionViewWillEnter() {
        this.acService = new google.maps.places.AutocompleteService();

        if(this.isPickUp) {
            let alert = this.alertCtrl.create({
                title: 'Use current location?',
                message: 'Do you want to use your current location for pick up?',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {

                        }
                    },
                    {
                        text: 'Ok',
                        handler: () => {
                            this.loading = this.loadingCtrl.create({
                                content: 'Please wait...',
                            });
                            this.loading.present();
                            this.getLocation();
                        }
                    }
                ]
            });
            alert.present();
        }
    }

    getLocation() {
        let counter = 0;
        
        let timeout = setTimeout( () => {
            let toast = this.toast.create({
                message: 'Sorry we cannot fetch your location. Please try again.',
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            this.loading.dismiss();
            this.viewCtrl.dismiss();
            return;
        }, 10000);
        this.geolocation.getCurrentPosition().then( response => {
            let lat = response.coords.latitude;
            let long = response.coords.longitude;

            let latLng = {
                lat: lat,
                lng: long
            };
            let geocoder = new google.maps.Geocoder;

            geocoder.geocode({location: latLng}, (results, status) => {
                if(status == 'OK') {
                    this.autocomplete.query = results[0].formatted_address;
                    this.loading.dismiss();
                    this.viewCtrl.dismiss({
                        description: this.autocomplete.query
                    });
                    clearTimeout(timeout);
                    return;
                } else {
                    let toast = this.toast.create({
                        message: 'Sorry we cannot fetch your location. Please try again.',
                        duration: 3000,
                        position: 'bottom'
                    });
                    toast.present();
                    this.loading.dismiss();
                    return;
                }
            }, (err) => {
                let toast = this.toast.create({
                    message: 'Sorry we cannot fetch your location. Please try again.',
                    duration: 3000,
                    position: 'bottom'
                });
                toast.present();
                this.loading.dismiss();
                return;
            });
        }).catch( error => {
            let toast = this.toast.create({
                message: 'Sorry we cannot fetch your location. Please try again.',
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
            this.loading.dismiss();
            return;
        });
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    chooseItem(item: any) {
        this.viewCtrl.dismiss(item);
    }

    updateSearch() {
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        let self = this;
        let config = { 
            types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
            input: this.autocomplete.query,
            componentRestrictions: {country: 'ph'}
        }
        this.acService.getPlacePredictions(config, function (predictions, status) {
            self.autocompleteItems = [];            
            predictions.forEach(function (prediction) {              
                self.autocompleteItems.push(prediction);
            });
        });
    }

}