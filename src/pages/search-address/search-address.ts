import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
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

    constructor(public viewCtrl: ViewController, 
        private geolocation: Geolocation,
        private params: NavParams) { 
        console.log('test', params.get('mode'));
        if(params.get('mode')) this.isPickUp = true;
    }

    ionViewWillEnter() {
        this.acService = new google.maps.places.AutocompleteService();

        // if(this.isPickUp) {
        //     this.getLocation();
        // }
    }

    getLocation() {
        this.geolocation.getCurrentPosition().then( response => {
            let lat = response.coords.latitude;
            let long = response.coords.longitude;
            console.log('lat', lat);
            console.log('long', long);

            let latLng = {
                lat: lat,
                lng: long
            };
            let geocoder = new google.maps.Geocoder;

            geocoder.geocode({location: latLng}, (results, status) => {
                if(status == 'OK') {
                    this.autocomplete.query = results[0].formatted_address;

                    this.updateSearch();
                }
            })
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