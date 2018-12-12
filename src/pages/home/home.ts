import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DeviceSocket } from '../../providers/devicesocket.service';
import { VehicleService } from '../../providers/vehicle.api';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import {
    GoogleMaps,
    GoogleMap,
    LatLng
} from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [DeviceSocket, VehicleService]
})
export class HomePage {
    map: GoogleMap;
    devices: any = [];
    vehicles: any = [];
    lat: any;
    lng: any;
    markers: any = [];
    markersCopy: any = [{}];
    bounds: LatLng[] = [];

    constructor(private navCtrl: NavController, 
        private geolocation: Geolocation,
        private storage: Storage,
        private vehicleService: VehicleService,
        private deviceSocket: DeviceSocket) {
    }

    ionViewDidLoad() {
        this.storage.get('currentLocation').then( value => {
            if(value) {
                this.map = GoogleMaps.create('map', {
                    camera: {
                        target: {
                            lat: value.lat,
                            lng: value.lng
                        },
                        zoom: 5
                    }
                });
            } else {
                this.map = GoogleMaps.create('map', {
                    camera: {
                        target: {
                            lat: 12.8797,
                            lng: 121.7740
                        },
                        zoom: 5
                    }
                });
            }
        }).catch( () => {
            this.map = GoogleMaps.create('map', {
                camera: {
                    target: {
                        lat: 12.8797,
                        lng: 121.7740
                    },
                    zoom: 5
                }
            });
        });
        this.listenToSocketStatus();
    }

    listenToSocketStatus() {
        this.deviceSocket.on('connect', () => {
            this.loadMap();
        });
    }

    loadMap() {
        this.geolocation.getCurrentPosition().then( response => {
            this.lat = response.coords.latitude;
            this.lng = response.coords.longitude;

            this.storage.set('currentLocation', {
                lat: this.lat,
                lng: this.lng
            });

            let coordinates: LatLng = new LatLng(this.lat, this.lng);
            this.map.setCameraTarget(coordinates);
            this.map.setCameraZoom(13);
            let marker = this.map.addMarkerSync({
                icon: 'assets/imgs/user-marker.png',
                position: {
                    lat: this.lat,
                    lng: this.lng
                }
            });
            this.markers.push(marker);
            this.getVehicles({lat: this.lat, lng: this.lng});
        });

        let watch = this.geolocation.watchPosition();
        watch.subscribe( data => {
            this.lat = data.coords.latitude;
            this.lng = data.coords.longitude;

            this.storage.set('currentLocation', {
                lat: this.lat,
                lng: this.lng
            });

            this.markers[0].setPosition({
                lat: this.lat,
                lng: this.lng
            });
        });
    }

    getVehicles(params) {
        this.storage.get('authToken').then( token => {
            this.vehicleService.getNearby(params, token).subscribe( vehicles => {
                this.vehicles = vehicles['data'] || [];
                
                this.vehicles.map( vehicle => {
                    if(vehicle.currentGPSLocation.latitude && vehicle.currentGPSLocation.longitude) {
                        let marker = this.map.addMarkerSync({
                            icon: 'assets/imgs/marker.png',
                            position: {
                                lat: vehicle.currentGPSLocation.latitude,
                                lng: vehicle.currentGPSLocation.longitude
                            }
                        });
                        this.markers.push(marker);
                        this.markersCopy.push( {deviceId: vehicle.pairedDevice.deviceId});
                    }
                });

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

    initWebSockets() {
        this.deviceSocket.on('server-to-client', data => {
            let splits = data.payload.split(',');

            let lat = splits[0];
            let lng = splits[1];

            let deviceId = data.topic;
            deviceId = deviceId.split('/');
            deviceId = deviceId[4];

            let index = this.markersCopy.findIndex( vehicle => vehicle.deviceId == deviceId);

            if(index != -1) {
                this.markers[index].setPosition({
                    lat: lat,
                    lng: lng
                });
            } else {
                let marker = this.map.addMarkerSync({
                    icon: 'assets/imgs/marker.png',
                    position: {
                        lat: lat,
                        lng: lng
                    }
                });
                this.markers.push(marker);
                this.markersCopy.push( {deviceId: deviceId});
            }
        });
    }

    requestDelivery() {
        this.navCtrl.push('RequestDeliveryPage');
    }

}