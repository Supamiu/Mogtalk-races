import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzCardModule} from "ng-zorro-antd/card";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {ImageCroppedEvent, ImageCropperModule} from "ngx-image-cropper";
import {RaceService} from "../database/race.service";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from '@angular/fire/storage';
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzUploadModule} from "ng-zorro-antd/upload";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzTagModule} from "ng-zorro-antd/tag";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-races',
  standalone: true,
  imports: [CommonModule, NzCardModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzDatePickerModule, ImageCropperModule, NzSelectModule, NzIconModule, NzUploadModule, NzDividerModule, NzSpinModule, NzTagModule, RouterLink],
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.less']
})
export class RacesComponent {
  newRaceForm = new FormGroup({
    name: new FormControl('', Validators.required),
    start: new FormControl<number>(Date.now()),
    type: new FormControl('', Validators.required),
    phases: new FormArray([
      new FormControl('', Validators.required)
    ], Validators.required),
    banner: new FormControl('')
  });
  public imageChangedEvent: any = '';
  public croppedImage: any = '';
  public savingImage = false;

  public races$ = this.raceService.query();

  constructor(private afs: Storage, private raceService: RaceService,
              private notification: NzMessageService) {
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  setBanner(): void {
    const raceName = this.newRaceForm.getRawValue().name as string;
    this.savingImage = true;
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const fileRef = ref(this.afs, `race-banners/${raceName}-banner.png`);
        uploadBytesResumable(fileRef, blob, {contentType: 'image/png'}).then(snap => {
          getDownloadURL(snap.ref).then(url => {
            this.newRaceForm.patchValue({
              banner: url
            });
            this.savingImage = false;
            this.notification.success('Banner has been uploaded');
          })
        });
      });
  }

  removeBoss(index: number): void {
    this.newRaceForm.controls.phases.removeAt(index);
  }

  addBoss(): void {
    this.newRaceForm.controls.phases.push(new FormControl('', Validators.required))
  }

  createRace(): void {
    this.raceService.addOne({
      ...this.newRaceForm.getRawValue(),
      teams: []
    } as any).subscribe(() => {
      this.notification.success('Race has been created !');
      this.newRaceForm.reset();
      this.croppedImage = '';
    });
  }
}
