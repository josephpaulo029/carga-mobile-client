import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

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

    constructor(public viewCtrl: ViewController) { 
    }

    ionViewWillEnter() {
        this.acService = new google.maps.places.AutocompleteService();
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