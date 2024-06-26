import {Component, inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImageCroppedEvent, ImageCropperModule} from "ngx-image-cropper";
import {NgForOf, NgIf} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {Race} from "../../model/race";
import {NzMessageService} from "ng-zorro-antd/message";
import {RaceService} from "../../database/race.service";
import {NzModalRef} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-race-creation-popup',
  standalone: true,
  imports: [
    FormsModule,
    ImageCropperModule,
    NgForOf,
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzColDirective,
    NzDatePickerComponent,
    NzDividerComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzOptionComponent,
    NzRowDirective,
    NzSelectComponent,
    NzSpinComponent,
    NzWaveDirective,
    ReactiveFormsModule
  ],
  templateUrl: './race-creation-popup.component.html',
  styleUrl: './race-creation-popup.component.less'
})
export class RaceCreationPopupComponent {
  #afs = inject(Storage);

  #raceService = inject(RaceService);

  #notification = inject(NzMessageService);

  #ref = inject(NzModalRef);

  public imageChangedEvent: any = '';
  public croppedImage: any = '';
  public savingImage = false;

  newRaceForm = new FormGroup({
    name: new FormControl('', Validators.required),
    start: new FormControl<number>(Date.now()),
    type: new FormControl('', Validators.required),
    phases: new FormArray<FormControl<string | null>>([]),
    banner: new FormControl('', Validators.required)
  });

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
  }

  setBanner() {
    const raceName = this.newRaceForm.getRawValue().name as string;
    this.savingImage = true;
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const fileRef = ref(this.#afs, `race-banners/${raceName}-banner.png`);
        uploadBytesResumable(fileRef, blob, {contentType: 'image/png'}).then(snap => {
          getDownloadURL(snap.ref).then(url => {
            this.newRaceForm.patchValue({
              banner: url
            });
            this.savingImage = false;
            this.#notification.success('Banner has been uploaded');
          })
        });
      });
  }

  removePhase(index: number): void {
    this.newRaceForm.controls.phases.removeAt(index);
  }

  addPhase(): void {
    this.newRaceForm.controls.phases.push(new FormControl(`P${this.newRaceForm.controls.phases.length + 1}`, Validators.required))
  }

  createRace(): void {
    const race: Race = {
      ...(this.newRaceForm.getRawValue() as any),
      teams: []
    };

    this.#raceService.addOne(race).subscribe(() => {
      this.#notification.success('Race has been created !');
      this.newRaceForm.reset();
      this.croppedImage = '';
      this.#ref.close();
    });
  }
}
