import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { RequestDeliveryPage } from './request-delivery';

@NgModule({
  declarations: [
    RequestDeliveryPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestDeliveryPage),
  ],
  exports: [
    RequestDeliveryPage
  ]
})
export class RequestDeliveryPageModule { }
