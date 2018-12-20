import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AttachmentsPage } from './attachments';

@NgModule({
  declarations: [
    AttachmentsPage,
  ],
  imports: [
    IonicPageModule.forChild(AttachmentsPage),
  ],
  exports: [
    AttachmentsPage
  ]
})
export class AttachmentsPageModule { }
