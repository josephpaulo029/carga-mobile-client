import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SearchAddressPage } from './search-address';

@NgModule({
  declarations: [
    SearchAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchAddressPage),
  ],
  exports: [
    SearchAddressPage
  ]
})
export class SearchAddressPageModule { }
