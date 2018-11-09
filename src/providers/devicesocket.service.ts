import { Injectable, NgModule } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { environment } from '../environments/environment'; 

@Injectable()
export class DeviceSocket extends Socket {
 
    constructor() {
        super({ url: environment.socketUrl, options: {} });
    }
 
}