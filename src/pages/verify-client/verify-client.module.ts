import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { VerifyClientPage } from './verify-client';

@NgModule({
  declarations: [
    VerifyClientPage,
  ],
  imports: [
    IonicPageModule.forChild(VerifyClientPage),
  ],
  exports: [
    VerifyClientPage
  ]
})
export class VerifyClientPageModule { }
