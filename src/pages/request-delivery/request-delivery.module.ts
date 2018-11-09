import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { RequestDeliveryPage } from './request-delivery';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [
    RequestDeliveryPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestDeliveryPage),
    LeafletModule.forRoot()
  ],
  exports: [
    RequestDeliveryPage
  ]
})
export class RequestDeliveryPageModule { }
