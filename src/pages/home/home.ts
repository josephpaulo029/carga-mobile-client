import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { tileLayer, latLng, marker, icon, polyline, Map } from 'leaflet';
import { DeviceSocket } from '../../providers/devicesocket.service';
import { VehicleService } from '../../providers/vehicle.api';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [DeviceSocket, VehicleService]
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
    layersCopy: any = [];
    devices: any = [];
    vehicles: any = [];

    constructor(private navCtrl: NavController, 
        private geolocation: Geolocation,
        private storage: Storage,
        private vehicleService: VehicleService,
        private deviceSocket: DeviceSocket) {

    }

    ionViewWillEnter() {
        this.listenToSocketStatus();
    }

    listenToSocketStatus() {
        this.deviceSocket.on('connect', () => {
            this.getVehicles();
        });
    }

    getVehicles() {
        this.storage.get('authToken').then( token => {
            this.vehicleService.list({}, token).subscribe( vehicles => {
                this.vehicles = vehicles['data'] || [];

                this.initWebSockets();
                this.initDevices();
            });
        })
    }

    initDevices() {
        for(let i = 0; i < this.vehicles.length; i++) {
            this.deviceSocket.emit('subscribe', {
                topic: '/device/' + this.vehicles[i].pairedDriver.username + '/pub/' + this.vehicles[i].pairedDevice.deviceId
            });
        }
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
                })
            });
        });
    }

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            console.log('data', data);
            let splits = data.payload.split(',');

            let lat = splits[0];
            let long = splits[1];
            this.layers[1] = marker([ lat, long ], {
                icon: icon({
                    iconUrl: 'assets/imgs/marker.png'
                })
            });

            for(let index = 1; index <= this.vehicles.length; index++) {
                this.layers[index] = marker([lat, long], {
                    icon: icon({
                        iconUrl: 'assets/imgs/user-marker.png'
                    })
                });

                this.layersCopy[index] = this.vehicles[index - 1].pairedDevice.deviceId;
            }
        });
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}