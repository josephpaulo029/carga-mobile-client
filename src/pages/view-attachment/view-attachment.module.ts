import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ViewAttachmentPage } from './view-attachment';

@NgModule({
  declarations: [
    ViewAttachmentPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewAttachmentPage),
  ],
  exports: [
    ViewAttachmentPage
  ]
})
export class ViewAttachmentPageModule { }
