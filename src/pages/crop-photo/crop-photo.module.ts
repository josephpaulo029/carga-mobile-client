import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageCropperModule } from 'ngx-image-cropper';

import { CropPhotoPage } from './crop-photo';

@NgModule({
  declarations: [
    CropPhotoPage,
  ],
  imports: [
    ImageCropperModule,
    IonicPageModule.forChild(CropPhotoPage),
  ],
  exports: [
    CropPhotoPage
  ]
})
export class CropPhotoPageModule { }
