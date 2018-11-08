import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PackageItemPage } from './package-item';

@NgModule({
  declarations: [
    PackageItemPage,
  ],
  imports: [
    IonicPageModule.forChild(PackageItemPage),
  ],
  exports: [
    PackageItemPage
  ]
})
export class PackageItemPageModule { }
