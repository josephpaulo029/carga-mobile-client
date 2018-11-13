import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { tileLayer, latLng, marker, icon, polyline, Map } from 'leaflet';
import { DeviceSocket } from '../../providers/devicesocket.service';
import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [DeviceSocket]
})
export class HomePage {
    @ViewChild('map') mapContainer: ElementRef;
    map: any;
    options = {
        layers: [
            tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        ],
        zoom: 6,
        center: latLng(12.8797, 121.7740)
    };
    layers: any = [];

    constructor(private navCtrl: NavController, 
        private geolocation: Geolocation,
        private deviceSocket: DeviceSocket) {

    }

    ionViewWillEnter() {
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

    onMapReady(map: Map) {
        this.geolocation.getCurrentPosition().then( response => {
            let lat = response.coords.latitude;
            let long = response.coords.longitude;
            
            map.setView(latLng(lat, long), 13);
            this.layers[0] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/user-marker.png'
                })
            });
        });
        
        let watch = this.geolocation.watchPosition();
        watch.subscribe( data => {
            let lat = data.coords.latitude;
            let long = data.coords.longitude;
            this.layers[0] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/user-marker.png'
                }),
                
            });
        });
    }

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            let splits = data.payload.split(',');

            let lat = splits[0];
            let long = splits[1];
            this.layers[1] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/marker.png'
                })
            });
        });
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}