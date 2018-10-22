import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import leaflet from 'leaflet';

@IonicPage()
@Component({
  selector: 'page-request-delivery',
  templateUrl: 'request-delivery.html'
})
export class RequestDeliveryPage {
    @ViewChild('map-small') mapContainer: ElementRef;
    map: any;
    requestObj: any = {};
    constructor() {

    }

    ionViewDidEnter() {
        this.loadMap();
    }

    loadMap() {
        this.map = leaflet.map("map-small").fitWorld();
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attributions: 'www.tphangout.com',
        maxZoom: 18
        }).addTo(this.map);
    }

}