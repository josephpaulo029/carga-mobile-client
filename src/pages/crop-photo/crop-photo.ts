import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController, NavParams } from 'ionic-angular';
import { AccountService } from '../../providers/account.api';
import { Storage } from '@ionic/storage';
import { UploadService } from '../../providers/upload.api';
import { AuthService } from '../../providers/auth.api';

@IonicPage()
@Component({
  selector: 'page-crop-photo',
  templateUrl: 'crop-photo.html',
  providers: [AccountService, UploadService, AuthService]
})
export class CropPhotoPage {
    imageChangedEvent: any;
    mode: any;
    croppedImage: any;
    isSaving: Boolean = false;
    user: any = {};
    token: any;

    constructor(public navParams: NavParams, 
        private storage: Storage,
        public navCtrl: NavController,
        private accountService: AccountService,
        private authService: AuthService,
        private toast: ToastController,
        private uploadService: UploadService) {

        if(this.navParams.get('imageChangedEvent')) {
            this.imageChangedEvent = this.navParams.get('imageChangedEvent');
        }

        if(this.navParams.get('mode')) {
            this.mode = this.navParams.get('mode');
        }

    }

    ionViewWillEnter() {
        this.getUser();
    }

    uploadPhoto() {
        this.isSaving = true;
        let splitter = this.croppedImage.split(',');
        let croppedImage = {
            base64String: splitter[1]
        };

        this.uploadService.create(croppedImage, this.token).subscribe( data => {
            if(this.mode === 'account') {
                this.user.avatar = data['imageUrl'];

                this.accountService.update(this.user, this.token).subscribe( data => {
                    this.uploadSuccess(data['imageUrl']);
                });
            } else if(this.mode === 'device') {
                this.uploadSuccess(data['imageUrl']);
            }
        });
    }

    uploadSuccess(imageUrl) {
        this.isSaving = false;
        let toast = this.toast.create({
            message: 'Photo has been uploaded.',
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
        this.navCtrl.getPrevious().data.imageUrl = imageUrl;
        this.navCtrl.pop();
    }

    getUser() {
        this.storage.get('authToken').then( token => {
            this.token = token;
            this.user = this.authService.decodeToken(token);
        });
    }

    imageCropped(image: string) {
        this.croppedImage = image;
    }

    imageLoaded() {
        // show cropper
    }

    loadImageFailed() {
        // show message
    }

}