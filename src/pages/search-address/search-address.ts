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
        console.log('modal > chooseItem > item > ', item);
        this.viewCtrl.dismiss(item);
    }

    updateSearch() {
        console.log('modal > updateSearch');
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        let self = this;
        let config = { 
            types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
            input: this.autocomplete.query
        }
        this.acService.getPlacePredictions(config, function (predictions, status) {
            console.log('modal > getPlacePredictions > status > ', status);
            self.autocompleteItems = [];            
            predictions.forEach(function (prediction) {              
                self.autocompleteItems.push(prediction);
            });
        });
    }

}