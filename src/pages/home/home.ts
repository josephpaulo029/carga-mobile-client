import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import leaflet from 'leaflet';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    @ViewChild('map') mapContainer: ElementRef;
    map: any;

    constructor(private navCtrl: NavController) {

    }

    ionViewDidEnter() {
        this.loadMap();
    }

    loadMap() {
        this.map = leaflet.map("map").fitWorld();
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attributions: 'www.tphangout.com',
        maxZoom: 18
        }).addTo(this.map);
        
        console.log('this.map', this.map.removeLayer);
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

    ionViewWillLeave() {
        console.log('this.map', this.map.removeLayer);
        this.map.removeLayer();
    }

}