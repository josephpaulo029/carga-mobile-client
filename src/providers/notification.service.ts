import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { url } from './url'; 

@Injectable()
export class NotificationSocket extends Socket {
 
    constructor() {
        super({ url: url.notification, options: {} });
    }
 
}