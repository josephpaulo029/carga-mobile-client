import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { tileLayer, latLng, marker, icon, Map } from 'leaflet';
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
    map: Map;
    options = {
        layers: [
            tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        ],
        zoom: 6,
        attributionControl: false,
        center: latLng(12.8797, 121.7740)
    };
    layers: any = [];
    layersCopy: any = [{}];
    devices: any = [];
    vehicles: any = [];
    lat: any;
    lng: any;

    constructor(private navCtrl: NavController, 
        private geolocation: Geolocation,
        private storage: Storage,
        private vehicleService: VehicleService,
        private deviceSocket: DeviceSocket) {

    }

    ionViewWillEnter() {
    }

    getVehicles(params) {
        this.storage.get('authToken').then( token => {
            this.vehicleService.getNearby(params, token).subscribe( vehicles => {
                this.vehicles = vehicles['data'] || [];

                this.initWebSockets();
                this.initDevices();
            });
        })
    }

    initDevices() {
        for(let i = 0; i < this.vehicles.length; i++) {
            this.deviceSocket.emit('subscribe', {
                topic: '/device/' + this.vehicles[i].ownerId + '/pub/' + this.vehicles[i].pairedDevice.deviceId
            });
        }
    }

    onMapReady(map: Map) {
        this.map = map
        this.geolocation.getCurrentPosition().then( response => {
            this.lat = response.coords.latitude;
            this.lng = response.coords.longitude;

            // this.storage.set('location', {lat: this.lat, lng: this.lng});
            
            this.map.setView(latLng(this.lat, this.lng), 13);
            this.layers[0] = marker([ this.lat, this.lng ], {
                icon: icon({
                    iconUrl: 'assets/imgs/user-marker.png'
                })
            });

            this.getVehicles({lat: this.lat, lng: this.lng});
        });
        
        let watch = this.geolocation.watchPosition();
        watch.subscribe( data => {
            this.lat = data.coords.latitude;
            this.lng = data.coords.longitude;
            this.layers[0] = marker([ this.lat, this.lng ], {
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

            let deviceId = data.topic;
            deviceId = deviceId.split('/');
            deviceId = deviceId[4];

            let index = this.layersCopy.findIndex( vehicle => vehicle.deviceId == deviceId);

            if(index != -1) {
                this.layers[index] = marker([ lat, long ], {
                    icon: icon({
                        iconUrl: 'assets/imgs/marker.png'
                    })
                });
            } else {
                this.layers.push( marker([ lat, long ], {
                    icon: icon({
                        iconUrl: 'assets/imgs/marker.png'
                    })
                }) );
                this.layersCopy.push( {deviceId: deviceId});
            }
        });
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}