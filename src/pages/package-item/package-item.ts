import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { DeliveryService } from '../../providers/delivery.api';
import { Geolocation } from '@ionic-native/geolocation';
import { DeviceSocket } from '../../providers/devicesocket.service';
import { Storage } from '@ionic/storage';
import {
    GoogleMaps,
    GoogleMap,
    LatLng,
    LatLngBounds
} from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-package-item',
  templateUrl: 'package-item.html',
  providers: [DeliveryService]
})
export class PackageItemPage {
    
    deliveryId: any;
    package: any = {};
    isLoading: Boolean = false;
    map: GoogleMap;
    markers: any = [{}, {}];
    markersCopy: any = [{}, {}];
    lat: any;
    lng: any;

    constructor(public navParams: NavParams, 
        private storage: Storage,
        private deviceSocket: DeviceSocket,
        private geolocation: Geolocation,
        private deliveryService: DeliveryService) {
    }

    ionViewDidLoad() {
        this.deliveryId = this.navParams.get('deliveryId');
        this.map = GoogleMaps.create('map', {
            camera: {
                target: {
                    lat: 12.8797,
                    lng: 121.7740
                },
                zoom: 5
            }
        });
        this.getDelivery();
    }

    getDelivery() {
        this.isLoading = true;
        this.storage.get('authToken').then( token => {
            this.deliveryService.getOne(this.deliveryId, token).subscribe( data => {
                this.isLoading = false;
                this.package = data['data'];

                this.loadMap();

                if(this.package.deliveryStatus == 'inProgress.driverAccepted' || 
                    this.package.deliveryStatus == 'inProgress.driverForPickup' || 
                    this.package.deliveryStatus == 'inProgress.driverEnRoute' ||
                    this.package.deliveryStatus == 'inProgress.driverForDropoff') {
                    let index = this.markersCopy.findIndex( vehicle => vehicle.deviceId == this.package.vehicleInfo.pairedDevice.deviceId);

                    if(index != -1) {
                        this.markers[1].setPosition({
                            lat: this.package.vehicleInfo.currentGPSLocation.latitude,
                            lng: this.package.vehicleInfo.currentGPSLocation.longitude
                        });
                    } else {
                        let marker = this.map.addMarkerSync({
                            icon: 'assets/imgs/marker.png',
                            position: {
                                lat: this.package.vehicleInfo.currentGPSLocation.latitude,
                                lng: this.package.vehicleInfo.currentGPSLocation.longitude
                            }
                        });
                        this.markers[1] = marker;
                        this.markersCopy[1] = {deviceId: this.package.vehicleInfo.pairedDevice.deviceId};
                    }
                    let coordinates: LatLng = new LatLng(this.package.vehicleInfo.currentGPSLocation.latitude, this.package.vehicleInfo.currentGPSLocation.longitude);
                    this.map.setCameraTarget(coordinates);
                    this.map.setCameraZoom(13);
    
                    this.initDevices();
                    this.initWebSockets();
                } else if(this.package.deliveryStatus == 'completed' || this.package.deliveryStatus == 'pending.clientRequest' || this.package.deliveryStatus == 'pending.ownerAccepted') {
                    let destinationLatLng = this.package.destination.split(',');
                    let pickupLatLng = this.package.pickupLocation.split(',');

                    let marker1= this.map.addMarkerSync({
                        icon: 'assets/imgs/user-marker.png',
                        position: {
                            lat: pickupLatLng[0],
                            lng: pickupLatLng[1]
                        }
                    });
                    this.markers[0] = marker1;

                    let marker2 = this.map.addMarkerSync({
                        icon: 'assets/imgs/user-marker.png',
                        position: {
                            lat: destinationLatLng[0],
                            lng: destinationLatLng[1]
                        }
                    });
                    this.markers[1] = marker2;

                    let points = [
                        {
                            lat: pickupLatLng[0],
                            lng: pickupLatLng[1]
                        },
                        {
                            lat: destinationLatLng[0],
                            lng: destinationLatLng[1]
                        }
                    ];

                    this.map.addPolylineSync({
                        points: points,
                        color : '#1B747D',
                        width: 8,
                        geodesic: true
                    });
                }
            });
        });
    }

    isEmptyObject(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    loadMap() {
        if(this.package.deliveryStatus == 'completed' || this.package.deliveryStatus == 'pending.clientRequest' || this.package.deliveryStatus == 'pending.ownerAccepted') {
            let pickupLocation = this.package.pickupLocation.split(',');
            let pickupCoordinates: LatLng = new LatLng(pickupLocation[0], pickupLocation[1]);
            this.map.setCameraTarget(pickupCoordinates);
            this.map.setCameraZoom(13);
        } else if(this.package.deliveryStatus == 'inProgress.driverAccepted' || this.package.deliveryStatus == 'inProgress.driverForPickup') {
            let pickupLocation = this.package.pickupLocation.split(',');
            let marker = this.map.addMarkerSync({
                icon: 'assets/imgs/user-marker.png',
                position: {
                    lat: pickupLocation[0],
                    lng: pickupLocation[1]
                }
            });
            this.markers[0] = marker;
        } else if(this.package.deliveryStatus == 'inProgress.driverEnRoute' || this.package.deliveryStatus == 'inProgress.driverForDropoff') {
            let destination = this.package.destination.split(',');
            let marker = this.map.addMarkerSync({
                icon: 'assets/imgs/user-marker.png',
                position: {
                    lat: destination[0],
                    lng: destination[1]
                }
            });
            this.markers[0] = marker;
        }
    }

    initDevices() {
        this.deviceSocket.emit('subscribe', {
            topic: '/device/' + this.package.ownerId + '/pub/' + this.package.vehicleInfo.pairedDevice.deviceId
        });
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
                this.markers[1].setPosition({
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
                this.markers[1] = marker;
                this.markersCopy[1] = {deviceId: deviceId};
            }
        });
    }

}