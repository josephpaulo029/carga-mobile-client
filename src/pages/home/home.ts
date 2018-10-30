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

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}