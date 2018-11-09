import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { tileLayer, latLng, marker, icon, polyline } from 'leaflet';
import { DeviceSocket } from '../../providers/devicesocket.service';

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
        zoom: 5,
        center: latLng(12.8797, 121.7740)
    };

    layers: any = [];

    constructor(private navCtrl: NavController, private deviceSocket: DeviceSocket) {

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

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            this.layers = [];
            let splits = data.payload.split(',');

            let lat = splits[0];
            let long = splits[1];
            this.layers.push( marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/marker.png'
                })
            }));
        });
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}